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


import {entityTypes, getAdditionalEntityProps} from './entity';
import _ from 'lodash';
import {camelToSnake} from '../util';
import {updateAliasSet} from './alias';
import {updateDisambiguation} from './disambiguation';
import {updateIdentifierSet} from './identifier';
import {updateLanguageSet} from './language';
import {updateReleaseEventSet} from './releaseEvent';


export async function getOriginSourceRecord(transacting, source) {
	let idArr = null;

	try {
		[idArr] = await transacting.select('id')
			.from('bookbrainz.origin_source')
			.where('name', '=', source);
	}
	catch (err) {
		return null;
	}

	// Create the data source if it does not exist
	if (!idArr || !idArr.length) {
		try {
			const [id] = await transacting.insert([{name: source}])
				.into('bookbrainz.origin_source')
				.returning('id');

			idArr = {id};
		}
		catch (err) {
			return null;
		}
	}

	// Retuning the {id} of the origin source (knex returns an array)
	return idArr;
}

function createImportRecord(transacting, data) {
	return transacting.insert(data).into('import').returning('id');
}

function createLinkTableRecord(transacting, record) {
	return transacting.insert(record).into('link_import');
}

function createImportDataRecord(transacting, dataSets, importData) {
	const {entityType} = importData;

	// Safe check if entityType is one among the expected
	if (!_.includes(entityTypes, entityType)) {
		throw new Error('Invalid entity type');
	}

	const additionalEntityProps =
		getAdditionalEntityProps(importData, entityType);

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

export default function createImport(orm, importData) {
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
		const [dataId] = await createImportDataRecord(
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

		// Create import entity
		const [importId] =
			await createImportRecord(transacting, [{type: entityType}]);

		// Get origin_source
		const originSource =
			await getOriginSourceRecord(transacting, source);

		// Set up link_import table
		await createLinkTableRecord(
			transacting,
			[camelToSnake({
				importId,
				importMetadata: importData.metadata,
				lastEdited: importData.lastEdited,
				originId: importData.originId,
				originSourceId: originSource.id
			})]
		);

		await createImportHeader(
			transacting,
			[camelToSnake({dataId, importId})],
			entityType
		);

		return importId;
	});
}
