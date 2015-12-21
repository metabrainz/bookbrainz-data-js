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

const Bookshelf = require('./bookshelf');
const Creator = require('../index').Creator;
const Revision = require('../index').Revision;
const Gender = require('../index').Gender;
const EditorType = require('../index').EditorType;
const Editor = require('../index').Editor;

const genderData = {id: 1, name: 'test'};
const editorTypeData = {id: 1, label: 'test_type'};
const editorData = {
	id: 1, name: 'bob', email: 'bob@test.org', password: 'test',
	genderId: 1, typeId: 1
};

describe('Creator model', () => {
	beforeEach(() => {
		return new Gender(genderData).save(null, {method: 'insert'})
			.then(() =>
				new EditorType(editorTypeData).save(null, {method: 'insert'})
			)
			.then(() =>
				new Editor(editorData).save(null, {method: 'insert'})
			);
	});

	afterEach(() => {
		return Bookshelf.knex.raw('TRUNCATE bookbrainz.entity CASCADE')
			.then(() =>
				Bookshelf.knex.raw('TRUNCATE bookbrainz.revision CASCADE')
			)
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
		const creatorAttribs = {
			revisionId: 1
		};

		const revisionPromise = new Revision(revisionAttribs)
			.save(null, {method: 'insert'});

		const creatorPromise = revisionPromise
			.then(() =>
				new Creator(creatorAttribs).save(null, {method: 'insert'})
			)
			.then((model) => model.refresh())
			.then((creator) => creator.toJSON());

		return expect(creatorPromise).to.eventually.have.all.keys([
			'bbid', 'lastUpdated', 'revisionId', 'annotationId',
			'disambiguationId', 'defaultAliasId', 'beginYear', 'beginMonth',
			'beginDay', 'beginAreaId', 'endYear', 'endMonth', 'endDay',
			'endAreaId', 'ended', 'areaId', 'genderId', 'typeId', 'aliasSetId',
			'identifierSetId', 'relationshipSetId'
		]);
	});
});
