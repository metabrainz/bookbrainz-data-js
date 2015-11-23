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

const _ = require('lodash');

const util = require('../util');

module.exports = (bookshelf) => {
	const Revision = bookshelf.model('Revision');

	const EntityRevision = bookshelf.Model.extend({
		tableName: 'bookbrainz.entity_revision',
		idAttribute: 'id',
		parse: util.snakeToCamel,
		format: util.camelToSnake,
		revision() {
			return this.morphOne(
				'Revision', 'revision', ['_type', 'id'], '1'
			);
		},
		entity() {
			return this.belongsTo('Entity', 'entity_bbid');
		},
		entityData() {
			return this.belongsTo('EntityData', 'entity_data_id');
		},
		create(attribs) {
			const self = this;
			const revisionAttribs =
				_.pick(attribs, 'id', 'authorId', 'parentId');
			revisionAttribs._type = 1;

			const entityRevisionAttribs =
				_.pick(attribs, 'id', 'entityBbid', 'entityDataId');

			return new Revision(revisionAttribs)
			.save(null, {method: 'insert'})
			.then(
				() => self.save(entityRevisionAttribs, {method: 'insert'})
			);
		}
	});

	return bookshelf.model('EntityRevision', EntityRevision);
};
