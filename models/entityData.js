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

'use strict';

const util = require('../util');

module.exports = (bookshelf) => {
	const Alias = bookshelf.model('Alias');
	const Annotation = bookshelf.model('Annotation');
	const Disambiguation = bookshelf.model('Disambiguation');

	const EntityData = bookshelf.Model.extend({
		tableName: 'bookbrainz.entity_data',
		idAttribute: 'id',
		parse: util.snakeToCamel,
		format: util.camelToSnake,
		defaultAlias() {
			return this.belongsTo('Alias', 'default_alias_id');
		},
		create(data) {
			const annotationPromise =
				new Annotation({content: data.annotation}).save();
			const disambiguationPromise =
				new Disambiguation({comment: data.disambiguation}).save();
			const aliasesPromise = Promise.all(data.aliases.map((alias) => {
				return new Alias({
					name: alias.name, sortName: alias.sortName,
					languageId: alias.language, primary: alias.primary
				}).save();
			}));

			return Promise.join(
				annotationPromise, disambiguationPromise, aliasesPromise,
				(annotation, disambiguation, aliases) => {
					const entityData = new EntityData({
						annotationId: annotation.get('id'),
						disambiguationId: disambiguation.get('id')
					});
					return entityData;
					// Link aliases to entity data
				}
			);
		}
	});

	return bookshelf.model('EntityData', EntityData);
};
