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

import type {Transaction} from '../types';


/* The maximum number of count of votes (in favour of discarding) till which we
	hold the record */
const DISCARD_LIMIT = 1;

export default async function discard(
	transacting: Transaction, importId: number, editorId: number
): Promise<boolean> {
	const votesCast = await transacting.select('*')
		.from('bookbrainz.discard_votes')
		.where('import_id', importId);

	// If editor has already cast the vote, reject the vote
	for (const vote of votesCast) {
		if (vote.editor_id === editorId) {
			return Promise.resolve(false);
		}
	}

	// If cast vote is decisive one, delete the records
	if (votesCast.length === DISCARD_LIMIT) {
		// Get the type of the import
		const importType = await transacting.select('type')
			.from('bookbrainz.import').where('id', importId);

		// Get the dataId of the import
		const dataId = await transacting.select('data_id')
			.from('bookbrainz.import').where('import_id', importId);

		// DELETE ALL TRACES OF THE IMPORT
		// Delete the import header
		await transacting(`bookbrainz.${importType.toLowerCase()}_header`)
			.where('importId', importId).del();
		// Delete the discard votes
		await transacting('bookbrainz.discard_votes')
			.where('import_id', importId).del();
		// Delete the link import record
		await transacting('bookbrainz.link_import')
			.where('import_id', importId).del();
		// Finally delete the associated data and import table record
		await Promise.all([
			transacting('bookbrainz.import').where('id', importId).del(),
			transacting(`bookbrainz.${importType.toLowerCase()}_data`)
				.where('id', dataId).del()
		]);
	}
	else if (votesCast.length < DISCARD_LIMIT) {
		// Cast vote if it's below the limit
		await transacting.insert({editorId, importId})
			.into('bookbrainz.discard_votes');
	}
	else {
		throw new Error('Cast votes already greater than the set limit');
	}

	// Deletion successful
	return Promise.resolve(true);
}
