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

'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

const Bookshelf = require('./bookshelf');
const Identifier = require('../index').Identifier;
const IdentifierType = require('../index').IdentifierType;

const idAttribs = {
	id: 1,
	typeId: 1,
	value: 'Bob'
};

const idTypeAttribs = {
	id: 1,
	label: 'test_type',
	description: 'description',
	detectionRegex: 'detection',
	validationRegex: 'validation',
	displayTemplate: 'display',
	entityType: 'Creator'
};

describe('Identifier model', () => {
	beforeEach(() => {
		return new IdentifierType(idTypeAttribs)
			.save(null, {method: 'insert'});
	});

	afterEach(() => {
		return Bookshelf.knex.raw('TRUNCATE bookbrainz.identifier CASCADE')
			.then(() =>
				Bookshelf.knex.raw('TRUNCATE bookbrainz.identifier_type CASCADE')
			);
	});

	it('should return a JSON object with correct keys when saved', () => {
		const jsonPromise = new Identifier(idAttribs)
			.save(null, {method: 'insert'})
			.then((model) => model.refresh({withRelated: ['type']}))
			.then((model) => model.toJSON());

		return expect(jsonPromise).to.eventually.have.all.keys([
			'id', 'typeId', 'type', 'value'
		]);
	});
});
