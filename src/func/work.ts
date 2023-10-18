/*
 * Copyright (C) 2022  Shivam Awasthi
 * Some parts adapted from bookbrainz-site
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

import type {ORM} from '..';
import type {QueryResult} from 'pg';


/**
 * @param  {ORM} orm - the BookBrainz ORM, initialized during app setup
 * @param  {array} workBBIDs - the array containing the BBIDs of the works contained in the edition
 * @returns {Object} - Returns an array of objects containing the authorAlias, authorBBID of each work in an edition
*/
export async function loadAuthorNames(orm: ORM, workBBIDs: Array<string>) {
	if (!workBBIDs.length) {
		return [];
	}

	const sqlQuery = `select
		author.bbid as authorBBID,
		alias."name" as authorAlias,
		work.bbid as workBBID
		from
			bookbrainz.work as work
		-- Get Authors related to Work (relationship type 8, Author wrote Work)
		left join bookbrainz.relationship_set as workRelSet on
			workRelSet.id = work.relationship_set_id
		left join bookbrainz.relationship_set__relationship as workRelSetRel on
			workRelSetRel.set_id = workRelSet.id
		inner join bookbrainz.relationship as workRel on
			workRel.type_id = 8
			and workRel.id = workRelSetRel.relationship_id
		left join bookbrainz.author as author on
			author.bbid = workRel.source_bbid
			and author.master is true
		-- Get defaultAlias of the Authors
		left join bookbrainz.alias on
			alias.id = author.default_alias_id 
		where
			work.master is true
			and work.data_id is not null
			and work.bbid in ${`(${workBBIDs.map(bbid => `'${bbid}'`).join(', ')})`}`;

	const queryResults = await orm.bookshelf.knex.raw<QueryResult<WorkAuthorRow>>(sqlQuery);
	return queryResults.rows;
}

type WorkAuthorRow = {
	authorBBID: string;
	authorAlias: string;
	workBBID: string;
};
