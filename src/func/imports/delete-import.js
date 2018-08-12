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

import {camelToSnake, snakeToCamel} from '../../util';
import type {Transaction} from '../types';


export async function deleteImport(
	transacting: Transaction, importId: number, entityId: ?string
) {
	/* For future purposes - deletion order followed is as in the migration
		 script for imports - bookbrainz-sql/migrations/import/down.sql */

	// Get the type of the import
	const [typeRecord] = await transacting.select('type')
		.from('bookbrainz.import').where('id', importId);
	const {type: importType} = typeRecord;

	// Get the dataId of the import
	const [dataIdRecord] =
		await transacting.select('data_id')
			.from(`bookbrainz.${importType.toLowerCase()}_import_header`)
			.where('import_id', importId);
	const {dataId} = snakeToCamel(dataIdRecord);


	// Delete the import header
	await transacting(`bookbrainz.${importType.toLowerCase()}_import_header`)
		.where('import_id', importId).del();

	// Delete the discard votes
	await transacting('bookbrainz.discard_votes')
		.where('import_id', importId).del();

	/* Update the link import record:
		-> set importId as null
		-> if entityId provided, update it */
	const updateLinkImportObj: {importId: null, entityId?: string} =
		{importId: null};
	if (entityId) {
		updateLinkImportObj.entityId = entityId;
	}
	await transacting('bookbrainz.link_import')
		.where('import_id', importId)
		.update(camelToSnake(updateLinkImportObj));

	// Finally delete the associated data and import table record
	return Promise.all([
		transacting('bookbrainz.import').where('id', importId).del(),
		transacting(`bookbrainz.${importType.toLowerCase()}_data`)
			.where('id', dataId).del()
	]);
}
