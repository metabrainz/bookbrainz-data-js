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
import {camelToSnake, snakeToCamel} from '../../util';
import type {Transaction} from '../types';


export async function deleteImport(
	transacting: Transaction, importId: string, entityId?: string | null | undefined
) {
	// Get the type of the import
	const [typeObj] = await transacting.select('type')
		.from('bookbrainz.entity').where(camelToSnake({bbid: importId, isImport: true}));
	const {type: importType} = typeObj;

	// Get the dataId of the import
	const [dataIdObj] =
		await transacting.select('data_id')
			.from(`bookbrainz.${_.snakeCase(importType)}_import_header`)
			.where('bbid', importId);
	const {dataId}: {dataId: number} = snakeToCamel(dataIdObj);

	// Update link table arguments - if entityId present add it to the args obj
	const metadataUpdate: {pendingEntityBbid: null, acceptedEntityBbid?: string} =
		entityId ? {acceptedEntityBbid: entityId, pendingEntityBbid: null} : {pendingEntityBbid: null};

	await Promise.all([
		// Delete the import header and entity data table records
		transacting(`bookbrainz.${_.snakeCase(importType)}_import_header`)
			.where('bbid', importId).del()
			.then(() =>
				transacting(`bookbrainz.${_.snakeCase(importType)}_data`)
					.where('id', dataId).del()),

		// Delete the discard votes
		transacting('bookbrainz.discard_votes')
			.where('import_bbid', importId).del(),

		/* Update the link import record:
			-> set importId as null
			-> if entityId provided, update it */
		transacting('bookbrainz.import_metadata')
			.where('pending_entity_bbid', importId)
			.update(camelToSnake(metadataUpdate))
	]);

	// Finally delete the import table record
	return transacting('bookbrainz.entity').where('bbid', importId).del();
}
