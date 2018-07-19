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
const {updateAliasSet} = bookbrainzData.func.alias;
const {Language, bookshelf} = bookbrainzData;

function getAliasData() {
	const firstName = faker.name.firstName();
	const lastName = faker.name.lastName();

	return {
		languageId: null,
		name: `${firstName} ${lastName}`,
		sortName: `${lastName}, ${firstName}`
	};
}


describe('updateAliasSet', () => {
	const languageAttribs = {
		frequency: 1,
		id: 1,
		isoCode1: 'en',
		isoCode2b: 'eng',
		isoCode2t: 'eng',
		isoCode3: 'eng',
		name: 'English'
	};

	beforeEach(function () {
		return new Language(languageAttribs).save(null, {method: 'insert'});
	});

	afterEach(function () {
		return truncateTables(bookshelf, [
			'bookbrainz.alias',
			'musicbrainz.language'
		]);
	});

	/* eslint-disable-next-line max-len */
	it('should return null if all null/empty sets are passed', async function () {
		const result = await bookshelf.transaction((trx) => updateAliasSet(
			bookbrainzData, trx, null, null, []
		));

		expect(result).to.be.null;
	});

	/* eslint-disable-next-line max-len */
	it('should return a set with one alias if one alias is added to an empty set', async function () {
		const aliasData = getAliasData(true);

		const result = await bookshelf.transaction(async (trx) => {
			const set = await updateAliasSet(
				bookbrainzData, trx, null, null, [{...aliasData, default: true}]
			);

			return set.refresh({transacting: trx, withRelated: 'aliases'});
		});

		const aliases = result.related('aliases').toJSON();

		expect(aliases).to.have.lengthOf(1);
		expect(result.get('defaultAliasId')).to.equal(aliases[0].id);
		expect(aliases[0]).to.include(aliasData);
	});

	/* eslint-disable-next-line max-len */
	it('should return a new set if changes are made to the aliases in the set', async function () {
		const firstAliasData = getAliasData();
		const secondAliasData = getAliasData();

		const firstSet = await bookshelf.transaction(async (trx) => {
			const set = await updateAliasSet(
				bookbrainzData,
				trx,
				null,
				null,
				[{...firstAliasData, default: true}, secondAliasData]
			);

			return set.refresh({transacting: trx, withRelated: 'aliases'});
		});

		const firstSetAliases = firstSet.related('aliases').toJSON();

		const thirdAliasData = getAliasData();
		thirdAliasData.id = firstSetAliases[1].id;

		firstSetAliases[1] = thirdAliasData;

		const result = await bookshelf.transaction(async (trx) => {
			const [defaultAlias, ...others] = firstSetAliases;
			const set = await updateAliasSet(
				bookbrainzData,
				trx,
				firstSet,
				firstSetAliases[0].id,
				[{...defaultAlias, default: true}, ...others]
			);

			return set.refresh({transacting: trx, withRelated: 'aliases'});
		});

		const aliases = result.related('aliases').toJSON();

		expect(result.get('id')).to.not.equal(firstSet.get('id'));
		expect(result.get('defaultAliasId')).to.equal(aliases[0].id);
		expect(aliases).to.have.lengthOf(2);
		expect(aliases[0]).to.include(firstAliasData);
		expect(aliases[1]).to.include(_.omit(thirdAliasData, 'id'));
	});

	it('should return the old set if no changes are made', async function () {
		const firstAliasData = getAliasData();
		const secondAliasData = getAliasData();

		const firstSet = await bookshelf.transaction(async (trx) => {
			const set = await updateAliasSet(
				bookbrainzData,
				trx,
				null,
				null,
				[{...firstAliasData, default: true}, secondAliasData]
			);

			return set.refresh({transacting: trx, withRelated: 'aliases'});
		});

		const firstSetAliases = firstSet.related('aliases').toJSON();

		const result = await bookshelf.transaction(async (trx) => {
			const [defaultAlias, ...others] = firstSetAliases;
			const set = await updateAliasSet(
				bookbrainzData,
				trx,
				firstSet,
				firstSetAliases[0].id,
				[{...defaultAlias, default: true}, ...others]
			);

			return set.refresh({transacting: trx, withRelated: 'aliases'});
		});

		const aliases = result.related('aliases').toJSON();

		expect(result.get('id')).to.equal(firstSet.get('id'));
		expect(result.get('defaultAliasId')).to.equal(aliases[0].id);
		expect(aliases).to.have.lengthOf(2);
		expect(aliases[0]).to.include(firstAliasData);
		expect(aliases[1]).to.include(secondAliasData);
	});

	/* eslint-disable-next-line max-len */
	it('should return a new set if the default alias is changed', async function () {
		const firstAliasData = getAliasData();
		const secondAliasData = getAliasData();

		const firstSet = await bookshelf.transaction(async (trx) => {
			const set = await updateAliasSet(
				bookbrainzData,
				trx,
				null,
				null,
				[{...firstAliasData, default: true}, secondAliasData]
			);

			return set.refresh({transacting: trx, withRelated: 'aliases'});
		});

		const firstSetAliases = firstSet.related('aliases').toJSON();

		const others = _.initial(firstSetAliases);
		const defaultAlias = _.last(firstSetAliases);

		const result = await bookshelf.transaction(async (trx) => {
			const set = await updateAliasSet(
				bookbrainzData,
				trx,
				firstSet,
				firstSetAliases[0].id,
				[...others, {...defaultAlias, default: true}]
			);

			return set.refresh({transacting: trx, withRelated: 'aliases'});
		});

		const aliases = result.related('aliases').toJSON();

		expect(result.get('id')).to.not.equal(firstSet.get('id'));
		expect(result.get('defaultAliasId')).to.equal(aliases[1].id);
		expect(aliases).to.have.lengthOf(2);
		expect(aliases[0]).to.include(firstAliasData);
		expect(aliases[1]).to.include(secondAliasData);
	});

	/* eslint-disable-next-line max-len */
	it('should error if a set of aliases is passed with no default', function () {
		const firstAliasData = getAliasData();
		const secondAliasData = getAliasData();

		const resultPromise = bookshelf.transaction(async (trx) => {
			const set = await updateAliasSet(
				bookbrainzData,
				trx,
				null,
				null,
				[firstAliasData, secondAliasData]
			);

			return set.refresh({transacting: trx, withRelated: 'aliases'});
		});

		expect(resultPromise).to.be.rejected;
	});
});
