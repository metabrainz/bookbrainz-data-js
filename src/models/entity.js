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
import Promise from 'bluebird';
import _ from 'lodash';
import {mapRevisionsToAlias} from './revision';


export function entity(bookshelf) {
	const Entity = bookshelf.Model.extend({
		format: camelToSnake,
		idAttribute: 'bbid',
		masterRevision() {
			return this.belongsTo('Revision', 'master_revision_id');
		},
		parse: snakeToCamel,
		tableName: 'bookbrainz.entity'
	});

	return bookshelf.model('Entity', Entity);
}

/**
 * Produce a mapping of revisionIds and their default alias names.
 * @param {object} bookshelf - The Bookshelf object.
 * @returns {function} The returned function which inputs entityType and limit
 * 					   signifying the number of recent entities to be retrieved.
 */
export function mostRecentEntityRevisions(bookshelf) {
	return (entityType, limit) => {
		const rawSql = `
			SELECT editor.name as editor_name,
				   alias.name as alias_name,
				   revision.id as revision_id,
				   revision.created_at as created_at,
				   revision_parent.parent_id as parent_id
			  FROM ${entityType} as en
			  JOIN revision ON revision.id = en.revision_id
			  JOIN editor ON editor.id = revision.author_id
		 LEFT JOIN alias on alias.id = default_alias_id
		 LEFT JOIN revision_parent on revision_parent.child_id = revision.id
		  ORDER BY revision.created_at DESC
			 LIMIT ${limit};
		`;

		// Query the database to get the revisions
		const rowsPromise = bookshelf.knex.raw(rawSql).then(val =>
			val.rows.map((rawQueryResult) => {
				// Convert query keys to camelCase
				const queriedResult = _.mapKeys(
					rawQueryResult,
					(value, key) => _.camelCase(key)
				);

				// Add entity type to the queried result
				queriedResult.type = entityType;
				// Add action to the queried result
				if (queriedResult.parentId === null) {
					queriedResult.action = 'CREATE';
				}
				else if (queriedResult.aliasName === null) {
					queriedResult.action = 'DELETE';
				}
				else {
					queriedResult.action = 'EDIT';
				}
				return queriedResult;
			}));

		// Query the database to get the names of the parentIds of the revisions
		const parentNamesPromise = rowsPromise.then((rows) =>
			mapRevisionsToAlias(bookshelf)(
				entityType,
				rows.map(row => row.parentId)
			));

		return Promise.join(
			rowsPromise,
			parentNamesPromise,
			(rows, parentNames) =>
				// Add the alias name of the parentId if the action is DELETE
				Immutable.fromJS(rows.map(row => {
					if (row.action === 'DELETE') {
						row.aliasName = parentNames.get(
							row.parentId.toString()
						);
					}
					return row;
				}))
		);
	};
}
