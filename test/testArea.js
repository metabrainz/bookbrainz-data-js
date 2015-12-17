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
const uuid = require('node-uuid');

const Bookshelf = require('./bookshelf');
const Area = require('../index').Area;

function createArea(name) {
	const areaAttribs = {
		gid: uuid.v4(),
		name,
		type: 1
	};

	return new Area(areaAttribs)
		.save(null, {method: 'insert'})
		.then((model) => model.refresh())
		.then((area) => area.toJSON());
}

describe('Area model', () => {
	afterEach(() => {
		return Bookshelf.knex.raw('TRUNCATE musicbrainz.area CASCADE');
	});

	it('should return a JSON object with correct keys when saved', () => {
		const areaPromise = createArea('Mars');

		return expect(areaPromise).to.eventually.have.all.keys([
			'id', 'gid', 'name', 'type', 'editsPending', 'lastUpdated',
			'beginDateYear', 'beginDateMonth', 'beginDateDay', 'endDateYear',
			'endDateMonth', 'endDateDay', 'ended', 'comment'
		]);
	});
});
