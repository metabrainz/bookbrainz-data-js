/*
 * Copyright (C) 2015-2016  Ben Ockmore
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

import {camelToSnake, formatDate, parseDate, snakeToCamel} from '../../util';


export default function creatorData(bookshelf) {
	const CreatorData = bookshelf.Model.extend({
		aliasSet() {
			return this.belongsTo('AliasSet', 'alias_set_id');
		},
		annotation() {
			return this.belongsTo('Annotation', 'annotation_id');
		},
		beginArea() {
			return this.belongsTo('Area', 'begin_area_id');
		},
		creatorType() {
			return this.belongsTo('CreatorType', 'type_id');
		},
		disambiguation() {
			return this.belongsTo('Disambiguation', 'disambiguation_id');
		},
		endArea() {
			return this.belongsTo('Area', 'end_area_id');
		},
		format: camelToSnake,
		gender() {
			return this.belongsTo('Gender', 'gender_id');
		},
		idAttribute: 'id',
		identifierSet() {
			return this.belongsTo('IdentifierSet', 'identifier_set_id');
		},
		parse: snakeToCamel,
		relationshipSet() {
			return this.belongsTo('RelationshipSet', 'relationship_set_id');
		},
		tableName: 'bookbrainz.creator_data',
		virtuals: {
			beginDate: {
				get() {
					const year = this.get('beginYear');
					const month = this.get('beginMonth');
					const day = this.get('beginDay');
					return formatDate(year, month, day);
				},
				set(value) {
					const parts = parseDate(value);
					this.set('beginYear', parts[0]);
					this.set('beginMonth', parts[1]);
					this.set('beginDay', parts[2]);
				}
			},
			endDate: {
				get() {
					const year = this.get('endYear');
					const month = this.get('endMonth');
					const day = this.get('endDay');
					return formatDate(year, month, day);
				},
				set(value) {
					const parts = parseDate(value);
					this.set('endYear', parts[0]);
					this.set('endMonth', parts[1]);
					this.set('endDay', parts[2]);
				}
			}
		}
	});

	return bookshelf.model('CreatorData', CreatorData);
}
