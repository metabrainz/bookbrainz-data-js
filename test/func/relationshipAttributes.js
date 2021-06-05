/*
 * Copyright (C) 2021  Akash Gupta
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
const {updateRelationshipAttributeSet} = bookbrainzData.func.relationshipAttributes;
const {RelationshipAttributeType, bookshelf} = bookbrainzData;

function getRelationshipAttributeData(attributeType, value) {
	return {
		attributeType,
		value: {
			 textValue: value
		}
	};
}

describe('updateRelationshipAttributeSet', () => {
	const relAttribTypeAttribs1 = {
		id: 1,
		name: 'position',
		root: 1
	};
	const relAttribTypeAttribs2 = {
		id: 2,
		name: 'number',
		root: 1
	};

	beforeEach(async () => {
		await new RelationshipAttributeType(relAttribTypeAttribs1).save(null, {method: 'insert'});
		await new RelationshipAttributeType(relAttribTypeAttribs2).save(null, {method: 'insert'});
	});

	afterEach(function () {
		return truncateTables(bookshelf, [
			'bookbrainz.relationship_attribute_set',
			'bookbrainz.relationship_attribute',
			'bookbrainz.relationship_attribute_type'
		]);
	});

	it('should return null if all null/empty sets are passed', async function () {
		const result = await bookshelf.transaction((trx) => updateRelationshipAttributeSet(
			bookbrainzData, trx, null, []
		));

		expect(result).to.be.null;
	});

	it('should return a set with one attribute if one attribute is added to an empty set', async function () {
		const firstRelationshipAttributeData = getRelationshipAttributeData(1, '1');
		const result = await bookshelf.transaction(async (trx) => {
			const set = await updateRelationshipAttributeSet(
				bookbrainzData, trx, null, [firstRelationshipAttributeData]
			);
			return set.refresh({transacting: trx, withRelated: 'attribute.value'});
		});

		const attributes = result.related('attribute').toJSON();

		expect(attributes).to.have.lengthOf(1);
		expect(attributes[0]).to.include({attributeType: 1});
		expect(attributes[0].value).to.include({textValue: '1'});
	});

	it('should return the old set if no changes are made', async function () {
		const firstRelationshipAttributeData = getRelationshipAttributeData(1, '1');
		const secondRelationshipAttributeData = getRelationshipAttributeData(2, '2');
		const firstSet = await bookshelf.transaction(async (trx) => {
			const set = await updateRelationshipAttributeSet(
				bookbrainzData,
				trx,
				null,
				[firstRelationshipAttributeData, secondRelationshipAttributeData]
			);

			return set.refresh({transacting: trx, withRelated: 'attribute.value'});
		});

		const result = await bookshelf.transaction(async (trx) => {
			const set = await updateRelationshipAttributeSet(
				bookbrainzData,
				trx,
				firstSet,
				[firstRelationshipAttributeData, secondRelationshipAttributeData]
			);

			return set.refresh({transacting: trx, withRelated: 'attribute.value'});
		});
		const resultJSON = result.toJSON();
		expect(resultJSON.id).to.equal(firstSet.toJSON().id);
		expect(resultJSON.attribute).to.have.lengthOf(2);
		expect(resultJSON.attribute[0].attributeType).to.equal(firstRelationshipAttributeData.attributeType);
		expect(resultJSON.attribute[0].value).to.be.an('object').to.include(firstRelationshipAttributeData.value);
		expect(resultJSON.attribute[1].attributeType).to.equal(secondRelationshipAttributeData.attributeType);
		expect(resultJSON.attribute[1].value).to.be.an('object').to.include(secondRelationshipAttributeData.value);
	});

	it('should return a new set if changes are made to the attributes in the set', async function () {
		const firstRelationshipAttributeData = getRelationshipAttributeData(1, '1');
		const secondRelationshipAttributeData = getRelationshipAttributeData(2, '2');
		const firstSet = await bookshelf.transaction(async (trx) => {
			const set = await updateRelationshipAttributeSet(
				bookbrainzData,
				trx,
				null,
				[firstRelationshipAttributeData, secondRelationshipAttributeData]
			);

			return set.refresh({transacting: trx, withRelated: 'attribute.value'});
		});
		const firstSetRelationships = firstSet.related('attribute').toJSON();

		const thirdRelationshipData = getRelationshipAttributeData(1, '3');
		thirdRelationshipData.id = firstSetRelationships[0].id;
		firstSetRelationships[0] = thirdRelationshipData;

		const result = await bookshelf.transaction(async (trx) => {
			const set = await updateRelationshipAttributeSet(
				bookbrainzData,
				trx,
				firstSet,
				firstSetRelationships
			);

			return set.refresh({transacting: trx, withRelated: 'attribute.value'});
		});
		const resultJSON = result.toJSON();

		expect(resultJSON.id).to.not.equal(firstSet.toJSON().id);
		expect(resultJSON.attribute).to.have.lengthOf(2);
		expect(resultJSON.attribute[0].attributeType).to.equal(secondRelationshipAttributeData.attributeType);
		expect(resultJSON.attribute[0].value).to.be.an('object').to.include(secondRelationshipAttributeData.value);
		expect(resultJSON.attribute[1].attributeType).to.equal(thirdRelationshipData.attributeType);
		expect(resultJSON.attribute[1].value).to.be.an('object').to.include(thirdRelationshipData.value);
	});
});
