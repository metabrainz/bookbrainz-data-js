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
 * @param  {Object} orm - Bookbrainz orm wrapper holding all models
 * @param  {Transaction} transacting - The present knex transacting object
 * @param  {Object} oldAnnotation - The old annotation object
 * @param  {string} newContent - New annotation to be set
 * @param  {Object} revision - The present revision object
 * @returns {Promise<Object>} - Returns Annotation object
 */
export function updateAnnotation(
	orm: Object, transacting: Transaction, oldAnnotation: ?Object,
	newContent: string, revision: Object
) {
	const {Annotation} = orm;
	const oldContent = oldAnnotation && oldAnnotation.get('content');

	if (newContent === oldContent) {
		return Promise.resolve(oldAnnotation);
	}

	if (newContent) {
		return new Annotation({
			content: newContent,
			lastRevisionId: revision.get('id')
		}).save(null, {transacting});
	}
	return Promise.resolve(null);
}
