/*
 * Copyright (C) 2015-2016  Ben Ockmore
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

const util = require('../util');
const Bookshelf = require('./bookshelf');
const Entity = require('../index').Entity;

describe('Entity model', () => {
	afterEach(() => {
		return util.truncateTables(Bookshelf, ['bookbrainz.entity']);
	});

	it('should return a JSON object with correct keys when saved', () => {
		// Construct EntityRevision, add to Entity, then save
		const entityAttribs = {
			bbid: '68f52341-eea4-4ebc-9a15-6226fb68962c',
			type: 'Creator'
		};

		const entityPromise = new Entity(entityAttribs)
			.save(null, {method: 'insert'})
			.then((model) => model.refresh())
			.then((entity) => entity.toJSON());

		return expect(entityPromise).to.eventually.have.all.keys([
			'bbid', 'type'
		]);
	});
});
