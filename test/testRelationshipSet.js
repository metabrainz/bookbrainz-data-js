/*
 * Copyright (C) 2016  Ben Ockmore
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

'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const _ = require('lodash');
const Promise = require('bluebird');

const util = require('../lib/util');
const Bookshelf = require('./bookshelf');
const RelationshipSet = require('../lib/index').RelationshipSet;
const Relationship = require('../lib/index').Relationship;
const RelationshipType = require('../lib/index').RelationshipType;
const Entity = require('../lib/index').Entity;

const relAttribs = {
	id: 1,
	typeId: 1,
	sourceBbid: '68f52341-eea4-4ebc-9a15-6226fb68962c',
	targetBbid: 'de305d54-75b4-431b-adb2-eb6b9e546014'
};

const relTypeAttribs = {
	id: 1,
	label: 'test_type',
	description: 'description',
	displayTemplate: 'display',
	sourceEntityType: 'Creator',
	targetEntityType: 'Creator'
};

const entityAttribs = {
	bbid: '68f52341-eea4-4ebc-9a15-6226fb68962c',
	type: 'Creator'
};

function createRelationshipSet(relationships) {
	return new RelationshipSet({id: 1})
		.save(null, {method: 'insert'})
		.then((model) =>
			model.relationships().attach(relationships)
			.then(() => model)
		);
}

describe('RelationshipSet model', () => {
	beforeEach(() =>
		new RelationshipType(relTypeAttribs)
			.save(null, {method: 'insert'})
			.then(() =>
				new Entity(entityAttribs).save(null, {method: 'insert'})
			)
			.then(() =>
				new Entity(
					_.assign(_.clone(entityAttribs), {
						bbid: 'de305d54-75b4-431b-adb2-eb6b9e546014'
					})
				).save(null, {method: 'insert'})
			)
	);

	afterEach(() =>
		util.truncateTables(Bookshelf, [
			'bookbrainz.relationship_set',
			'bookbrainz.relationship',
			'bookbrainz.relationship_type',
			'bookbrainz.entity'
		])
	);

	it('should return a JSON object with correct keys when saved', () => {
		const jsonPromise = new RelationshipSet({id: 1})
			.save(null, {method: 'insert'})
			.then((model) =>
				model.refresh({withRelated: ['relationships']})
			)
			.then((model) => model.toJSON());

		return expect(jsonPromise).to.eventually.have.all.keys([
			'id', 'relationships'
		]);
	});

	it(
		'should have an empty list of relationships when none are attached',
		() => {
			const jsonPromise = new RelationshipSet({id: 1})
				.save(null, {method: 'insert'})
				.then((model) =>
					model.refresh({withRelated: ['relationships']})
				)
				.then((model) => model.toJSON().relationships);

			return expect(jsonPromise).to.eventually.be.empty;
		}
	);

	it('should have have a relationship when one is set', () => {
		const relPromise = new Relationship(relAttribs)
			.save(null, {method: 'insert'});

		const jsonPromise = relPromise.then((relationship) =>
			createRelationshipSet([relationship])
		)
			.then((model) =>
				model.refresh({withRelated: ['relationships']})
			)
			.then((model) => model.toJSON());

		return Promise.all([
			expect(jsonPromise).to.eventually
				.have.deep.property('relationships[0].id', 1)
		]);
	});

	it('should have have two relationships when two are set', () => {
		const rel1Promise = new Relationship(relAttribs)
			.save(null, {method: 'insert'});

		const rel2Promise = new Relationship(_.assign(relAttribs, {id: 2}))
			.save(null, {method: 'insert'});

		const jsonPromise = Promise.join(
			rel1Promise, rel2Promise, (relationship1, relationship2) =>
				createRelationshipSet([relationship1, relationship2])
		)
			.then((model) =>
				model.refresh({withRelated: ['relationships']})
			)
			.then((model) => model.toJSON());

		return expect(jsonPromise).to.eventually
			.have.deep.property('relationships.length', 2);
	});
});
