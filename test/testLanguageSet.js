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

async function createLanguageSet(languages) {
	const model = await new LanguageSet({id: 1}).save(null, {method: 'insert'});
	await model.languages().attach(languages);
	return model;
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

	it('should return a JSON object with correct keys when saved', async () => {
		const model = await new LanguageSet({id: 1})
			.save(null, {method: 'insert'});
		await model.refresh({withRelated: ['languages']});
		const json = model.toJSON();

		return expect(json).to.have.all.keys([
			'id', 'languages'
		]);
	});


	it(
		'should have an empty list of languages when none are attached',
		async () => {
			const model = await new LanguageSet({id: 1})
				.save(null, {method: 'insert'});
			await model.refresh({withRelated: ['languages']});
			const json = model.toJSON().languages;

			return expect(json).to.be.empty;
		}
	);

	it('should have have a language when one is set', async () => {
		const language = await new Language(languageAttribs)
			.save(null, {method: 'insert'});
		const model = await createLanguageSet([language]);
		await model.refresh({withRelated: ['languages']});
		const json = model.toJSON();

		return expect(json).to.have.nested.property('languages[0].id', 1);
	});

	it('should have have two languages when two are set', async () => {
		const language1 = await new Language(languageAttribs)
			.save(null, {method: 'insert'});

		const language2 = await new Language(_.assign(languageAttribs, {id: 2}))
			.save(null, {method: 'insert'});

		const model = await createLanguageSet([language1, language2]);
		await model.refresh({withRelated: ['languages']});
		const json = model.toJSON();


		return expect(json).to
			.have.nested.property('languages.length', 2);
	});
});
