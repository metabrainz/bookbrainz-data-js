/*
 * Copyright (C) 2020 Prabal Singh
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


export default function userCollection(bookshelf) {
	const UserCollection = bookshelf.Model.extend({
		collaborators() {
			return this.hasMany('UserCollectionCollaborator', 'collection_id');
		},
		format: camelToSnake,
		idAttribute: 'id',
		initialize() {
			this.on('fetching fetching:collection', (model, columns, options) => {
				if (options.withItemCount === true) {
					options.query.select(bookshelf.knex.raw(
						`(select count(*)
						from bookbrainz.user_collection_item
						where
						collection_id = bookbrainz.user_collection.id
						) as item_count`
					))
						.groupBy('user_collection.id');
				}
			});
		},
		items() {
			return this.hasMany('UserCollectionItem', 'collection_id');
		},
		owner() {
			return this.belongsTo('Editor', 'owner_id');
		},
		parse: snakeToCamel,
		tableName: 'bookbrainz.user_collection'
	});

	return bookshelf.model('UserCollection', UserCollection);
}
