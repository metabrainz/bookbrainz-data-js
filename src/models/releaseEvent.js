/*
 * Copyright (C) 2015  Sean Burke
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

import {camelToSnake, formatDate, parseDate, snakeToCamel} from '../util';

export default function(bookshelf) {
	const ReleaseEvent = bookshelf.Model.extend({
		format: camelToSnake,
		idAttribute: 'id',
		parse: snakeToCamel,
		tableName: 'bookbrainz.release_event',
		virtuals: {
			date: {
				get() {
					const year = this.get('year');
					const month = this.get('month');
					const day = this.get('day');
					return formatDate(year, month, day);
				},
				set(value) {
					const parts = parseDate(value);
					this.set('year', parts[0]);
					this.set('month', parts[1]);
					this.set('day', parts[2]);
				}
			}
		}
	});

	return bookshelf.model('ReleaseEvent', ReleaseEvent);
}
