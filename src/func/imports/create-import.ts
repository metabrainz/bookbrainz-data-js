/*
 * Copyright (C) 2018 Shivam Tripathi
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
import type {ImportMetadataT, _ImportT} from '../../types/imports';
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

function createImportMetadataRecord(transacting: Transaction, record: ImportMetadataT) {
	return transacting.insert(camelToSnake(record)).into('bookbrainz.link_import');
}

function getImportMetadata(transacting: Transaction, externalSourceId: number, externalIdentifier: string) {
	return transacting.select('import_id', 'entity_id').from('bookbrainz.link_import').where(camelToSnake({
		originId: externalIdentifier,
		originSourceId: externalSourceId
	}));
}

function createImportDataRecord(transacting: Transaction, dataSets, importData: QueuedEntity) {
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

	return transacting.insert([camelToSnake(dataRecordProps)])
		.into(`bookbrainz.${_.snakeCase(entityType)}_data`)
		.returning('id');
}

function createImportHeader(transacting: Transaction, record, entityType: EntityTypeString) {
	const table = `bookbrainz.${_.snakeCase(entityType)}_import_header`;
	return transacting.insert(record).into(table).returning('import_id');
}

type EntityDataSetIds = Partial<{
	languageSetId: number;
	releaseEventSetId: number;
}>;

async function updateEntityDataSets(
	orm: ORM, transacting: Transaction, importData: ParsedEntity
): Promise<EntityDataSetIds> {
	// Extract all entity data sets related fields
	const {languages, releaseEvents} = importData as ParsedEdition;

	// Create an empty entityDataSet
	const entityDataSet: EntityDataSetIds = {};

	if (languages) {
		entityDataSet.languageSetId =
			await updateLanguageSet(orm, transacting, null, languages);
	}

	if (releaseEvents) {
		const releaseEventSet =
			await updateReleaseEventSet(orm, transacting, null, releaseEvents);
		entityDataSet.releaseEventSetId =
			releaseEventSet && releaseEventSet.get('id');
	}
	// Skipping publisher field, as they're not required in imports.

	return entityDataSet;
}

type ImportOptions = Partial<{

	/** Overwrite a pending entity with the same (external) identifier with the given data. */
	overwritePending: boolean;
}>;

export function createImport(orm: ORM, importData: QueuedEntity, {overwritePending = false}: ImportOptions = {}) {
	if (!ENTITY_TYPES.includes(importData.entityType)) {
		throw new Error('Invalid entity type');
	}

	return orm.bookshelf.transaction(async (transacting) => {
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

		const [previousImport] = await getImportMetadata(transacting, originSourceId, importData.originId);
		if (previousImport) {
			// console.log('Previous import found:', previousImport);
			// TODO: return a status value to indicate whether an import has been skipped
			if (!overwritePending) {
				return previousImport.import_id;
			}
		}

		const [aliasSet, identifierSet, disambiguationObj, entityDataSets] =
			await Promise.all([
				updateAliasSet(orm, transacting, null, null, alias),
				updateIdentifierSet(orm, transacting, null, identifiers),
				updateDisambiguation(orm, transacting, null, disambiguation),
				updateEntityDataSets(orm, transacting, importData.data)
			]);

		// Create entityTypedataId
		let dataId: number = null;
		try {
			const [idObj] = await createImportDataRecord(
				transacting,
				camelToSnake({
					aliasSetId: aliasSet && aliasSet.get('id'),
					disambiguationId: disambiguationObj && disambiguationObj.get('id'),
					identifierSetId: identifierSet && identifierSet.get('id'),
					...entityDataSets
				}),
				importData
			);
			dataId = _.get(idObj, 'id');
		}
		catch (err) {
			throw new Error(`Error during dataId creation ${err}`);
		}

		// Create import entity
		let importId: number = null;
		try {
			const [idObj] = await createImportRecord(transacting, {type: entityType});
			importId = _.get(idObj, 'id');
		}
		catch (err) {
			throw new Error(`Error during creation of importId ${err}`);
		}

		const importMetadata: ImportMetadataT = {
			importId,
			importMetadata: importData.data.metadata,
			lastEdited: importData.lastEdited,
			originId: importData.originId,
			originSourceId
		};

		try {
			await createImportMetadataRecord(transacting, importMetadata);
		}
		catch (err) {
			throw new Error(`Failed to insert import metadata: ${err}`);
		}

		try {
			await createImportHeader(
				transacting,
				[camelToSnake({dataId, importId})],
				entityType
			);
		}
		catch (err) {
			throw new Error(`Error during importHeader creation - ${err}`);
		}

		return importId;
	});
}
