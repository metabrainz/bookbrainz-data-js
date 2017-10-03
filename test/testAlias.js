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

import bookbrainzData from './bookshelf';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {truncateTables} from '../lib/util';

chai.use(chaiAsPromised);
const {expect} = chai;
const {Alias, Language, bookshelf} = bookbrainzData;

describe('Alias model', () => {
	const languageAttribs = {
		frequency: 1,
		id: 1,
		isoCode1: 'en',
		isoCode2b: 'eng',
		isoCode2t: 'eng',
		isoCode3: 'eng',
		name: 'English'
	};

	beforeEach(() =>
		new Language(languageAttribs).save(null, {method: 'insert'})
	);

	afterEach(() =>
		truncateTables(bookshelf, [
			'bookbrainz.alias',
			'musicbrainz.language'
		])
	);

	it('should return a JSON object with correct keys when saved', () => {
		const aliasAttribs = {
			id: 1,
			languageId: 1,
			name: 'Bob Marley',
			primary: true,
			sortName: 'Marley, Bob'
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
