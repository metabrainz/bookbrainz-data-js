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

import {camelToSnake, diffRevisions, snakeToCamel} from '../../util';


export default function publisherRevision(bookshelf) {
	const PublisherRevision = bookshelf.Model.extend({
		data() {
			return this.belongsTo('PublisherData', 'data_id');
		},
		diff(other) {
			return diffRevisions(this, other, [
				'annotation', 'disambiguation', 'aliasSet.aliases.language',
				'aliasSet.defaultAlias', 'identifierSet.identifiers',
				'relationshipSet.relationships', 'area',
				'relationshipSet.relationships.type',
				'identifierSet.identifiers.type', 'publisherType'
			]);
		},
		entity() {
			return this.belongsTo('PublisherHeader', 'bbid');
		},
		format: camelToSnake,
		idAttribute: 'id',
		parent() {
			return this.related('revision').fetch()
				.then((revision) => revision.related('parents').fetch({require: false}))
				.then((parents) => parents.map((parent) => parent.get('id')))
				.then((parentIds) => {
					if (parentIds.length === 0) {
						return null;
					}

					return new PublisherRevision()
						.where('bbid', this.get('bbid'))
						.query('whereIn', 'id', parentIds)
						.orderBy('id', 'DESC')
						.fetch();
				});
		},
		parse: snakeToCamel,
		revision() {
			return this.belongsTo('Revision', 'id');
		},
		tableName: 'bookbrainz.publisher_revision'
	});

	return bookshelf.model('PublisherRevision', PublisherRevision);
}
