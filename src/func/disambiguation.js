/*
 * Adapted from bookbrainz-site
 * Copyright (C) 2016  Sean Burke
 *               2016  Ben Ockmore
 *               2018 Shivam Tripathi
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

import type {Transaction} from './types';


/**
 * @param  {Object} orm - The BookBrainz orm wrapper containing all models
 * @param  {Transaction} transacting - The current knex transaction object
 * @param  {Object} oldDisambiguation - The previous disambiguation object
 * @param  {string} newComment - The new disambiguation string
 * @returns {Promise<Object>} - Returns Promise holding Disambiguation object
 */
export function updateDisambiguation(
	orm: Object, transacting: Transaction, oldDisambiguation: ?Object,
	newComment: string
) {
	const {Disambiguation} = orm;
	const oldComment = oldDisambiguation && oldDisambiguation.get('comment');

	if (newComment === oldComment) {
		return Promise.resolve(oldDisambiguation);
	}

	if (newComment) {
		new Disambiguation({
			comment: newComment
		}).save(null, {transacting});
	}
	return Promise.resolve(null);
}
