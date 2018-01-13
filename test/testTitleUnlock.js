/*
 * Copyright (C) 2016  Max Prettyjohns
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
const {
	Editor, EditorType, Gender, TitleType, TitleUnlock, bookshelf
} = bookbrainzData;

describe('TitleUnlock model', () => {
	const editorTypeAttribs = {
		id: 1,
		label: 'test_type'
	};
	const editorAttribs = {
		genderId: 1,
		id: 1,
		name: 'bob',
		typeId: 1
	};
	const titleTypeAttribs = {
		description: 'test_desc',
		id: 1,
		title: 'test_title'
	};

	beforeEach(
		() =>
			new Gender({id: 1, name: 'test'})
				.save(null, {method: 'insert'})
				.then(
					() =>
						new EditorType(editorTypeAttribs)
							.save(null, {method: 'insert'})
				)
				.then(
					() => new Editor(editorAttribs)
						.save(null, {method: 'insert'})
				)
				.then(
					() =>
						new TitleType(titleTypeAttribs)
							.save(null, {method: 'insert'})
				)
	);

	afterEach(function truncate() {
		this.timeout(); // eslint-disable-line babel/no-invalid-this

		return truncateTables(bookshelf, [
			'bookbrainz.editor_type', 'musicbrainz.gender',
			'bookbrainz.editor', 'bookbrainz.title_unlock',
			'bookbrainz.title_type'
		]);
	});

	it('should return a JSON object with correct keys when saved', () => {
		const unlockPromise = new TitleUnlock({
			editorId: 1,
			id: 1,
			titleId: 1
		})
			.save(null, {method: 'insert'})
			.then((model) => model.refresh())
			.then((unlock) => unlock.toJSON());

		return expect(unlockPromise).to.eventually.have.all.keys([
			'id', 'editorId', 'titleId', 'unlockedAt'
		]);
	});
});
