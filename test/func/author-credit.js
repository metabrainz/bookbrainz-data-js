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

import _ from 'lodash';
import bookbrainzData from '../bookshelf';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import faker from 'faker';
import {truncateTables} from '../../lib/util';


chai.use(chaiAsPromised);
const {expect} = chai;
const {fetchOrCreateCredit, updateAuthorCredit} = bookbrainzData.func.authorCredit;
const {Entity, AuthorHeader, bookshelf} = bookbrainzData;

const aBBID = faker.random.uuid();
const bBBID = faker.random.uuid();
const cBBID = faker.random.uuid();

describe('fetchOrCreateCredit', () => {
	beforeEach(
		async () => {
			await new Entity({bbid: aBBID, type: 'Author'})
				.save(null, {method: 'insert'});
			await new Entity({bbid: bBBID, type: 'Author'})
				.save(null, {method: 'insert'});
			await new Entity({bbid: cBBID, type: 'Author'})
				.save(null, {method: 'insert'});
			await new AuthorHeader({bbid: aBBID})
				.save(null, {method: 'insert'});
			await new AuthorHeader({bbid: bBBID})
				.save(null, {method: 'insert'});
			await new AuthorHeader({bbid: cBBID})
				.save(null, {method: 'insert'});
		}
	);

	afterEach(function truncate() {
		this.timeout(0); // eslint-disable-line babel/no-invalid-this

		return truncateTables(bookshelf, [
			'bookbrainz.entity',
			'bookbrainz.author_header',
			'bookbrainz.author_credit_name',
			'bookbrainz.author_credit'
		]);
	});

	/* eslint-disable-next-line max-len */
	it('should create a single author credit if called twice', async function () {
		const data = [
			{authorBBID: aBBID, joinPhrase: ' and ', name: 'Author A'},
			{authorBBID: bBBID, joinPhrase: '', name: 'Author B'}
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

describe('updateCreateCredit', () => {
	beforeEach(
		async () => {
			await new Entity({bbid: aBBID, type: 'Author'})
				.save(null, {method: 'insert'});
			await new Entity({bbid: bBBID, type: 'Author'})
				.save(null, {method: 'insert'});
			await new Entity({bbid: cBBID, type: 'Author'})
				.save(null, {method: 'insert'});
			await new AuthorHeader({bbid: aBBID})
				.save(null, {method: 'insert'});
			await new AuthorHeader({bbid: bBBID})
				.save(null, {method: 'insert'});
			await new AuthorHeader({bbid: cBBID})
				.save(null, {method: 'insert'});
		}
	);

	afterEach(function truncate() {
		this.timeout(0); // eslint-disable-line babel/no-invalid-this

		return truncateTables(bookshelf, [
			'bookbrainz.entity',
			'bookbrainz.author_header',
			'bookbrainz.author_credit_name',
			'bookbrainz.author_credit'
		]);
	});

	/* eslint-disable-next-line max-len */
	it('should return the original credit if the credit is unchanged', async function () {
		const data = [
			{authorBBID: aBBID, joinPhrase: ' and ', name: 'Author A'},
			{authorBBID: bBBID, joinPhrase: '', name: 'Author B'}
		];

		const firstCredit = await bookshelf.transaction(
			(trx) => fetchOrCreateCredit(bookbrainzData, trx, data)
		);

		const secondCredit = await bookshelf.transaction(
			(trx) => updateAuthorCredit(bookbrainzData, trx, firstCredit, data)
		);

		expect(firstCredit.toJSON()).to.deep.equal(secondCredit.toJSON());
	});

	/* eslint-disable-next-line max-len */
	it('should return a new credit if the credit is updated', async function () {
		const data = [
			{authorBBID: aBBID, joinPhrase: ' and ', name: 'Author A'},
			{authorBBID: bBBID, joinPhrase: '', name: 'Author B'}
		];

		const firstCredit = await bookshelf.transaction(
			(trx) => fetchOrCreateCredit(bookbrainzData, trx, data)
		);

		data[0].authorBBID = cBBID;

		const secondCredit = await bookshelf.transaction(
			(trx) => updateAuthorCredit(bookbrainzData, trx, firstCredit, data)
		);

		const firstCreditJSON = firstCredit.toJSON();
		const secondCreditJSON = secondCredit.toJSON();

		expect(firstCreditJSON.id).to.not.equal(secondCreditJSON.id);
		expect(_.get(secondCreditJSON, 'names[0].authorBBID')).to.equal(cBBID);
		expect(_.get(firstCreditJSON, 'names[0].authorCreditID')).to.not
			.equal(_.get(secondCreditJSON, 'names[0].authorCreditID'));
		expect(_.get(firstCreditJSON, 'names[1].authorCreditID')).to.not
			.equal(_.get(secondCreditJSON, 'names[1].authorCreditID'));
	});

	/* eslint-disable-next-line max-len */
	it('should return the original credit if changed, and then reverted', async function () {
		const data = [
			{authorBBID: aBBID, joinPhrase: ' and ', name: 'Author A'},
			{authorBBID: bBBID, joinPhrase: '', name: 'Author B'}
		];

		const firstCredit = await bookshelf.transaction(
			(trx) => fetchOrCreateCredit(bookbrainzData, trx, data)
		);

		data[0].authorBBID = cBBID;

		const secondCredit = await bookshelf.transaction(
			(trx) => updateAuthorCredit(bookbrainzData, trx, firstCredit, data)
		);

		data[0].authorBBID = aBBID;

		const thirdCredit = await bookshelf.transaction(
			(trx) =>
				updateAuthorCredit(bookbrainzData, trx, secondCredit, data)
		);

		const firstCreditJSON = firstCredit.toJSON();
		const thirdCreditJSON = thirdCredit.toJSON();

		expect(firstCreditJSON.id).to.equal(thirdCreditJSON.id);
		expect(_.get(thirdCreditJSON, 'names[0].authorBBID')).to.equal(aBBID);
		expect(_.get(firstCreditJSON, 'names[0].authorCreditID')).to
			.equal(_.get(thirdCreditJSON, 'names[0].authorCreditID'));
		expect(_.get(firstCreditJSON, 'names[1].authorCreditID')).to
			.equal(_.get(thirdCreditJSON, 'names[1].authorCreditID'));
	});
});
