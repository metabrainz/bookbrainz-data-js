/*
 * Copied from bookbrainz-site
 * Copyright (C) 2016  Sean Burke
 *               2016  Ben Ockmore
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

// @flow

import type {Transaction} from './types';

/**
 * Adds 1 to the edit count of the specified editor
 *
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {string} id - row ID of editor to be updated
 * @param {object} transacting - Bookshelf transaction object (must be in
 * progress)
 * @returns {Promise} - Resolves to the updated editor model
 */
export function incrementEditorEditCountById(
	orm: Object,
	id: string,
	transacting: Transaction
): Promise<Object> {
	const {Editor} = orm;
	return new Editor({id})
		.fetch({transacting})
		.then((editor) => {
			editor.incrementEditCount();
			return editor.save(null, {transacting});
		});
}
