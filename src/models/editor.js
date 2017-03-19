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

export default function(bookshelf) {
	const Editor = bookshelf.Model.extend({
		achievements() {
			return this.hasMany('AchievementType').through('AchievementUnlock');
		},
		area() {
			return this.belongsTo('Area', 'area_id');
		},
		format: camelToSnake,
		gender() {
			return this.belongsTo('Gender', 'gender_id');
		},
		idAttribute: 'id',
		incrementEditCount() {
			this.set('totalRevisions', this.get('totalRevisions') + 1);
			this.set('revisionsApplied', this.get('revisionsApplied') + 1);
		},
		parse: snakeToCamel,
		revisions() {
			return this.hasMany('Revision', 'author_id');
		},
		tableName: 'bookbrainz.editor',
		titleUnlock() {
			return this.belongsTo('TitleUnlock', 'title_unlock_id');
		},
		type() {
			return this.belongsTo('EditorType', 'type_id');
		}
	});

	return bookshelf.model('Editor', Editor);
}
