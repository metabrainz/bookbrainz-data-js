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


import _ from 'lodash';
import {updateLanguageSet} from './language';
import {updateReleaseEventSet} from './derivedSets';


export async function getOriginSourceRecord(orm, source) {
	let idArr = null;
	const {bookshelf} = orm;

	try {
		idArr = await bookshelf.knex.select('id')
			.from('bookbrainz.origin_source')
			.where('name', '=', source);
	}
	catch (err) {
		return idArr;
	}

	// Create the data source if it does not exist
	if (!idArr || !idArr.length) {
		try {
			idArr = await bookshelf.knex.insert([{name: source}])
				.into('bookbrainz.origin_source')
				.returning('id');
		}
		catch (err) {
			return idArr;
		}
	}

	// Retuning the id of the origin source (knex returns an array)
	return idArr[0];
}

function createImportRecord({trx, data}) {
	return trx.insert(data).into('import').returning('id');
}

function createLinkTableRecord(trx, record) {
	return trx.insert(record).into('link-import');
}

async function importSetup(orm, transaction, importData) {
	const {entityType, source} = importData;

	// Create import entity
	const importId = await createImportRecord({
		data: [{type: entityType}],
		transaction
	});

	// Get origin_source
	const originSourceId =
		await getOriginSourceRecord(orm, source);

	// Set up link_import table
	await createLinkTableRecord(transaction, [{
		/* eslint-disable camelcase */
		import_id: importId,
		import_metadata: importData.metadata,
		last_edited: importData.lastEdited,
		metadata: importData.metadata,
		origin_id: importData.originId,
		origin_source_id: originSourceId
		/* eslint-enable */
	}]);

	return importId;
}

async function updateEntityDataSets(orm, transaction, importData) {
	// Extract all entity data sets related fields
	const {languages, releaseEvents, publishers} = importData;

	// Create an empty entityDataSet
	const entityDataSet = {};

	// Set entityDataSets for Work entityType
	if (languages) {
		entityDataSet.languageSetId =
			await updateLanguageSet(transaction, null, languages);
	}

	// Set entityDataSets for Work entityType
	if (releaseEvents) {
		entityDataSet.releaseEventSetId =
			await updateReleaseEventSet(orm, transaction, null, releaseEvents);
	}

	// Todo: Publihser field

	return entityDataSet;
}

// Todo: Add import creator default export function and entityType_data function
