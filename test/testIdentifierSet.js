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

const util = require('../util');
const Bookshelf = require('./bookshelf');
const IdentifierSet = require('../index').IdentifierSet;
const Identifier = require('../index').Identifier;
const IdentifierType = require('../index').IdentifierType;

const idAttribs = {
	id: 1,
	typeId: 1,
	value: 'Bob'
};

function createIdentifierSet(identifiers) {
	return new IdentifierSet({id: 1})
		.save(null, {method: 'insert'})
		.then((model) =>
			model.identifiers().attach(identifiers)
			.then(() => model)
		);
}

describe('IdentifierSet model', () => {
	const idTypeAttribs = {
		id: 1,
		label: 'test_type',
		description: 'description',
		detectionRegex: 'detection',
		validationRegex: 'validation',
		displayTemplate: 'display',
		entityType: 'Creator'
	};

	beforeEach(() =>
		new IdentifierType(idTypeAttribs).save(null, {method: 'insert'})
	);

	afterEach(() =>
		util.truncateTables(Bookshelf, [
			'bookbrainz.identifier_set',
			'bookbrainz.identifier',
			'bookbrainz.identifier_type'
		])
	);

	it('should return a JSON object with correct keys when saved', () => {
		const jsonPromise = new IdentifierSet({id: 1})
			.save(null, {method: 'insert'})
			.then((model) =>
				model.refresh({withRelated: ['identifiers']})
			)
			.then((model) => model.toJSON());

		return expect(jsonPromise).to.eventually.have.all.keys([
			'id', 'identifiers'
		]);
	});

	it(
		'should have an empty list of identifiers when none are attached',
		() => {
			const jsonPromise = new IdentifierSet({id: 1})
				.save(null, {method: 'insert'})
				.then((model) =>
					model.refresh({withRelated: ['identifiers']})
				)
				.then((model) => model.toJSON().identifiers);

			return expect(jsonPromise).to.eventually.be.empty;
		}
	);

	it('should have have an identifier when one is set', () => {
		const idPromise = new Identifier(idAttribs)
			.save(null, {method: 'insert'});

		const jsonPromise = idPromise.then((identifier) =>
			createIdentifierSet([identifier])
		)
			.then((model) =>
				model.refresh({withRelated: ['identifiers']})
			)
			.then((model) => model.toJSON());

		return Promise.all([
			expect(jsonPromise).to.eventually
				.have.deep.property('identifiers[0].id', 1)
		]);
	});

	it('should have have two identifiers when two are set', () => {
		const id1Promise = new Identifier(idAttribs)
			.save(null, {method: 'insert'});

		const id2Promise = new Identifier(_.assign(idAttribs, {id: 2}))
			.save(null, {method: 'insert'});

		const jsonPromise = Promise.join(
			id1Promise, id2Promise, (identifier1, identifier2) =>
				createIdentifierSet([identifier1, identifier2])
		)
			.then((model) =>
				model.refresh({withRelated: ['identifiers']})
			)
			.then((model) => model.toJSON());

		return expect(jsonPromise).to.eventually
			.have.deep.property('identifiers.length', 2);
	});
});
