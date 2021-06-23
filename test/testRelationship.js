/*
 * Copyright (C) 2015  Ben Ockmore
 *				 2021  Akash Gupta
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
	Entity, Relationship, RelationshipAttributeSet, RelationshipAttribute,
	RelationshipAttributeTextValue, RelationshipAttributeType, RelationshipType, bookshelf
} = bookbrainzData;

const relAttribs = {
	id: 1,
	sourceBbid: '68f52341-eea4-4ebc-9a15-6226fb68962c',
	targetBbid: 'de305d54-75b4-431b-adb2-eb6b9e546014',
	typeId: 1
};

const relAttribsData = {
	attributeType: 1,
	id: 1
};

const relAttribTypeAttribs = {
	id: 1,
	name: 'position',
	root: 1
};

const relTypeAttribs = {
	description: 'description',
	id: 1,
	label: 'test_type',
	linkPhrase: 'linkPhrase',
	reverseLinkPhrase: 'reverseLinkPhrase',
	sourceEntityType: 'Author',
	targetEntityType: 'Author'
};


const entityAttribs = {
	bbid: '68f52341-eea4-4ebc-9a15-6226fb68962c',
	type: 'Author'
};

describe('Relationship model', () => {
	beforeEach(
		async () => {
			await new RelationshipAttributeType(relAttribTypeAttribs)
				.save(null, {method: 'insert'});
			await new RelationshipType(relTypeAttribs)
				.save(null, {method: 'insert'});
			await new Entity(entityAttribs)
				.save(null, {method: 'insert'});
			await new Entity(
				_.assign(_.clone(entityAttribs), {
					bbid: 'de305d54-75b4-431b-adb2-eb6b9e546014'
				})
			)
				.save(null, {method: 'insert'});
		}
	);

	afterEach(
		() => truncateTables(bookshelf, [
			'bookbrainz.relationship',
			'bookbrainz.relationship_type',
			'bookbrainz.relationship_attribute_set',
			'bookbrainz.relationship_attribute',
			'bookbrainz.relationship_attribute_type',
			'bookbrainz.entity'
		])
	);

	it('should return a JSON object with correct keys when saved', async () => {
		const model = await new Relationship(relAttribs)
			.save(null, {method: 'insert'});
		await model.refresh({withRelated: ['type', 'source', 'target']});
		const relationship = model.toJSON();

		return expect(relationship).to.have.all.keys([
			'id', 'typeId', 'attributeSetId', 'type', 'sourceBbid', 'source', 'targetBbid',
			'target'
		]);
	});


	it("should return a relationship with it's attributes when one is set", async () => {
		const attribute = await new RelationshipAttribute(relAttribsData)
			.save(null, {method: 'insert'});
		await new RelationshipAttributeTextValue({attributeId: attribute.get('id'), textValue: '1'})
			.save(null, {method: 'insert'});
		const model = await new RelationshipAttributeSet({id: 1})
			.save(null, {method: 'insert'});
		await model.relationshipAttributes().attach(attribute);

		const model1 = await new Relationship({...relAttribs, attributeSetId: 1})
			.save(null, {method: 'insert'});
		await model1.refresh({withRelated: ['type', 'source', 'target',
			'attributeSet.relationshipAttributes.value', 'attributeSet.relationshipAttributes.type']});
		const {attributeSet} = model1.toJSON();

		expect(attributeSet.relationshipAttributes[0].value.textValue).to.equal('1');
		expect(attributeSet.relationshipAttributes[0].type.id).to.equal(1);
		return expect(attributeSet.relationshipAttributes[0]).to.include.all.keys('value', 'type');
	});
});
