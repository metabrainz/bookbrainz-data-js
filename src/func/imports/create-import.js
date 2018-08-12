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


import {entityTypes, getAdditionalEntityProps} from '../entity';
import _ from 'lodash';
import {camelToSnake} from '../../util';
import {getOriginSourceId} from './misc';
import {updateAliasSet} from '../alias';
import {updateDisambiguation} from '../disambiguation';
import {updateIdentifierSet} from '../identifier';
import {updateLanguageSet} from '../language';
import {updateReleaseEventSet} from '../releaseEvent';


function createImportRecord(transacting, data) {
	return transacting.insert(data).into('bookbrainz.import').returning('id');
}

function createLinkTableRecord(transacting, record) {
	return transacting.insert(record).into('bookbrainz.link_import');
}

function createImportDataRecord(transacting, dataSets, importData) {
	const {entityType} = importData;

	// Safe check if entityType is one among the expected
	if (!_.includes(entityTypes, entityType)) {
		throw new Error('Invalid entity type');
	}

	const additionalEntityProps = _.omit(
		getAdditionalEntityProps(importData, entityType),
		['beginDate', 'endDate']
	);

	const dataRecordProps = {
		...dataSets,
		...additionalEntityProps
	};

	return transacting.insert([camelToSnake(dataRecordProps)])
		.into(`bookbrainz.${_.toLower(entityType)}_data`)
		.returning('id');
}

function createImportHeader(transacting, record, entityType) {
	// Safe check if entityType is one among the expected

	if (!_.includes(entityTypes, entityType)) {
		throw new Error('Invalid entity type');
	}


	const table = `bookbrainz.${_.toLower(entityType)}_import_header`;
	return transacting.insert(record).into(table).returning('import_id');
}

async function updateEntityDataSets(orm, transacting, importData) {
	// Extract all entity data sets related fields
	const {languages, releaseEvents} = importData;

	// Create an empty entityDataSet
	const entityDataSet = {};

	if (languages) {
		entityDataSet.languageSetId =
			await updateLanguageSet(transacting, null, languages);
	}

	if (releaseEvents) {
		const releaseEventSet =
			await updateReleaseEventSet(orm, transacting, null, releaseEvents);
		entityDataSet.releaseEventSetId =
			releaseEventSet && releaseEventSet.get('id');
	}

	// Todo: Publisher field

	return entityDataSet;
}

export function createImport(orm, importData) {
	return orm.bookshelf.transaction(async (transacting) => {
		const {alias, identifiers, disambiguation, entityType, source} =
			importData;

		const [aliasSet, identifierSet, disambiguationObj, entityDataSets] =
			await Promise.all([
				updateAliasSet(orm, transacting, null, null, alias),
				updateIdentifierSet(orm, transacting, null, identifiers),
				updateDisambiguation(orm, transacting, null, disambiguation),
				updateEntityDataSets(orm, transacting, importData)
			]);

		// Create entityTypedataId
		let dataId = null;
		try {
			[dataId] = await createImportDataRecord(
				transacting,
				camelToSnake({
					aliasSetId: aliasSet && aliasSet.get('id'),
					disambiguationId:
					disambiguationObj && disambiguationObj.get('id'),
					identifierSetId: identifierSet && identifierSet.get('id'),
					...entityDataSets
				}),
				importData
			);
		}
		catch (err) {
			throw new Error(`Error during dataId creation ${err}`);
		}

		// Create import entity
		let importId = null;
		try {
			[importId] =
				await createImportRecord(transacting, [{type: entityType}]);
		}
		catch (err) {
			throw new Error(`Error during creation of importId ${err}`);
		}

		// Get origin_source
		let originSourceId = null;

		try {
			originSourceId = await getOriginSourceId(transacting, source);
		}
		catch (err) {
			throw new Error(`Error during getting source id - ${err}`);
		}

		const linkTableData = camelToSnake({
			importId,
			importMetadata: importData.metadata,
			lastEdited: importData.lastEdited,
			originId: importData.originId,
			originSourceId
		});


		// Set up link_import table
		try {
			await createLinkTableRecord(
				transacting,
				[linkTableData]
			);
		}
		catch (err) {
			throw new Error(`Error during link import table creation - ${err}`);
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
