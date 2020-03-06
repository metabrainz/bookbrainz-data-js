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
		languageId: 1,
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
			'bookbrainz.alias_set__alias',
			'bookbrainz.alias_set',
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

		const firstSetAliases = _.sortBy(firstSet.related('aliases').toJSON(), 'id');

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

		const aliases = _.sortBy(result.related('aliases').toJSON(), 'id');

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

		const firstSetAliases = _.orderBy(firstSet.related('aliases').toJSON(), 'id');

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

		const aliases = _.orderBy(result.related('aliases').toJSON(), 'id');

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

		const firstSetAliases = _.orderBy(firstSet.related('aliases').toJSON(), 'id');

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

		const aliases = _.orderBy(result.related('aliases').toJSON(), 'id');

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

	it('should allow only the default alias to be primary for that language', async function () {
		const firstAliasData = getAliasData();
		const secondAliasData = getAliasData();
		const thirdAliasData = getAliasData();
		firstAliasData.default = true;
		firstAliasData.primary = true;
		secondAliasData.primary = true;
		thirdAliasData.primary = true;

		const firstSet = await bookshelf.transaction(async (trx) => {
			const set = await updateAliasSet(
				bookbrainzData,
				trx,
				null,
				null,
				[firstAliasData, secondAliasData]
			);

			return set.refresh({transacting: trx, withRelated: 'aliases'});
		});

		const firstSetAliases = _.orderBy(firstSet.related('aliases').toJSON(), 'id');

		expect(firstSetAliases[0].primary).to.be.true;
		expect(firstSetAliases[1].primary).to.be.false;

		firstSetAliases[0].default = true;

		const addAlias = await bookshelf.transaction(async (trx) => {
			const set = await updateAliasSet(
				bookbrainzData,
				trx,
				firstSet,
				firstSetAliases[0].id,
				[...firstSetAliases, thirdAliasData]
			);

			return set.refresh({transacting: trx, withRelated: 'aliases'});
		});

		const aliases = _.orderBy(addAlias.related('aliases').toJSON(), 'id');
		expect(aliases.length).to.equal(3);
		expect(aliases[2].primary).to.be.false;
	});
	it('should allow only one primary alias per language', async function () {
		await new Language({...languageAttribs, id: 2, name: 'Fnordish'}).save(null, {method: 'insert'});

		const firstAliasData = getAliasData();
		firstAliasData.default = true;
		firstAliasData.primary = true;

		const secondAliasData = getAliasData();
		secondAliasData.languageId = 2;
		secondAliasData.primary = true;
		const thirdAliasData = getAliasData();
		thirdAliasData.languageId = 2;
		thirdAliasData.primary = true;

		const aliasSet = await bookshelf.transaction(async (trx) => {
			const set = await updateAliasSet(
				bookbrainzData,
				trx,
				null,
				null,
				[firstAliasData, secondAliasData, thirdAliasData]
			);

			return set.refresh({transacting: trx, withRelated: 'aliases'});
		});

		const aliases = _.orderBy(aliasSet.related('aliases').toJSON(), 'id');

		expect(aliases[0].primary).to.be.true;

		expect(aliases[1].languageId).to.equal(2);
		expect(aliases[1].primary).to.be.true;

		expect(aliases[2].languageId).to.equal(2);
		expect(aliases[2].primary).to.be.false;
	});
});
