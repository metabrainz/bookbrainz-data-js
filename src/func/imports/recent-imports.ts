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

import * as _ from 'lodash';
import {ENTITY_TYPES, type EntityTypeString} from '../../types/entity';
import type {ORM} from '../..';
import type {Transaction} from '../types';
import {getAliasByIds} from '../alias';
import moment from 'moment';
import {originSourceMapping} from './misc';
import {snakeToCamel} from '../../util';

/** getRecentImportIdsByType -
 * @param  {Transaction} transacting - Transaction object
 * @param  {number} limit - To limit the number of importIds fetched
 * @param  {number} offset - We offset the result by this value
 * @returns {Promise<Object<Array>>} - Returns an object containing arrays of
 * 		importIds of various importTypes
 */
async function getRecentImportUtilData(
	transacting: Transaction,
	limit: number,
	offset: number
) {
	// Extract recent imports, types and import timeStamp
	const recentImportUtilsData =
			await transacting.select(
				'link.imported_at',
				'link.origin_source_id',
				'bookbrainz.import.id',
				'bookbrainz.import.type'
			)
				.from('bookbrainz.import')
				.join(
					transacting.select(
						'import_id', 'imported_at', 'origin_source_id'
					)
						.from('bookbrainz.link_import')
						.orderBy('imported_at')
						.whereNot('import_id', null)
						.limit(limit)
						.offset(offset)
						.as('link'),
					'link.import_id',
					'bookbrainz.import.id'
				);

	/* Construct importHolder object (holds importIds classified by their types)
		object of form {type: []} */
	const importHolder = ENTITY_TYPES.reduce(
		(holder: Record<string, unknown>, type: string) => _.assign(holder, {[type]: []}), {}
	);

	/* Returns the holder object which has two fields:
		=> importHolder: Object{type: Array[importIds]}
			Where type is entityType. This essentially classifies all the
			imports into the their respective types
		=> timestampMap: Object{importId: imported_at}
			This holds a mapping of all imports and their imported_at timestamps
		=> originIdMap: Object{originId: origin_id}
			This holds a mapping of all imports and their origin_ids
		*/
	return recentImportUtilsData.reduce((holder: Record<string, unknown>, data: any) => {
		holder.importHolder[data.type].push(data.id);
		holder.originIdMap[data.id] = data.origin_source_id;
		holder.timeStampMap[data.id] = data.imported_at;
		return holder;
	}, {importHolder, originIdMap: {}, timeStampMap: {}});
}

function getRecentImportsByType(transacting: Transaction, type: EntityTypeString, importIds: string[]) {
	return transacting.select('*')
		.from(`bookbrainz.${_.snakeCase(type)}_import`)
		.whereIn('import_id', importIds);
}

export async function getRecentImports(
	orm: ORM, transacting: Transaction, limit = 10, offset = 0
) {
	/* Fetch most recent ImportIds classified by entity types
		=> importHolder - holds recentImports classified by entity type
		=> timeStampMap - holds value importedAt value in object with importId
			as key
		=> originIdMap - holds value originId value in object with importId as
			key
	*/
	const {importHolder: recentImportIdsByType, timeStampMap, originIdMap} =
		await getRecentImportUtilData(transacting, limit, offset);

	/* Fetch imports for each entity type using their importIds
		We first pass type and id to fetch function, await all those promises
		and then flatten the array containing those results. Classification by
		type is important as only by knowing types we can access dataId and
		hence subsequent data.
	*/
	const recentImports = _.flatten(
		await Promise.all(
			ENTITY_TYPES.map(type =>
				getRecentImportsByType(transacting, type,
					recentImportIdsByType[type]))
		)
	);

	// Fetch all default alias ids
	const defaultAliasIds = _.map(recentImports, 'default_alias_id');
	// Fetch default aliases using the default alias ids
	const defaultAliasesMap =
		await getAliasByIds(transacting, defaultAliasIds);


	/* Add timestamp, source and defaultAlias to the recentImports
		Previously while getting utils data we fetched a mapping of importId to
		timestamp and originId.
		We also fetched map of aliasId to alias object.
		Now using those we populate our final object */
	// First, get the origin mapping => {originId: name}
	const sourceMapping = await originSourceMapping(transacting, true);
	return recentImports.map(recentImport => {
		// Add timestamp
		recentImport.importedAt =
			moment(timeStampMap[recentImport.import_id]).format('YYYY-MM-DD');

		// Add origin source
		const originId = originIdMap[recentImport.import_id];
		recentImport.source = sourceMapping[originId];

		// Add default alias
		const defaultAliasId = _.get(recentImport, 'default_alias_id');
		recentImport.defaultAlias = defaultAliasesMap[defaultAliasId];

		return snakeToCamel(recentImport);
	});
}

export async function getTotalImports(transacting: Transaction) {
	const [{count}] =
		await transacting('bookbrainz.link_import').count('import_id');
	return parseInt(count as string, 10);
}
