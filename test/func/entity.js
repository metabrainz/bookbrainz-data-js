/* eslint-disable camelcase */
/*
 * Copyright (C) 2019  Nicolas Pelletier
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
const {recursivelyGetRedirectBBID, getEntity} = bookbrainzData.func.entity;
const {Entity, AuthorHeader, bookshelf} = bookbrainzData;

const aBBID = faker.random.uuid();
const bBBID = faker.random.uuid();
const cBBID = faker.random.uuid();
const dBBID = faker.random.uuid();
const eBBID = faker.random.uuid();

describe('recursivelyGetRedirectBBID', () => {
	before(
		async () => {
			await new Entity({bbid: aBBID, type: 'Author'})
				.save(null, {method: 'insert'});
			await new Entity({bbid: bBBID, type: 'Author'})
				.save(null, {method: 'insert'});
			await new Entity({bbid: cBBID, type: 'Author'})
				.save(null, {method: 'insert'});
			await new Entity({bbid: dBBID, type: 'Author'})
				.save(null, {method: 'insert'});
			await new Entity({bbid: eBBID, type: 'Author'})
				.save(null, {method: 'insert'});
			// Redirect aBBID -> bBBID  and cBBID -> dBBID -> eBBID
			await bookshelf.knex('bookbrainz.entity_redirect').insert([
				{source_bbid: aBBID, target_bbid: bBBID},
				{source_bbid: cBBID, target_bbid: dBBID},
				{source_bbid: dBBID, target_bbid: eBBID}
			]);
		}
	);

	after(function truncate() {
		this.timeout(0); // eslint-disable-line babel/no-invalid-this
		return truncateTables(bookshelf, ['bookbrainz.entity_redirect']);
	});

	it('should return a single-step redirected bbid', async function () {
		const redirectedBBID = await recursivelyGetRedirectBBID(bookbrainzData, aBBID);
		expect(redirectedBBID).to.equal(bBBID);
	});

	it('should return a multiple-step redirected bbid', async function () {
		const redirectedBBID = await recursivelyGetRedirectBBID(bookbrainzData, cBBID);
		expect(redirectedBBID).to.equal(eBBID);
	});
});
