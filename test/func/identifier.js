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
const {updateIdentifierSet} = bookbrainzData.func.identifier;
const {IdentifierType, bookshelf} = bookbrainzData;

function getIdentifierData() {
	return {
		typeId: 1,
		value: faker.random.alphaNumeric(10)
	};
}

/* eslint-disable-next-line max-lines-per-function */
describe('updateIdentifierSet', () => {
	const idTypeAttribs = {
		description: 'description',
		detectionRegex: 'detection',
		displayTemplate: 'display',
		entityType: 'Author',
		id: 1,
		label: 'test_type',
		validationRegex: 'validation'
	};

	beforeEach(function () {
		return new IdentifierType(idTypeAttribs).save(null, {method: 'insert'});
	});

	afterEach(function () {
		return truncateTables(bookshelf, [
			'bookbrainz.identifier_set__identifier',
			'bookbrainz.identifier_set',
			'bookbrainz.identifier',
			'bookbrainz.identifier_type'
		]);
	});

	/* eslint-disable-next-line max-len */
	it('should return null if all null/empty sets are passed', async function () {
		const result = await bookshelf.transaction((trx) => updateIdentifierSet(
			bookbrainzData, trx, null, []
		));

		expect(result).to.be.null;
	});

	/* eslint-disable-next-line max-len */
	it('should return a set with one identifier if one identifier is added to an empty set', async function () {
		const identifierData = getIdentifierData(true);

		const result = await bookshelf.transaction(async (trx) => {
			const set = await updateIdentifierSet(
				bookbrainzData, trx, null, [identifierData]
			);

			return set.refresh({transacting: trx, withRelated: 'identifiers'});
		});

		const identifiers = result.related('identifiers').toJSON();

		expect(identifiers).to.have.lengthOf(1);
		expect(identifiers[0]).to.include(identifierData);
	});

	/* eslint-disable-next-line max-len */
	it('should return a new set if changes are made to the identifiers in the set', async function () {
		const firstIdentifierData = getIdentifierData();
		const secondIdentifierData = getIdentifierData();

		const firstSet = await bookshelf.transaction(async (trx) => {
			const set = await updateIdentifierSet(
				bookbrainzData,
				trx,
				null,
				[firstIdentifierData, secondIdentifierData]
			);

			return set.refresh({transacting: trx, withRelated: 'identifiers'});
		});

		const firstSetIdentifiers = firstSet.related('identifiers').toJSON();

		const thirdIdentifierData = getIdentifierData();
		thirdIdentifierData.id = firstSetIdentifiers[1].id;

		firstSetIdentifiers[1] = thirdIdentifierData;

		const result = await bookshelf.transaction(async (trx) => {
			const set = await updateIdentifierSet(
				bookbrainzData,
				trx,
				firstSet,
				firstSetIdentifiers
			);

			return set.refresh({transacting: trx, withRelated: 'identifiers'});
		});

		const identifiers = result.related('identifiers').toJSON();

		expect(result.get('id')).to.not.equal(firstSet.get('id'));
		expect(identifiers).to.have.lengthOf(2);
		expect(identifiers[0]).to.include(firstIdentifierData);
		expect(identifiers[1]).to.include(_.omit(thirdIdentifierData, 'id'));
	});

	it('should return the old set if no changes are made', async function () {
		const firstIdentifierData = getIdentifierData();
		const secondIdentifierData = getIdentifierData();

		const firstSet = await bookshelf.transaction(async (trx) => {
			const set = await updateIdentifierSet(
				bookbrainzData,
				trx,
				null,
				[firstIdentifierData, secondIdentifierData]
			);

			return set.refresh({transacting: trx, withRelated: 'identifiers'});
		});

		const firstSetIdentifiers = firstSet.related('identifiers').toJSON();

		const result = await bookshelf.transaction(async (trx) => {
			const set = await updateIdentifierSet(
				bookbrainzData,
				trx,
				firstSet,
				firstSetIdentifiers
			);

			return set.refresh({transacting: trx, withRelated: 'identifiers'});
		});

		const identifiers = result.related('identifiers').toJSON();

		expect(result.get('id')).to.equal(firstSet.get('id'));
		expect(identifiers).to.have.lengthOf(2);
		expect(identifiers[0]).to.include(firstIdentifierData);
		expect(identifiers[1]).to.include(secondIdentifierData);
	});
});
