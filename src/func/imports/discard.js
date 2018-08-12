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
import {deleteImport} from './delete-import';


/* The maximum allowed limit of count of votes (in favour of discarding) */
export const DISCARD_LIMIT = 1;

export async function discardVotesCast(
	transacting: Transaction, importId: number
): Promise<Object> {
	const votes = await transacting.select('*')
		.from('bookbrainz.discard_votes')
		.where('import_id', importId);

	return votes.map(snakeToCamel);
}

/** This function casts a discard vote. In case of it has already been cast,
 * it raises an error. If the vote is decisive one (and the record is deleted),
 * it returns a Promise that resolves to true, else it returns an promise that
 * resolves to false.
 * @param  {Transaction} transacting - The knex Transacting object
 * @param  {number} importId - Id of the import
 * @param  {number} editorId - Id of the user casting the vote
 * @returns {Promise<boolean>} - Promise<true> if records has been deleted or
 * 		Promise<false> if the record is still present
 */
export async function castDiscardVote(
	transacting: Transaction, importId: number, editorId: number
): Promise<boolean> {
	const votesCast = await discardVotesCast(transacting, importId);

	// If editor has already cast the vote, reject the vote
	for (const vote of votesCast) {
		if (vote.editor_id === editorId) {
			throw new Error('Already cast the vote');
		}
	}

	// If cast vote is decisive one, delete the records
	if (votesCast.length === DISCARD_LIMIT) {
		await deleteImport(transacting, importId);
		// The record been deleted
		return true;
	}
	else if (votesCast.length < DISCARD_LIMIT) {
		// Cast vote if it's below the limit
		await transacting.insert(camelToSnake({editorId, importId}))
			.into('bookbrainz.discard_votes');
	}
	else {
		throw new Error('Cast votes greater than the limit. Check database.');
	}

	// The record has not been deleted
	return false;
}
