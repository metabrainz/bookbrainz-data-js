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
import Immutable from 'immutable';
import _ from 'lodash';


export function revision(bookshelf) {
	const Revision = bookshelf.Model.extend({
		author() {
			return this.belongsTo('Editor', 'author_id');
		},
		children() {
			return this.belongsToMany(
				'Revision', 'bookbrainz.revision_parent', 'parent_id',
				'child_id'
			);
		},
		format: camelToSnake,
		idAttribute: 'id',
		notes() {
			return this.hasMany('Note', 'revision_id');
		},
		parents() {
			return this.belongsToMany(
				'Revision', 'bookbrainz.revision_parent', 'child_id',
				'parent_id'
			);
		},
		parse: snakeToCamel,
		tableName: 'bookbrainz.revision'
	});

	return bookshelf.model('Revision', Revision);
}

/**
 * Produce a mapping of revisionIds and their default alias names.
 * @param {object} bookshelf - The Bookshelf object.
 * @returns {function} The returned function which takes in entityType and array
 * 					   of revisionIds and returns array of
 * 					   {revisionId: defaultAlias}
 */
export function mapRevisionsToAlias(bookshelf) {
	return (entityType, revisions) => {
		function rawSql(revisionIds) {
			return `
				SELECT alias.name, en.revision_id
				  FROM ${entityType} as en
				  JOIN alias ON alias.id = en.default_alias_id
				 WHERE en.revision_id IN (${revisionIds})
			`;
		}

		// Construct comma separated string of revisionIds
		const parameters = revisions.reduce((prev, pres) => `${prev}, ${pres}`);

		return bookshelf.knex.raw(rawSql(parameters)).then(
			rawQueryResults => {
				// Object to store {parentId : aliasName} pair
				const names = {};
				// Convert query result keys to camelCase
				const queryResults = rawQueryResults.rows.map(row =>
					_.mapKeys(
						row,
						(value, key) => _.camelCase(key)
					));

				queryResults.forEach(queryResult => {
					names[queryResult.revisionId] = queryResult.name;
				});
				return Immutable.fromJS(names);
			}
		);
	};
}
