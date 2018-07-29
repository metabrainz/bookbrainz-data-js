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

// @flow

import type {EntityTypeString, Transaction} from '../types';
import _ from 'lodash';
import {entityTypes} from '../entity';
import {getAliasByIds} from '../alias';
import moment from 'moment';

/** getRecentImportIdsByType -
 * @param  {Transaction} transacting - Transaction object
 * @param  {number} limit - To limit the number of importIds fetched
 * @param  {number} offset - We offset the result by this value
 * @returns {Promise<Object<Array>>} - Returns an object containing arrays of
 * 		importIds of various importTypes
 */
async function getRecentImportIdsByType(
	transacting: Object,
	limit: number,
	offset: number
) {
	// Extract recent imports, types and import timeStamp
	const recentImportIdAndType: Object =
			await transacting.select(
				'link.imported_at',
				'bookbrainz.import.id',
				'bookbrainz.import.type'
			)
				.from('bookbrainz.import')
				.join(
					transacting.select('import_id', 'imported_at')
						.from('bookbrainz.link_import')
						.orderBy('imported_at')
						.limit(limit)
						.offset(offset)
						.as('link'),
					'link.import_id',
					'bookbrainz.import.id'
				);

	/* Contruct importHolder object (holds importIds classified by their types)
		object of form {type: []} */
	const importHolder = _.values(entityTypes).reduce(
		(holder: Object, type: string) => _.assign(holder, {[type]: []}), {}
	);

	/* Returns the holder object which has two fields:
		=> importHolder: Object{type: Array[importIds]}
		=> timestampMap: Object{importId: imported_at} */
	return recentImportIdAndType.reduce((holder: Object, idType: Object) => {
		holder.importHolder[idType.type].push(idType.id);
		holder.timeStampMap[idType.id] = idType.imported_at;
		return holder;
	}, {importHolder, timeStampMap: {}});
}

function getRecentImportsByType(transacting, type, importIds) {
	return transacting.select('*')
		.from(`bookbrainz.${type.toLowerCase()}_import`)
		.whereIn('import_id', importIds);
}

export default async function getRecentImports(
	orm: Object, transacting: Transaction, limit: number = 10,
	offset: number = 0
) {
	// Fetch most recent ImportIds classified by importTypes
	const {importHolder: recentImportIdsByType, timeStampMap} =
		await getRecentImportIdsByType(transacting, limit, offset);

	const importTypes: Array<EntityTypeString> = _.values(entityTypes);
	// Fetch imports for each importType using their importIds
	const recentImports = _.flatten(
		await Promise.all(
			importTypes.map(type =>
				getRecentImportsByType(transacting, type,
					recentImportIdsByType[type]))
		)
	);

	const defaultAliasIds = _.map(recentImports, 'default_alias_id');
	const defaultAliases =
		await getAliasByIds(transacting, defaultAliasIds);
	// Append defaultAlias objects to the recentImports
	defaultAliases.forEach((defaultAlias, index) => {
		recentImports[index].defaultAlias = defaultAlias;
	});

	// Add timestamp to the recentImports
	recentImports.forEach(recentImport => {
		recentImport.importedAt =
			moment(timeStampMap[recentImport.import_id])
				.format('YYYY-MM-DD');
	});

	return recentImports;
}
