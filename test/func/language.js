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
import {truncateTables} from '../../lib/util';


chai.use(chaiAsPromised);
const {expect} = chai;
const {updateLanguageSet} = bookbrainzData.func.language;
const {Language, bookshelf} = bookbrainzData;

describe('updateLanguageSet', () => {
	const firstLanguageAttribs = {
		frequency: 1,
		id: 1,
		isoCode1: 'en',
		isoCode2b: 'eng',
		isoCode2t: 'eng',
		isoCode3: 'eng',
		name: 'English'
	};

	const secondLanguageAttribs = {
		frequency: 1,
		id: 2,
		isoCode1: 'en',
		isoCode2b: 'eng',
		isoCode2t: 'eng',
		isoCode3: 'eng',
		name: 'English'
	};

	beforeEach(function () {
		return Promise.all([
			new Language(firstLanguageAttribs).save(null, {method: 'insert'}),
			new Language(secondLanguageAttribs).save(null, {method: 'insert'})
		]);
	});

	afterEach(function () {
		return truncateTables(bookshelf, [
			'musicbrainz.language'
		]);
	});

	/* eslint-disable-next-line max-len */
	it('should return null if all null/empty sets are passed', async function () {
		const result = await bookshelf.transaction((trx) => updateLanguageSet(
			bookbrainzData, trx, null, []
		));

		expect(result).to.be.null;
	});

	/* eslint-disable-next-line max-len */
	it('should return a set with one language if one language is added to an empty set', async function () {
		const result = await bookshelf.transaction(async (trx) => {
			const set = await updateLanguageSet(
				bookbrainzData, trx, null, [{id: 1}]
			);

			return set.refresh({transacting: trx, withRelated: 'languages'});
		});

		const languages = result.related('languages').toJSON();

		expect(languages).to.have.lengthOf(1);
		expect(languages[0]).to.include({id: 1});
	});

	it('should return the old set if no changes are made', async function () {
		const firstSet = await bookshelf.transaction(async (trx) => {
			const set = await updateLanguageSet(
				bookbrainzData,
				trx,
				null,
				[{id: 1}, {id: 2}]
			);

			return set.refresh({transacting: trx, withRelated: 'languages'});
		});

		const result = await bookshelf.transaction(async (trx) => {
			const set = await updateLanguageSet(
				bookbrainzData,
				trx,
				firstSet,
				[{id: 1}, {id: 2}]
			);

			return set.refresh({transacting: trx, withRelated: 'languages'});
		});

		let languages = result.related('languages').toJSON();
		languages = languages.sort((a, b) => a.id - b.id);

		expect(result.get('id')).to.equal(firstSet.get('id'));
		expect(languages).to.have.lengthOf(2);
		expect(languages[0]).to.include({id: 1});
		expect(languages[1]).to.include({id: 2});
	});
});
