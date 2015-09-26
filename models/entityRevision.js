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

var util = require('../util');

var EntityRevision = null;

module.exports = function(bookshelf) {
	require('./editor')(bookshelf);
	require('./revision')(bookshelf);
	require('./entity')(bookshelf);
	require('./entityData')(bookshelf);

	if (!EntityRevision) {
		EntityRevision = bookshelf.Model.extend({
			tableName: 'bookbrainz.entity_revision',
			idAttribute: 'id',
			parse: util.snakeToCamel,
			format: util.camelToSnake,
			revision: function() {
				return this.morphOne(
					'Revision', 'revision', ['_type', 'id'], '1'
				);
			},
			entity: function() {
				return this.belongsTo('Entity', 'entity_bbid');
			},
			entityData: function() {
				return this.belongsTo('EntityData', 'entity_data_id');
			}
		});

		EntityRevision = bookshelf.model('EntityRevision', EntityRevision);
	}
	return EntityRevision;
};
