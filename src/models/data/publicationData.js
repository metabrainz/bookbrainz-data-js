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
	const PublicationData = bookshelf.Model.extend({
		aliasSet() {
			return this.belongsTo('AliasSet', 'alias_set_id');
		},
		annotation() {
			return this.belongsTo('Annotation', 'annotation_id');
		},
		disambiguation() {
			return this.belongsTo('Disambiguation', 'disambiguation_id');
		},
		editions() {
			return this.hasMany('Edition', 'publication_bbid')
			.query({where: {master: true}});
		},
		format: util.camelToSnake,
		idAttribute: 'id',
		identifierSet() {
			return this.belongsTo('IdentifierSet', 'identifier_set_id');
		},
		parse: util.snakeToCamel,
		publicationType() {
			return this.belongsTo('PublicationType', 'type_id');
		},
		relationshipSet() {
			return this.belongsTo('RelationshipSet', 'relationship_set_id');
		},
		tableName: 'bookbrainz.publication_data'
	});

	return bookshelf.model('PublicationData', PublicationData);
};
