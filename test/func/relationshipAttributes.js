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
const {RelationshipAttribute, RelationshipAttributeType, bookshelf} = bookbrainzData;

describe('updateRelationshipAttributeSet', () => {
	const firstRelationshipAttribs = {
		attributeType: 1,
		id: 1
	};
	const relAttribTypeAttribs = {
		id: 1,
		name: 'position',
		root: 1
	};

	const secondRelationshipAttribs = {
		attributeType: 1,
		id: 2
	};

	beforeEach(async () => {
		await new RelationshipAttributeType(relAttribTypeAttribs).save(null, {method: 'insert'});
	        await new RelationshipAttribute(firstRelationshipAttribs).save(null, {method: 'insert'});
		await new RelationshipAttribute(secondRelationshipAttribs).save(null, {method: 'insert'});
	});

	afterEach(function () {
		return truncateTables(bookshelf, [
			'bookbrainz.relationship_attribute_set',
			'bookbrainz.relationship_attribute',
			'bookbrainz.relationship_attribute_type'
		]);
	});

	/* eslint-disable-next-line max-len */
	it('should return null if all null/empty sets are passed', async function () {
		const result = await bookshelf.transaction((trx) => updateRelationshipAttributeSet(
			bookbrainzData, trx, null, []
		));

		expect(result).to.be.null;
	});

	/* eslint-disable-next-line max-len */
	it('should return a set with one attribute if one attribute is added to an empty set', async function () {
		const result = await bookshelf.transaction(async (trx) => {
			const set = await updateRelationshipAttributeSet(
				bookbrainzData, trx, null, [{id: 1}]
			);

			return set.refresh({transacting: trx, withRelated: 'attribute'});
		});

		const attributes = result.related('attribute').toJSON();

		expect(attributes).to.have.lengthOf(1);
		expect(attributes[0]).to.include({id: 1});
	});

	it('should return the old set if no changes are made', async function () {
		const firstSet = await bookshelf.transaction(async (trx) => {
			const set = await updateRelationshipAttributeSet(
				bookbrainzData,
				trx,
				null,
				[{id: 1}, {id: 2}]
			);

			return set.refresh({transacting: trx, withRelated: 'attribute'});
		});

		const result = await bookshelf.transaction(async (trx) => {
			const set = await updateRelationshipAttributeSet(
				bookbrainzData,
				trx,
				firstSet,
				[{id: 1}, {id: 2}]
			);

			return set.refresh({transacting: trx, withRelated: 'attribute'});
		});

		let attributes = result.related('attribute').toJSON();
		attributes = attributes.sort((a, b) => a.id - b.id);

		expect(result.get('id')).to.equal(firstSet.get('id'));
		expect(attributes).to.have.lengthOf(2);
		expect(attributes[0]).to.include({id: 1});
		expect(attributes[1]).to.include({id: 2});
	});
});
