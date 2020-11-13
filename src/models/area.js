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

import {camelToSnake, snakeToCamel} from '../util';
import {recursivelyGetAreaParentsWithNames} from '../func/area';


export default function area(bookshelf) {
	const Area = bookshelf.Model.extend({
		areaType() {
			return this.belongsTo('AreaType', 'type');
		},
		format: camelToSnake,
		idAttribute: 'id',
		parents(checkAllLevels = false) {
			return recursivelyGetAreaParentsWithNames(bookshelf, this.id, checkAllLevels);
		},
		parse: snakeToCamel,
		tableName: 'musicbrainz.area',
		virtuals: {
			bbid() {
				return this.get('gid');
			}
		}
	});

	return bookshelf.model('Area', Area);
}
