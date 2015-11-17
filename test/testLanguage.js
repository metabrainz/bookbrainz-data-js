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
const expect = chai.expect;
const Promise = require('bluebird');
const util = require('../util');

const Bookshelf = require('./bookshelf');

const Language = require('../index').Language;

chai.use(chaiAsPromised);

/* eslint camelcase: 0 */

describe('Language model', function setupData() {
	afterEach(function destroyData() {
		return Promise.all([
			Bookshelf.knex.raw('TRUNCATE musicbrainz.language CASCADE')
		]);
	});

	it('should return a JSON object with correct keys when saved', function() {
		// Construct EntityRevision, add to Entity, then save
		const languageAttribs = {
			name: 'English', isoCode2t: 'eng', isoCode2b: 'eng',
			isoCode3: 'eng', isoCode1: 'en', frequency: 1
		};

		const languagePromise = new Language(languageAttribs).save()
		.then((model) => model.refresh().then(util.fetchJSON));

		return expect(languagePromise).to.eventually.have.all.keys([
			'id', 'name', 'isoCode2t', 'isoCode2b', 'isoCode1', 'frequency',
			'isoCode3'
		]);
	});
});