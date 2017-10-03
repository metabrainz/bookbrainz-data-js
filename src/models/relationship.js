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

import {camelToSnake, snakeToCamel} from '../util';

export default function relationship(bookshelf) {
	const Relationship = bookshelf.Model.extend({
		format: camelToSnake,
		idAttribute: 'id',
		parse: snakeToCamel,
		sets() {
			return this.belongsToMany(
				'RelationshipSet', 'bookbrainz.relationship_set__relationship',
				'relationship_id', 'set_id'
			);
		},
		source() {
			return this.belongsTo('Entity', 'source_bbid');
		},
		tableName: 'bookbrainz.relationship',
		target() {
			return this.belongsTo('Entity', 'target_bbid');
		},
		type() {
			return this.belongsTo('RelationshipType', 'type_id');
		}
	});

	return bookshelf.model('Relationship', Relationship);
}
