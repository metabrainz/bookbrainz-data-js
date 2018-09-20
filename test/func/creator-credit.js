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

import bookbrainzData from '../bookshelf';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import faker from 'faker';
import {truncateTables} from '../../lib/util';


chai.use(chaiAsPromised);
const {expect} = chai;
const {fetchOrCreateCredit} = bookbrainzData.func.creatorCredit;
const {Entity, CreatorHeader, bookshelf} = bookbrainzData;

const aBBID = faker.random.uuid();
const bBBID = faker.random.uuid();
const cBBID = faker.random.uuid();

describe('fetchOrCreateCredit', () => {
	beforeEach(
		async () => {
			await new Entity({bbid: aBBID, type: 'Creator'})
				.save(null, {method: 'insert'});
			await new Entity({bbid: bBBID, type: 'Creator'})
				.save(null, {method: 'insert'});
			await new Entity({bbid: cBBID, type: 'Creator'})
				.save(null, {method: 'insert'});
			await new CreatorHeader({bbid: aBBID})
				.save(null, {method: 'insert'});
			await new CreatorHeader({bbid: bBBID})
				.save(null, {method: 'insert'});
			await new CreatorHeader({bbid: cBBID})
				.save(null, {method: 'insert'});
		}
	);

	afterEach(function truncate() {
		this.timeout(0); // eslint-disable-line babel/no-invalid-this

		return truncateTables(bookshelf, [
			'bookbrainz.entity',
			'bookbrainz.creator_header',
			'bookbrainz.creator_credit_name',
			'bookbrainz.creator_credit'
		]);
	});

	/* eslint-disable-next-line max-len */
	it('should create a single creator credit if called twice', async function () {
		const data = [
			{creatorBBID: aBBID, joinPhrase: ' and ', name: 'Creator A'},
			{creatorBBID: bBBID, joinPhrase: '', name: 'Creator B'}
		];

		const firstCredit = await bookshelf.transaction(
			(trx) => fetchOrCreateCredit(bookbrainzData, trx, data)
		);

		const secondCredit = await bookshelf.transaction(
			(trx) => fetchOrCreateCredit(bookbrainzData, trx, data)
		);

		expect(firstCredit.toJSON()).to.deep.equal(secondCredit.toJSON());
	});
});
