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

import bookbrainzData from './bookshelf';
import chai from 'chai';
import {truncateTables} from '../lib/util';


const {expect} = chai;
const {RelationshipType, RelationshipAttributeType, RelationshipTypeAttributeType, bookshelf} = bookbrainzData;


const relAttributeTypeAttribs = {
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

const relTypeAttributeTypeAttribs = {
	attributeType: 1,
	relationshipType: 1
};

describe('RelationshipType model', () => {
	afterEach(
		() => truncateTables(bookshelf, [
			'bookbrainz.relationship_type',
			'bookbrainz.relationship_type__attribute_type',
			'bookbrainz.relationship_attribute_type'
		])
	);

	it('should return a JSON object with correct keys when saved', async () => {
		const model = await new RelationshipType(relTypeAttribs)
			.save(null, {method: 'insert'});
		await model.refresh();

		return expect(model.toJSON()).to.have.all.keys([
			'id', 'label', 'description', 'linkPhrase', 'reverseLinkPhrase',
			'sourceEntityType', 'targetEntityType', 'parentId', 'childOrder',
			'deprecated'
		]);
	});

	it('should return attribute type associated with the relationship type', async () => {
		await new RelationshipAttributeType(relAttributeTypeAttribs)
			.save(null, {method: 'insert'});
		const model = await new RelationshipType(relTypeAttribs)
			.save(null, {method: 'insert'});
		await new RelationshipTypeAttributeType(relTypeAttributeTypeAttribs)
			.save(null, {method: 'insert'});
		await model.refresh({withRelated: ['attributeTypes']});

		expect(model.toJSON().attributeTypes).to.have.lengthOf(1);
		expect(model.toJSON().attributeTypes[0]).to.include(relAttributeTypeAttribs);
		return expect(model.toJSON()).to.have.all.keys([
			'id', 'label', 'description', 'linkPhrase', 'reverseLinkPhrase',
			'sourceEntityType', 'targetEntityType', 'parentId', 'childOrder',
			'deprecated', 'attributeTypes'
		]);
	});
});
