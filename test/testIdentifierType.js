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
const IdentifierType = require('../index').IdentifierType;

describe('IdentifierType model', () => {
	afterEach(() => {
		return Bookshelf.knex.raw(
			'TRUNCATE bookbrainz.identifier_type CASCADE'
		);
	});

	it('should return a JSON object with correct keys when saved', () => {
		const idTypeData = {
			label: 'test_type',
			description: 'description',
			detectionRegex: 'detection',
			validationRegex: 'validation',
			displayTemplate: 'display',
			entityType: 'Creator'
		};

		const idTypeCreationPromise = new IdentifierType(idTypeData)
			.save()
			.then((model) => model.refresh())
			.then((idType) => idType.toJSON());

		return expect(idTypeCreationPromise).to.eventually.have.all.keys([
			'id', 'label', 'description', 'detectionRegex',
			'validationRegex', 'displayTemplate', 'entityType', 'parentId',
			'childOrder', 'deprecated'
		]);
	});
});
