/*
 * Copyright (C) 2015  Ben Ockmore
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
	Entity, Relationship, RelationshipType, bookshelf
} = bookbrainzData;

const relAttribs = {
	id: 1,
	sourceBbid: '68f52341-eea4-4ebc-9a15-6226fb68962c',
	targetBbid: 'de305d54-75b4-431b-adb2-eb6b9e546014',
	typeId: 1
};

const relTypeAttribs = {
	description: 'description',
	displayTemplate: 'display',
	id: 1,
	label: 'test_type',
	sourceEntityType: 'Creator',
	targetEntityType: 'Creator'
};

const entityAttribs = {
	bbid: '68f52341-eea4-4ebc-9a15-6226fb68962c',
	type: 'Creator'
};

describe('Relationship model', () => {
	beforeEach(
		() =>
			new RelationshipType(relTypeAttribs)
				.save(null, {method: 'insert'})
				.then(
					() => new Entity(entityAttribs)
						.save(null, {method: 'insert'})
				)
				.then(
					() =>
						new Entity(
							_.assign(_.clone(entityAttribs), {
								bbid: 'de305d54-75b4-431b-adb2-eb6b9e546014'
							})
						).save(null, {method: 'insert'})
				)
	);

	afterEach(
		() => truncateTables(bookshelf, [
			'bookbrainz.relationship',
			'bookbrainz.relationship_type',
			'bookbrainz.entity'
		])
	);

	it('should return a JSON object with correct keys when saved', () => {
		const jsonPromise = new Relationship(relAttribs)
			.save(null, {method: 'insert'})
			.then(
				(model) =>
					model.refresh({withRelated: ['type', 'source', 'target']})
			)
			.then((model) => model.toJSON());

		return expect(jsonPromise).to.eventually.have.all.keys([
			'id', 'typeId', 'type', 'sourceBbid', 'source', 'targetBbid',
			'target'
		]);
	});
});
