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

const util = require('../util');
const Bookshelf = require('./bookshelf');
const Alias = require('../index').Alias;
const Language = require('../index').Language;

describe('Alias model', () => {
	const languageAttribs = {
		id: 1,
		name: 'English',
		isoCode2t: 'eng',
		isoCode2b: 'eng',
		isoCode3: 'eng',
		isoCode1: 'en',
		frequency: 1
	};

	beforeEach(() =>
		new Language(languageAttribs).save(null, {method: 'insert'})
	);

	afterEach(() =>
		util.truncateTables(Bookshelf, [
			'bookbrainz.alias',
			'musicbrainz.language'
		])
	);

	it('should return a JSON object with correct keys when saved', () => {
		const aliasAttribs = {
			id: 1,
			name: 'Bob Marley',
			sortName: 'Marley, Bob',
			languageId: 1,
			primary: true
		};

		const aliasPromise = new Alias(aliasAttribs)
			.save(null, {method: 'insert'})
			.then((model) => model.refresh())
			.then((alias) => alias.toJSON());

		return expect(aliasPromise).to.eventually.have.all.keys([
			'id', 'name', 'sortName', 'languageId', 'primary'
		]);
	});
});
