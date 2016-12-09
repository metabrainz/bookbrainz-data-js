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

'use strict';

const util = require('../../util');

module.exports = (bookshelf) => {
	const PublisherData = bookshelf.Model.extend({
		tableName: 'bookbrainz.publisher_data',
		idAttribute: 'id',
		parse: util.snakeToCamel,
		format: util.camelToSnake,
		annotation() {
			return this.belongsTo('Annotation', 'annotation_id');
		},
		disambiguation() {
			return this.belongsTo('Disambiguation', 'disambiguation_id');
		},
		relationshipSet() {
			return this.belongsTo('RelationshipSet', 'relationship_set_id');
		},
		aliasSet() {
			return this.belongsTo('AliasSet', 'alias_set_id');
		},
		identifierSet() {
			return this.belongsTo('IdentifierSet', 'identifier_set_id');
		},
		publisherType() {
			return this.belongsTo('PublisherType', 'type_id');
		},
		area() {
			return this.belongsTo('Area', 'area_id');
		},
		editions(options) {
			const Edition = bookshelf.model('Edition');
			const bbid = this.get('bbid');
			return Edition.query((qb) => {
				qb
					.leftJoin(
						'bookbrainz.publisher_set',
						'bookbrainz.edition.publisher_set_id',
						'bookbrainz.publisher_set.id'
					)
					.rightJoin(
						'bookbrainz.publisher_set__publisher',
						'bookbrainz.publisher_set.id',
						'bookbrainz.publisher_set__publisher.set_id'
					)
					.where({
						'bookbrainz.edition.master': true,
						'bookbrainz.publisher_set__publisher.publisher_bbid':
							bbid
					});
			}).fetchAll(options);
		},
		virtuals: {
			beginDate: {
				get() {
					const year = this.get('beginYear');
					const month = this.get('beginMonth');
					const day = this.get('beginDay');
					return util.formatDate(year, month, day);
				},
				set(value) {
					const parts = util.parseDate(value);
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
					return util.formatDate(year, month, day);
				},
				set(value) {
					const parts = util.parseDate(value);
					this.set('endYear', parts[0]);
					this.set('endMonth', parts[1]);
					this.set('endDay', parts[2]);
				}
			}
		}
	});

	return bookshelf.model('PublisherData', PublisherData);
};
