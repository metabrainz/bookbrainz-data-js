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


export default function editionGroupRevision(bookshelf) {
	const EditionGroupRevision = bookshelf.Model.extend({
		data() {
			return this.belongsTo('EditionGroupData', 'data_id');
		},
		diff(other) {
			return diffRevisions(this, other, [
				'annotation', 'disambiguation', 'aliasSet.aliases.language',
				'aliasSet.defaultAlias', 'identifierSet.identifiers',
				'relationshipSet.relationships',
				'relationshipSet.relationships.type',
				'identifierSet.identifiers.type', 'editionGroupType'
			]);
		},
		entity() {
			return this.belongsTo('EditionGroupHeader', 'bbid');
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

					return new EditionGroupRevision()
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
		tableName: 'bookbrainz.edition_group_revision'
	});

	return bookshelf.model('EditionGroupRevision', EditionGroupRevision);
}
