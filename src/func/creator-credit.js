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

// @flow

import type {CreatorCreditNameT, Transaction} from './types';
import _ from 'lodash';


function findCreatorCredit(
	orm: any, transacting: Transaction, creatorCredit: Array<CreatorCreditNameT>
) {
	const tables = {cc: 'bookbrainz.creator_credit'};

	const joins = _.map(
		creatorCredit,
		(creatorCreditName: CreatorCreditNameT, index: number) =>
			[
				`JOIN bookbrainz.creator_credit_name ccn${index} ` +
				`ON ccn${index}.creator_credit_id = cc.id`
			]
	);

	const wheres = _.reduce(
		creatorCredit,
		(result: {}, creatorCreditName: CreatorCreditNameT, index: number) => {
			result[`ccn${index}.position`] = index;
			result[`ccn${index}.creator_bbid`] = creatorCreditName.bbid;
			result[`ccn${index}.name`] = creatorCreditName.name;
			result[`ccn${index}.join_phrase`] = creatorCreditName.joinPhrase;
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
	orm: any, transacting: Transaction, creatorCredit: Array<CreatorCreditNameT>
) {
	const result = await findCreatorCredit(orm, transacting, creatorCredit);

	if (result) {
		return orm.CreatorCredit.forge({id: result.id})
			.fetch({transacting, withRelated: 'names'});
	}

	const newCredit = await new orm.CreatorCredit(
		{creatorCount: creatorCredit.length}
	).save(null, {transacting});

	/* eslint-disable camelcase */
	await transacting('bookbrainz.creator_credit_name')
		.insert(
			_.map(creatorCredit, (creatorCreditName, index) => ({
				creator_bbid: creatorCreditName.bbid,
				creator_credit_id: newCredit.get('id'),
				join_phrase: creatorCreditName.joinPhrase,
				name: creatorCreditName.name,
				position: index
			}))
		).returning(['creator_bbid', 'join_phrase', 'name', 'position']);
	/* eslint-enable camelcase */

	return newCredit.refresh({transacting, withRelated: 'names'});
}
