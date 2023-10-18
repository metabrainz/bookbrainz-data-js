/*
 * Copied from bookbrainz-site
 * Copyright (C) 2016  Sean Burke
 *               2016  Ben Ockmore
 *               2017  Daniel Hsing
 *               2018  Shivam Tripathi
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

import type {ORM} from '..';
import type {Transaction} from './types';

/**
 * @param  {ORM} orm - Bookbrainz orm wrapper containing all models
 * @param  {string} content - Note content
 * @param  {string} editorId - Editor's Id
 * @param  {Object} revision - Revision object created using orm.Revision model
 * @param  {Transaction} transacting - The transaction model
 * @returns {Object | null} Returns the created Note object or returns null
 */
export function createNote(
	orm: ORM,
	content: string,
	editorId: string,
	revision: any,
	transacting: Transaction
) {
	const {Note} = orm;
	if (content) {
		const revisionId = revision.get('id');
		return new Note({
			authorId: editorId,
			content,
			revisionId
		})
			.save(null, {transacting});
	}

	return null;
}
