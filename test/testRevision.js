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

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;
var Promise = require('bluebird');
var util = require('../util');

var Bookshelf = require('./bookshelf').bookshelf;
var orm = require('./bookshelf').orm;
var Editor = orm.Editor;
var EditorType = orm.EditorType;
var Gender = orm.Gender;
var Revision = orm.Revision;

chai.use(chaiAsPromised);

describe('Revision model', function() {
	var editorTypeAttribs = {id: 1, label: 'test_type'};
	var editorAttribs = {
		id: 1, name: 'bob', email: 'bob@test.org', password: 'test',
		countryId: 1, genderId:1, editorTypeId: 1
	};
	beforeEach(function() {
		return Promise.all([
			new Gender({id: 1, name: 'test'}).save(null, {method: 'insert'}),
			new EditorType(editorTypeAttribs).save(null, {method: 'insert'}),
			new Editor(editorAttribs).save(null, {method: 'insert'})
		]);
	});

	afterEach(function() {
		return Promise.all([
			Bookshelf.knex.raw('TRUNCATE bookbrainz.revision CASCADE'),
			Bookshelf.knex.raw('TRUNCATE bookbrainz.editor CASCADE'),
			Bookshelf.knex.raw('TRUNCATE bookbrainz.editor_type CASCADE'),
			Bookshelf.knex.raw('TRUNCATE musicbrainz.gender CASCADE')
		]);
	});

	it('should return a JSON object with correct keys when saved', function() {
		var revisionAttribs = {id: 1, authorId: 1, _type: 1};
		var revisionPromise = new Revision(revisionAttribs)
		.save(null, {method: 'insert'})
		.then(function reloadWithRelated(model) {
			return model.refresh({withRelated: ['author', 'parent']})
			.then(util.fetchJSON);
		});

		return expect(revisionPromise).to.eventually.have.all.keys([
			'id', 'author', 'authorId', 'createdAt', 'parentId', '_type'
		]);
	});
});
