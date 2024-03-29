/*
 * Copyright (C) 2018  Ben Ockmore
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

import * as _ from 'lodash';
import type {AuthorCreditNameT, Transaction} from './types';
import type Bookshelf from '@metabrainz/bookshelf';
import type {ORM} from '..';
import type {QueryResult} from 'pg';


function findAuthorCredit(
	orm: ORM, transacting: Transaction, authorCredit: Array<AuthorCreditNameT>
) {
	const tables = {cc: 'bookbrainz.author_credit'};

	const joins = _.map(
		authorCredit,
		(authorCreditName: AuthorCreditNameT, index: number) =>
			`JOIN bookbrainz.author_credit_name ccn${index} ` +
			`ON ccn${index}.author_credit_id = cc.id`
	);

	const wheres = _.reduce(
		authorCredit,
		(
			result: Record<string, unknown>,
			authorCreditName: AuthorCreditNameT, index: number
		) => {
			result[`ccn${index}.position`] = index;
			result[`ccn${index}.author_bbid`] = authorCreditName.authorBBID;
			result[`ccn${index}.name`] = authorCreditName.name;
			result[`ccn${index}.join_phrase`] = authorCreditName.joinPhrase;
			return result;
		},
		{}
	);

	const joinedQuery = _.reduce(
		joins,
		(result, join) => result.joinRaw(join),
		transacting(tables).select('cc.id')
	);

	return joinedQuery.where(wheres).first();
}


export async function fetchOrCreateCredit(
	orm: ORM, transacting: Transaction, authorCredit: Array<AuthorCreditNameT>
) {
	const {AuthorCredit} = orm;
	const result = await findAuthorCredit(orm, transacting, authorCredit);

	if (result) {
		return new AuthorCredit({id: result.id})
			.fetch({transacting, withRelated: ['names']});
	}

	const newCredit = await new AuthorCredit(
		{authorCount: authorCredit.length}
	).save(null, {transacting});

	/* eslint-disable camelcase */
	await transacting('bookbrainz.author_credit_name')
		.insert(
			_.map(authorCredit, (authorCreditName, index) => ({
				author_bbid: authorCreditName.authorBBID,
				author_credit_id: newCredit.get('id'),
				join_phrase: authorCreditName.joinPhrase,
				name: authorCreditName.name,
				position: index
			}))
		).returning(['author_bbid', 'join_phrase', 'name', 'position']);
	/* eslint-enable camelcase */

	return newCredit.refresh({transacting, withRelated: ['names']});
}

export function updateAuthorCredit(
	orm: ORM, transacting: Transaction, oldCredit: any,
	newCreditNames: Array<AuthorCreditNameT>
): Promise<any> {
	/* eslint-disable consistent-return */
	function comparisonFunc(
		obj: AuthorCreditNameT, other: AuthorCreditNameT
	) {
		// Check for arrays here, so that the comparison func is only used
		// for individual author credits
		if (!_.isArray(obj) && !_.isArray(other)) {
			return (
				obj.authorBBID === other.authorBBID &&
				obj.name === other.name &&
				obj.joinPhrase === other.joinPhrase
			);
		}
		// return undefined - to indicate that the default comparison should
		// be used for arrays, which will end up recursing to the item level
	}
	/* eslint-enable consistent-return */

	const oldCreditNames: Array<AuthorCreditNameT> =
		oldCredit ? _.orderBy(oldCredit.related('names').toJSON(), 'position') : [];
	const sortedNewCreditNames = _.orderBy(newCreditNames, 'position');
	if (_.isEqualWith(oldCreditNames, sortedNewCreditNames, comparisonFunc)) {
		return Promise.resolve(oldCredit || null);
	}

	return fetchOrCreateCredit(orm, transacting, sortedNewCreditNames);
}


/**
 * Fetches all the Edition entities credited to an Author (with Author Credits)
 * @param {Bookshelf} bookshelf - the Bookshelf instance, initialized during app setup
 * @param {string} authorBBID - The target Author's BBID.
 * @returns {Promise} The returned Promise returns the Edition BBID and default alias
 */

export async function getEditionsCreditedToAuthor(
	bookshelf: Bookshelf, authorBBID: string
) {
	const rawSql = ` SELECT e.bbid , alias."name" from bookbrainz.author
	LEFT JOIN bookbrainz.author_credit_name acn on acn.author_bbid = author.bbid
	LEFT JOIN bookbrainz.author_credit ac on ac.id = acn.author_credit_id
	LEFT JOIN bookbrainz.edition e on e.author_credit_id = ac.id
	LEFT JOIN bookbrainz.alias on alias.id  = e.default_alias_id
	WHERE  author.bbid = '${authorBBID}'
		AND author.master = true
		AND e.master = true
		AND e.data_id is not null
	`;
	let queryResult: QueryResult<AliasAndBBIDRow>;
	try {
		queryResult = await bookshelf.knex.raw(rawSql);
	}
	catch (error) {
		// eslint-disable-next-line no-console
		console.error(error);
	}
	if (!Array.isArray(queryResult?.rows)) {
		return [];
	}
	return queryResult.rows;
}

/**
 * Fetches all the Edition Group entities credited to an Author (with Author Credits)
 * @param {Bookshelf} bookshelf - the Bookshelf instance, initialized during app setup
 * @param {string} authorBBID - The target Author's BBID.
 * @returns {Promise} The returned Promise returns the Edition Group BBID and default alias
 */

export async function getEditionGroupsCreditedToAuthor(
	bookshelf: Bookshelf, authorBBID: string
) {
	const rawSql = ` SELECT eg.bbid , alias."name" from bookbrainz.author
	LEFT JOIN bookbrainz.author_credit_name acn on acn.author_bbid = author.bbid
	LEFT JOIN bookbrainz.author_credit ac on ac.id = acn.author_credit_id
	LEFT JOIN bookbrainz.edition_group eg on eg.author_credit_id = ac.id
	LEFT JOIN bookbrainz.alias on alias.id  = eg.default_alias_id
	WHERE  author.bbid = '${authorBBID}'
		AND author.master = true
		AND eg.master = true
		AND eg.data_id is not null
	`;
	let queryResult: QueryResult<AliasAndBBIDRow>;
	try {
		queryResult = await bookshelf.knex.raw(rawSql);
	}
	catch (error) {
		// eslint-disable-next-line no-console
		console.error(error);
	}
	if (!Array.isArray(queryResult?.rows)) {
		return [];
	}
	return queryResult.rows;
}

type AliasAndBBIDRow = {
	name: string;
	bbid: string;
};
