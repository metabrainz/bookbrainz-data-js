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

import _ from 'lodash';
import bookbrainzData from './bookshelf';
import chai from 'chai';
import {truncateTables} from '../lib/util';


const {expect} = chai;
const {
	RelationshipAttribute, RelationshipAttributeSet, RelationshipAttributeType, bookshelf
} = bookbrainzData;

const relAttribs = {
	attributeType: 1,
	id: 1
};

const relAttribTypeAttribs = {
	id: 1,
	name: 'position',
	root: 1
};

async function createRelationshipAttributeSet(attributes) {
	const model = await new RelationshipAttributeSet({id: 1})
		.save(null, {method: 'insert'});
	await model.relationshipAttributes().attach(attributes);
	return model;
}

describe('RelationshipAttributeSet model', () => {
	beforeEach(
		async () => {
			await new RelationshipAttributeType(relAttribTypeAttribs)
				.save(null, {method: 'insert'});
		}
	);

	afterEach(
		() => truncateTables(bookshelf, [
			'bookbrainz.relationship_attribute_set',
			'bookbrainz.relationship_attribute',
			'bookbrainz.relationship_attribute_type',
			'bookbrainz.entity'
		])
	);

	it('should return a JSON object with correct keys when saved', async () => {
		const model = await new RelationshipAttributeSet({id: 1})
			.save(null, {method: 'insert'});
		await model.refresh({withRelated: ['relationshipAttributes']});
		const json = model.toJSON();
		return expect(json).to.have.all.keys([
			'id', 'relationshipAttributes'
		]);
	});

	it(
		'should have an empty list of attributes when none are attached',
		async () => {
			const model = await new RelationshipAttributeSet({id: 1})
				.save(null, {method: 'insert'});
			await model.refresh({withRelated: ['relationshipAttributes']});
			const attributes = model.toJSON().relationshipAttributes;

			return expect(attributes).to.be.empty;
		}
	);

	it('should have have a relationship attribute when one is set', async () => {
		const attribute = await new RelationshipAttribute(relAttribs)
			.save(null, {method: 'insert'});
		const model = await createRelationshipAttributeSet([attribute]);
		await model.refresh({withRelated: ['relationshipAttributes']});
		const json = model.toJSON();

		return expect(json).to.have.nested.property('relationshipAttributes[0].id', 1);
	});

	it('should have have two relationship attributes when two are set', async () => {
		const attribute1 = await new RelationshipAttribute(relAttribs)
			.save(null, {method: 'insert'});

		const attribute2 = await new RelationshipAttribute(_.assign(relAttribs, {id: 2}))
			.save(null, {method: 'insert'});


		const model = await createRelationshipAttributeSet([attribute1, attribute2]);
		await model.refresh({withRelated: ['relationshipAttributes']});
		const json = model.toJSON();

		return expect(json).to.have.nested.property('relationshipAttributes.length', 2);
	});
});
