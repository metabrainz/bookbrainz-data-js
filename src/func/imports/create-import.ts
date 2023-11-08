/*
 * Copyright (C) 2018  Shivam Tripathi
 *               2023  David Kellner
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */


import {ENTITY_TYPES, type EntityTypeString} from '../../types/entity';
import type {ImportHeaderT, ImportMetadataT, _ImportT} from '../../types/imports';
import type {ParsedEdition, ParsedEntity, QueuedEntity} from '../../types/parser';

import type {ORM} from '../..';
import type {Transaction} from '../types';
import _ from 'lodash';
import {camelToSnake} from '../../util';
import {getAdditionalEntityProps} from '../entity';
import {getOriginSourceId} from './misc';
import {updateAliasSet} from '../alias';
import {updateDisambiguation} from '../disambiguation';
import {updateIdentifierSet} from '../identifier';
import {updateLanguageSet} from '../language';
import {updateReleaseEventSet} from '../releaseEvent';


function createImportRecord(transacting: Transaction, data: _ImportT) {
	return transacting.insert(camelToSnake(data)).into('bookbrainz.import').returning('id');
}

function createOrUpdateImportMetadata(transacting: Transaction, record: ImportMetadataT) {
	return transacting.insert(camelToSnake(record)).into('bookbrainz.link_import')
		.onConflict(['origin_source_id', 'origin_id']).merge();
}

function getImportMetadata(transacting: Transaction, externalSourceId: number, externalIdentifier: string) {
	return transacting.select('import_id', 'entity_id').from('bookbrainz.link_import').where(camelToSnake({
		originId: externalIdentifier,
		originSourceId: externalSourceId
	}));
}

/** IDs of extra data sets which not all entity types have. */
type ExtraDataSetIds = Partial<{
	languageSetId: number;
	releaseEventSetId: number;
}>;

/** IDs of all data sets which an entity can have. */
type DataSetIds = {
	aliasSetId: number;
	disambiguationId: number;
	identifierSetId: number;
} & ExtraDataSetIds;

function createImportDataRecord(transacting: Transaction, dataSets: DataSetIds, importData: QueuedEntity) {
	const {entityType} = importData;

	/* We omit all extra props which are not taken in as args when creating an
	entity_data record, else it will raise error (of there being no such
	column in the table).
	Entity data props use split versions of dates into (day, month and year)
		and not directly dates, so we omit them.
	*/
	const additionalEntityProps = _.omit(
		getAdditionalEntityProps(importData.data, entityType),
		['beginDate', 'endDate']
	);

	const dataRecordProps = {
		...dataSets,
		...additionalEntityProps
	};

	return transacting.insert(camelToSnake(dataRecordProps))
		.into(`bookbrainz.${_.snakeCase(entityType)}_data`)
		.returning('id');
}

function createOrUpdateImportHeader(transacting: Transaction, record: ImportHeaderT, entityType: EntityTypeString) {
	const table = `bookbrainz.${_.snakeCase(entityType)}_import_header`;
	return transacting.insert(camelToSnake(record)).into(table)
		.onConflict('import_id').merge();
}

async function updateEntityExtraDataSets(
	orm: ORM, transacting: Transaction, importData: ParsedEntity
): Promise<ExtraDataSetIds> {
	// Extract all entity data sets' related fields
	const {languages, releaseEvents} = importData as ParsedEdition;

	const dataSets: ExtraDataSetIds = {};

	if (languages) {
		const languageSet = await updateLanguageSet(orm, transacting, null, languages);
		dataSets.languageSetId = languageSet && languageSet.get('id');
	}

	if (releaseEvents) {
		const releaseEventSet = await updateReleaseEventSet(orm, transacting, null, releaseEvents);
		dataSets.releaseEventSetId = releaseEventSet && releaseEventSet.get('id');
	}
	// Skipping publisher field, as they're not required in imports.

	return dataSets;
}

export type ExistingImportAction =
	| 'skip'
	| 'update pending'
	| 'update pending and accepted';

export type ImportOptions = Partial<{

	/** Specifies what should happen if an import with the same external identifier already exists. */
	existingImportAction: ExistingImportAction;
}>;

