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

const Bookshelf = require('./bookshelf');

const Editor = require('../index').Editor;
const EditorType = require('../index').EditorType;
const Gender = require('../index').Gender;
const Revision = require('../index').Revision;

chai.use(chaiAsPromised);

describe('Revision model', () => {
	const editorTypeAttribs = {id: 1, label: 'test_type'};
	const editorAttribs = {
		id: 1, name: 'bob', email: 'bob@test.org', password: 'test',
		genderId: 1, typeId: 1
	};

	beforeEach(() => {
		return new Gender({id: 1, name: 'test'})
			.save(null, {method: 'insert'})
			.then(() =>
				new EditorType(editorTypeAttribs).save(null, {method: 'insert'})
			)
			.then(() =>
				new Editor(editorAttribs).save(null, {method: 'insert'})
			);
	});

	afterEach(() => {
		return Bookshelf.knex.raw('TRUNCATE bookbrainz.revision CASCADE')
			.then(() =>
				Bookshelf.knex.raw('TRUNCATE bookbrainz.editor CASCADE')
			)
			.then(() =>
				Bookshelf.knex.raw('TRUNCATE bookbrainz.editor_type CASCADE')
			)
			.then(() =>
				Bookshelf.knex.raw('TRUNCATE musicbrainz.gender CASCADE')
			);
	});

	it('should return a JSON object with correct keys when saved', () => {
		const revisionAttribs = {id: 1, authorId: 1};
		const relatedToLoad = ['author', 'parents', 'children'];
		const revisionPromise = new Revision(revisionAttribs)
			.save(null, {method: 'insert'})
			.then(
				(model) => model.refresh({withRelated: relatedToLoad})
			)
			.then((revision) => revision.toJSON());

		return expect(revisionPromise).to.eventually.have.all.keys([
			'id', 'author', 'authorId', 'createdAt', 'parents', 'children'
		]);
	});
});
