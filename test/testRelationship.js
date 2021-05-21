/*
 * Copyright (C) 2015  Ben Ockmore
 *				 2021  Akash Gupta
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
import chaiAsPromised from 'chai-as-promised';
import {truncateTables} from '../lib/util';


chai.use(chaiAsPromised);
const {expect} = chai;
const {
	Entity, Relationship, RelationshipType, RelationshipOrder, RelationshipDate, bookshelf
} = bookbrainzData;

const relAttribs = {
	id: 1,
	sourceBbid: '68f52341-eea4-4ebc-9a15-6226fb68962c',
	targetBbid: 'de305d54-75b4-431b-adb2-eb6b9e546014',
	typeId: 1
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

const relOrder = {
	id: 1,
	position: 1,
	relId: 1
};

const relDate = {
	beginDay: 15,
	beginMonth: 2,
	beginYear: 1996,
	endDay: 15,
	endMonth: 2,
	endYear: 2001,
	ended: true,
	id: 1,
	relId: 1
};

const entityAttribs = {
	bbid: '68f52341-eea4-4ebc-9a15-6226fb68962c',
	type: 'Author'
};

describe('Relationship model', () => {
	beforeEach(
		async () => {
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
			'bookbrainz.relationship_order',
			'bookbrainz.relationship_date',
			'bookbrainz.entity'
		])
	);

	it('should return a JSON object with correct keys when saved', async () => {
		const model = await new Relationship(relAttribs)
			.save(null, {method: 'insert'});
		await new RelationshipOrder(relOrder)
			.save(null, {method: 'insert'});
		await new RelationshipDate(relDate)
			.save(null, {method: 'insert'});
		await model.refresh({withRelated: ['type', 'source', 'target', 'order', 'date']});
		const relationship = model.toJSON();

		return expect(relationship).to.have.all.keys([
			'id', 'typeId', 'type', 'sourceBbid', 'source', 'targetBbid',
			'target', 'order', 'date'
		]);
	});
});
