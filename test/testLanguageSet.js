/*
 * Copyright (C) 2021  Akash Gupta
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

import Promise from 'bluebird';
import _ from 'lodash';
import bookbrainzData from './bookshelf';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {truncateTables} from '../lib/util';


chai.use(chaiAsPromised);
const {expect} = chai;
const {
	Language, LanguageSet, bookshelf
} = bookbrainzData;

function createLanguageSet(languages) {
	return new LanguageSet({id: 1})
		.save(null, {method: 'insert'})
		.then(
			(model) => model.languages().attach(languages).then(() => model)
		);
}

describe('LanguageSet model', () => {
	const languageAttribs = {
		frequency: 1,
		id: 1,
		isoCode1: 'en',
		isoCode2b: 'eng',
		isoCode2t: 'eng',
		isoCode3: 'eng',
		name: 'English'
	};

	afterEach(
		() => truncateTables(bookshelf, [
			'bookbrainz.language_set',
			'musicbrainz.language'
		])
	);

	it('should return a JSON object with correct keys when saved', () => {
		const jsonPromise = new LanguageSet({id: 1})
			.save(null, {method: 'insert'})
			.then(
				(model) => model.refresh({withRelated: ['languages']})
			)
			.then((model) => model.toJSON());

		return expect(jsonPromise).to.eventually.have.all.keys([
			'id', 'languages'
		]);
	});

	it(
		'should have an empty list of languages when none are attached',
		() => {
			const jsonPromise = new LanguageSet({id: 1})
				.save(null, {method: 'insert'})
				.then(
					(model) => model.refresh({withRelated: ['languages']})
				)
				.then((model) => model.toJSON().languages);

			return expect(jsonPromise).to.eventually.be.empty;
		}
	);

	it('should have have a language when one is set', () => {
		const langPromise = new Language(languageAttribs)
			.save(null, {method: 'insert'});

		const jsonPromise = langPromise.then(
			(language) => createLanguageSet([language])
		)
			.then((model) => model.refresh({withRelated: ['languages']}))
			.then((model) => model.toJSON());

		return Promise.all([
			expect(jsonPromise).to.eventually
				.have.nested.property('languages[0].id', 1)
		]);
	});

	it('should have have two languages when two are set', () => {
		const lang1Promise = new Language(languageAttribs)
			.save(null, {method: 'insert'});

		const lang2Promise = new Language(_.assign(languageAttribs, {id: 2}))
			.save(null, {method: 'insert'});

		const jsonPromise = Promise.join(
			lang1Promise, lang2Promise, (language1, language2) =>
				createLanguageSet([language1, language2])
		)
			.then(
				(model) => model.refresh({withRelated: ['languages']})
			)
			.then((model) => model.toJSON());

		return expect(jsonPromise).to.eventually
			.have.nested.property('languages.length', 2);
	});
});
