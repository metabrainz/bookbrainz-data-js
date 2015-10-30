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
const Promise = require('bluebird');
const util = require('../util');

const orm = require('./bookshelf');
const Bookshelf = orm.bookshelf;

const Entity = orm.Entity;
const Revision = orm.Revision;
const EntityRevision = orm.EntityRevision;
const Gender = orm.Gender;
const EditorType = orm.EditorType;
const EntityData = orm.EntityData;
const Editor = orm.Editor;

chai.use(chaiAsPromised);

const genderData = {id: 1, name: 'test'};
const editorTypeData = {id: 1, label: 'test_type'};
const editorData = {
	id: 1, name: 'bob', email: 'bob@test.org', password: 'test', countryId: 1,
	genderId: 1, editorTypeId: 1
};

describe('Entity model', function setupData() {
	beforeEach(function() {
		return Promise.all([
			new Gender(genderData).save(null, {method: 'insert'}),
			new EditorType(editorTypeData).save(null, {method: 'insert'}),
			new Editor(editorData).save(null, {method: 'insert'})
		]);
	});

	afterEach(function destroyData() {
		return Promise.all([
			Bookshelf.knex.raw('TRUNCATE bookbrainz.entity CASCADE'),
			Bookshelf.knex.raw('TRUNCATE bookbrainz.entity_data CASCADE'),
			Bookshelf.knex.raw('TRUNCATE bookbrainz.entity_revision CASCADE'),
			Bookshelf.knex.raw('TRUNCATE bookbrainz.revision CASCADE'),
			Bookshelf.knex.raw('TRUNCATE bookbrainz.editor CASCADE'),
			Bookshelf.knex.raw('TRUNCATE bookbrainz.editor_type CASCADE'),
			Bookshelf.knex.raw('TRUNCATE musicbrainz.gender CASCADE')
		]);
	});

	it('should return a JSON object with correct keys when saved', function() {
		// Construct EntityRevision, add to Entity, then save
		const entityAttribs = {
			bbid: '68f52341-eea4-4ebc-9a15-6226fb68962c',
			masterRevisionId: null, _type: 'Creator'
		};
		const entityDataAttribs = {id: 1, _type: 2};
		const revisionAttribs = {id: 1, authorId: 1, _type: 1};
		const entityRevisionAttribs = {
			id: 1, entityBbid: '68f52341-eea4-4ebc-9a15-6226fb68962c',
			entityDataId: 1
		};

		function createDataAndRevision(entityModel) {
			return new EntityData(entityDataAttribs)
			.save(null, {method: 'insert'})
			.then(() =>
				new Revision(revisionAttribs).save(null, {method: 'insert'})
			)
			.then(function() {
				return new EntityRevision(entityRevisionAttribs)
				.save(null, {method: 'insert'});
			})
			.then(function() {
				entityModel.set('masterRevisionId', 1);
				return entityModel.save();
			})
			.then(function() {
				return new Entity({
					bbid: '68f52341-eea4-4ebc-9a15-6226fb68962c'
				}).fetch({withRelated: ['masterRevision']});
			})
			.then(util.fetchJSON);
		}

		const entityPromise = new Entity(entityAttribs)
		.save(null, {method: 'insert'})
		.then(createDataAndRevision);

		return expect(entityPromise).to.eventually.have.all.keys([
			'bbid', 'masterRevisionId', 'masterRevision', '_type', 'lastUpdated'
		]);
	});
});
