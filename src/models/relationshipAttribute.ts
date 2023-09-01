/*
 * Copyright (C) 2021 Akash Gupta
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
import type Bookshelf from '@metabrainz/bookshelf';


export default function relationshipAttribute(bookshelf: Bookshelf) {
	const RelationshipAttribute = bookshelf.Model.extend({
		format: camelToSnake,
		idAttribute: 'id',
		parse: snakeToCamel,
		sets() {
			return this.belongsToMany(
				'RelationshipAttributeSet', 'bookbrainz.relationship_attribute_set__relationship_attribute',
				'attribute_id', 'set_id'
			);
		},
		tableName: 'bookbrainz.relationship_attribute',
		type() {
			return this.belongsTo('RelationshipAttributeType', 'attribute_type');
		},
		value() {
			return this.belongsTo('RelationshipAttributeTextValue', 'id', 'attribute_id');
		}
	});

	return bookshelf.model('RelationshipAttribute', RelationshipAttribute);
}
