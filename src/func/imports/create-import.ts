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


import {ENTITY_TYPES, EntityT, type EntityTypeString} from '../../types/entity';
import type {ImportHeaderT, ImportMetadataT} from '../../types/imports';
import type {ParsedEdition, ParsedEntity, QueuedEntity} from '../../types/parser';

import type {ORM} from '../..';
import type {Transaction} from '../types';
import _ from 'lodash';
import {camelToSnake} from '../../util';
import {getAdditionalEntityProps} from '../entity';
import {getExternalSourceId} from './misc';
import {updateAliasSet} from '../alias';
import {updateAnnotation} from '../annotation';
import {updateDisambiguation} from '../disambiguation';
import {updateIdentifierSet} from '../identifier';
import {updateLanguageSet} from '../language';
import {updateReleaseEventSet} from '../releaseEvent';


function createEntityRecord(transacting: Transaction, data: EntityT) {
	return transacting.insert(camelToSnake(data)).into('bookbrainz.entity').returning('bbid');
}

function createOrUpdateImportMetadata(transacting: Transaction, record: ImportMetadataT) {
	return transacting.insert(camelToSnake(record)).into('bookbrainz.import_metadata')
		.onConflict(['external_source_id', 'external_identifier']).merge();
}

function getImportMetadata(transacting: Transaction, externalSourceId: number, externalIdentifier: string) {
	return transacting.select('pending_entity_bbid', 'accepted_entity_bbid').from('bookbrainz.import_metadata')
		.where(camelToSnake({externalIdentifier, externalSourceId}));
}

/** IDs of extra data sets which not all entity types have. */
type ExtraDataSetIds = Partial<{
	languageSetId: number;
	releaseEventSetId: number;
}>;

/** IDs of all data sets which an entity can have. */
type DataSetIds = {
	aliasSetId: number;
	annotationId: number;
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
		.onConflict('bbid').merge();
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

	/** BBID of the pending imported entity. */
	importId: string;

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
		const {alias, annotation, identifiers, disambiguation, externalSource} = importData.data;

		const externalSourceId: number = await getExternalSourceId(transacting, externalSource);

		const [existingImport] = await getImportMetadata(transacting, externalSourceId, importData.externalIdentifier);
		if (existingImport) {
			const isPendingImport = !existingImport.accepted_entity_bbid;
			if (existingImportAction === 'skip') {
				return {
					importId: existingImport.pending_entity_bbid,
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
						importId: existingImport.pending_entity_bbid,
						status: 'skipped accepted'
					};
				}
				// We also want to create updates for already accepted entities ('update pending and accepted')
				// TODO: implement this feature in a later version and drop the following temporary return statement
				return {
					importId: existingImport.pending_entity_bbid,
					status: 'skipped accepted'
				};
			}
		}

		const [aliasSet, annotationObj, identifierSet, disambiguationObj, entityExtraDataSets] =
			await Promise.all([
				updateAliasSet(orm, transacting, null, null, alias),
				updateAnnotation(orm, transacting, null, annotation, null),
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
					annotationId: annotationObj && annotationObj.get('id'),
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
		let importId: string = existingImport?.pending_entity_bbid;
		if (!importId) {
			try {
				const [idObj] = await createEntityRecord(transacting, {isImport: true, type: entityType});
				importId = _.get(idObj, 'bbid');
			}
			catch (err) {
				throw new Error(`Failed to create a new import ID: ${err}`);
			}
		}

		const importMetadata: ImportMetadataT = {
			additionalData: importData.data.metadata,
			externalIdentifier: importData.externalIdentifier,
			externalSourceId,
			lastEdited: importData.lastEdited,
			pendingEntityBbid: importId
		};

		try {
			await createOrUpdateImportMetadata(transacting, importMetadata);
		}
		catch (err) {
			throw new Error(`Failed to upsert import metadata: ${err}`);
		}

		try {
			await createOrUpdateImportHeader(transacting, {bbid: importId, dataId}, entityType);
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
