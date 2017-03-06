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
const {expect} = chai;

const util = require('../lib/util');
const {bookshelf, Language} = require('./bookshelf');

/* eslint camelcase: 0 */

describe('Language model', () => {
	afterEach(() =>
		util.truncateTables(bookshelf, ['musicbrainz.language'])
	);

	it('should return a JSON object with correct keys when saved', () => {
		// Construct EntityRevision, add to Entity, then save
		const languageAttribs = {
			frequency: 1,
			isoCode1: 'en',
			isoCode2b: 'eng',
			isoCode2t: 'eng',
			isoCode3: 'eng',
			name: 'English'
		};

		const languagePromise = new Language(languageAttribs)
			.save()
			.then((model) => model.refresh())
			.then((language) => language.toJSON());

		return expect(languagePromise).to.eventually.have.all.keys([
			'id', 'name', 'isoCode2t', 'isoCode2b', 'isoCode1', 'frequency',
			'isoCode3'
		]);
	});
});
