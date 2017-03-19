/*
 * Copyright (C) 2015  Ben Ockmore
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

'use strict';

import {camelToSnake, snakeToCamel} from '../util';

module.exports = (bookshelf) => {
	const Revision = bookshelf.Model.extend({
		author() {
			return this.belongsTo('Editor', 'author_id');
		},
		children() {
			return this.belongsToMany(
				'Revision', 'bookbrainz.revision_parent', 'parent_id',
				'child_id'
			);
		},
		format: camelToSnake,
		idAttribute: 'id',
		notes() {
			return this.hasMany('Note', 'revision_id');
		},
		parents() {
			return this.belongsToMany(
				'Revision', 'bookbrainz.revision_parent', 'child_id',
				'parent_id'
			);
		},
		parse: snakeToCamel,
		tableName: 'bookbrainz.revision'
	});

	return bookshelf.model('Revision', Revision);
};
