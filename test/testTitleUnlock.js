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

'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

const Bookshelf = require('./bookshelf');
const util = require('../util');
const TitleType = require('../index').TitleType;
const TitleUnlock = require('../index').TitleUnlock;
const AchievementType = require('../index').AchievementType;
const Editor = require('../index').Editor;
const EditorType = require('../index').EditorType;
const Gender = require('../index').Gender;


describe('TitleUnlock model', () => {
	const editorTypeAttribs = {id: 1, label: 'test_type'};
	const editorAttribs = {
		id: 1, name: 'bob', email: 'bob@test.org', password: 'test',
		genderId: 1, typeId: 1
	};
	const titleTypeAttribs = {
		id: 1, title: 'test_title', description: 'test_desc'
	};

	beforeEach(() => {
		return new Gender({id: 1, name: 'test'})
			.save(null, {method: 'insert'})
			.then(() =>
				new EditorType(editorTypeAttribs).save(null, {method: 'insert'})
			)
			.then(() =>
				new Editor(editorAttribs).save(null, {method: 'insert'})
			)
			.then(() =>
				new TitleType(titleTypeAttribs)
					.save(null, {method: 'insert'})
			);
	});

	afterEach(function truncate() {
		this.timeout();

		return util.truncateTables(Bookshelf, [
			'bookbrainz.editor_type', 'musicbrainz.gender',
			'bookbrainz.editor', 'bookbrainz.title_unlock',
			'bookbrainz.title_type'
		]);
	});

	it('should return a JSON object with correct keys when saved', () => {
		const unlockPromise = new TitleUnlock({id: 1, editorId: 1,
			titleId: 1})
			.save(null, {method: 'insert'})
			.then((model) => model.refresh())
			.then((unlock) => unlock.toJSON());

		return expect(unlockPromise).to.eventually.have.all.keys([
			'id', 'editorId', 'titleId', 'unlockedAt'
		]);
	});
});
