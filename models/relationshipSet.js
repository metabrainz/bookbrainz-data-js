/*
 * Copyright (C) 2016  Ben Ockmore
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

const util = require('../util');

module.exports = (bookshelf) => {
	const RelationshipSet = bookshelf.Model.extend({
		tableName: 'bookbrainz.relationship_set',
		idAttribute: 'id',
		parse: util.snakeToCamel,
		format: util.camelToSnake,
		relationships() {
			return this.belongsToMany(
				'Relationship', 'bookbrainz.relationship_set__relationship',
				'set_id', 'relationship_id'
			);
		}
	});

	return bookshelf.model('RelationshipSet', RelationshipSet);
};
