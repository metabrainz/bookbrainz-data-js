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
const Gender = require('../index').Gender;

describe('Gender model', () => {
	afterEach(() => {
		return Bookshelf.knex.raw('TRUNCATE musicbrainz.gender CASCADE');
	});

	it('should return a JSON object with correct keys when saved', () => {
		const genderPromise = new Gender({name: 'Test'})
			.save(null, {method: 'insert'})
			.then((model) => model.refresh())
			.then((gender) => gender.toJSON());

		return expect(genderPromise).to.eventually.have.all.keys([
			'id', 'name', 'parent', 'childOrder', 'description'
		]);
	});
});