export type ImportStatus =
	| 'created pending'
	| 'skipped pending'
	| 'unchanged pending'
	| 'updated pending'
	| 'skipped accepted'
	| 'unchanged accepted'
	| 'updated accepted';

export type ImportResult = {

	/** ID of the imported entity (numeric for now, will be a BBID in a future version). */
	importId: number | string;

	/** Import status of the processed entity. */
	status: ImportStatus;
};

export function createImport(orm: ORM, importData: QueuedEntity, {
	existingImportAction = 'skip'
}: ImportOptions = {}): Promise<ImportResult> {
	if (!ENTITY_TYPES.includes(importData.entityType)) {
		throw new Error('Invalid entity type');
	}

	return orm.bookshelf.transaction<ImportResult>(async (transacting) => {
		const {entityType} = importData;
		const {alias, identifiers, disambiguation, source} = importData.data;

		// Get origin_source
		let originSourceId: number = null;

		try {
			originSourceId = await getOriginSourceId(transacting, source);
		}
		catch (err) {
			// TODO: useless, we are only catching our self-thrown errors here
			throw new Error(`Error during getting source id - ${err}`);
		}

		const [existingImport] = await getImportMetadata(transacting, originSourceId, importData.originId);
		if (existingImport) {
			const isPendingImport = !existingImport.entity_id;
			if (existingImportAction === 'skip') {
				return {
					importId: existingImport.import_id,
					status: isPendingImport ? 'skipped pending' : 'skipped accepted'
				};
			}
			else if (isPendingImport) {
				// TODO: update/reuse already existing data of pending imports
			}
			else {
				// The previously imported entity has already been accepted
				if (existingImportAction === 'update pending') {
					// We only want to update pending, but not accepted entities
					return {
						importId: existingImport.import_id,
						status: 'skipped accepted'
					};
				}
				// We also want to create updates for already accepted entities ('update pending and accepted')
				// TODO: implement this feature in a later version and drop the following temporary return statement
				return {
					importId: existingImport.import_id,
					status: 'skipped accepted'
				};
			}
		}

		const [aliasSet, identifierSet, disambiguationObj, entityExtraDataSets] =
			await Promise.all([
				updateAliasSet(orm, transacting, null, null, alias),
				updateIdentifierSet(orm, transacting, null, identifiers),
				updateDisambiguation(orm, transacting, null, disambiguation),
				updateEntityExtraDataSets(orm, transacting, importData.data)
			]);

		// Create entity type-specific data record
		let dataId: number = null;
		try {
			const [idObj] = await createImportDataRecord(
				transacting,
				{
					aliasSetId: aliasSet && aliasSet.get('id'),
					disambiguationId: disambiguationObj && disambiguationObj.get('id'),
					identifierSetId: identifierSet && identifierSet.get('id'),
					...entityExtraDataSets
				},
				importData
			);
			dataId = _.get(idObj, 'id');
		}
		catch (err) {
			throw new Error(`Error during dataId creation ${err}`);
		}

		// Create import entity (if it is not already existing from a previous import attempt)
		let importId: number = existingImport?.import_id;
		if (!importId) {
			try {
				const [idObj] = await createImportRecord(transacting, {type: entityType});
				importId = _.get(idObj, 'id');
			}
			catch (err) {
				throw new Error(`Failed to create a new import ID: ${err}`);
			}
		}

		const importMetadata: ImportMetadataT = {
			importId,
			importMetadata: importData.data.metadata,
			importedAt: transacting.raw("timezone('UTC'::TEXT, now())"),
			lastEdited: importData.lastEdited,
			originId: importData.originId,
			originSourceId
		};

		try {
			await createOrUpdateImportMetadata(transacting, importMetadata);
		}
		catch (err) {
			throw new Error(`Failed to upsert import metadata: ${err}`);
		}

		try {
			await createOrUpdateImportHeader(transacting, {dataId, importId}, entityType);
		}
		catch (err) {
			throw new Error(`Failed to upsert import header: ${err}`);
		}

		return {
			importId,
			status: existingImport ? 'updated pending' : 'created pending'
		};
	});
}
