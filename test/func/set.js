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
const {
	getAddedItems, getRemovedItems, getUnchangedItems, removeItemsFromSet,
	createNewSetWithItems
} = bookbrainzData.func.set;
const {AliasSet, Language, bookshelf} = bookbrainzData;

const arrayA = [
	{a: 1, b: 2},
	{a: 3, b: 4}
];
const sameArrayB = [
	{a: 1, b: 2},
	{a: 3, b: 4}
];
const diffArrayB = [
	{a: 1, b: 2},
	{a: 3, b: 5}
];

function compare(obj, other) {
	return obj.a === other.a && obj.b === other.b;
}

describe('getAddedItems', () => {
	it('should return an empty list for two arrays of identical objects',
		() => {
			const result = getAddedItems(arrayA, sameArrayB, compare);

			return expect(result).to.be.empty;
		});

	it('should return a single element when one element is different', () => {
		const result = getAddedItems(arrayA, diffArrayB, compare);

		return expect(result).to.deep.equal([diffArrayB[1]]);
	});
});

describe('getUnchangedItems', () => {
	it('should return all objects for two arrays of identical objects', () => {
		const result = getUnchangedItems(arrayA, sameArrayB, compare);

		return expect(result).to.deep.equal(arrayA);
	});

	it('should return a single element when one element is different', () => {
		const result = getUnchangedItems(arrayA, diffArrayB, compare);

		return expect(result).to.deep.equal([diffArrayB[0]]);
	});
});

function removeTests(removeFunc) {
	return () => {
		it('should return an empty list for two arrays of identical objects',
			() => {
				const result = removeFunc(arrayA, sameArrayB, compare);

				return expect(result).to.be.empty;
			});

		it('should return a single element when one element is different',
			() => {
				const result = removeFunc(arrayA, diffArrayB, compare);

				return expect(result).to.deep.equal([arrayA[1]]);
			});
	};
}

describe('getRemovedItems', removeTests(getRemovedItems));
describe('removeItemsFromSet', removeTests(removeItemsFromSet));


function getAliasData() {
	const firstName = faker.name.firstName();
	const lastName = faker.name.lastName();

	return {
		name: `${firstName} ${lastName}`,
		sortName: `${lastName}, ${firstName}`
	};
}

describe('createNewSetWithItems', () => {
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

	it('should return null if no items are provided', async function () {
		const result = await bookshelf.transaction(
			(trx) =>
				createNewSetWithItems(bookbrainzData, trx, AliasSet, [], [])
		);

		expect(result).to.be.null;
	});

	/* eslint-disable-next-line max-len */
	it('should error out if non-existent unchanged items are provided', function () {
		const resultPromise = bookshelf.transaction(
			(trx) =>
				createNewSetWithItems(
					bookbrainzData,
					trx,
					AliasSet,
					[getAliasData()],
					[]
				)
		);

		return expect(resultPromise).to.be.rejected;
	});

	/* eslint-disable-next-line max-len */
	it('should return a new set with one item if an item is added', async function () {
		const aliasData = getAliasData();
		const resultSet = await bookshelf.transaction(
			async (trx) => {
				const set = await createNewSetWithItems(
					bookbrainzData,
					trx,
					AliasSet,
					[],
					[aliasData]
				);

				return set.refresh({transacting: trx, withRelated: 'items'});
			}
		);

		const items = resultSet.related('items').toJSON();

		expect(items).to.have.lengthOf(1);
		expect(items[0]).to.include({
			...aliasData,
			languageId: null
		});
	});

	/* eslint-disable-next-line max-len */
	it('should return a new set with two items if an item is added to an existing unchanged item', async function () {
		const firstAliasData = getAliasData();
		const firstSet = await bookshelf.transaction(
			async (trx) => {
				const set = await createNewSetWithItems(
					bookbrainzData,
					trx,
					AliasSet,
					[],
					[firstAliasData]
				);

				return set.refresh({transacting: trx, withRelated: 'items'});
			}
		);

		const firstSetItems = firstSet.related('items').toJSON();

		const secondAliasData = getAliasData();
		const resultSet = await bookshelf.transaction(
			async (trx) => {
				const set = await createNewSetWithItems(
					bookbrainzData,
					trx,
					AliasSet,
					firstSetItems,
					[secondAliasData]
				);

				return set.refresh({transacting: trx, withRelated: 'items'});
			}
		);

		const items = resultSet.related('items').toJSON();

		expect(items).to.have.lengthOf(2);
		expect(items[0]).to.include({
			...firstAliasData,
			languageId: null
		});
		expect(items[1]).to.include({
			...secondAliasData,
			languageId: null
		});
	});
});
