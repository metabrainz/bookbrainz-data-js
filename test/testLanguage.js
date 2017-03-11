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

import {Language, bookshelf} from './bookshelf';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import util from '../lib/util';

chai.use(chaiAsPromised);
const {expect} = chai;

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
