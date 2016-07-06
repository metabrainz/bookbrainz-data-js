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
const Promise = require('bluebird');

const util = require('../util');
const Bookshelf = require('./bookshelf');
const EditorEntityVisits = require('../index').EditorEntityVisits;
const Revision = require('../index').Revision;
const Gender = require('../index').Gender;
const EditorType = require('../index').EditorType;
const Editor = require('../index').Editor;
const Annotation = require('../index').Annotation;
const Disambiguation = require('../index').Disambiguation;
const AliasSet = require('../index').AliasSet;
const IdentifierSet = require('../index').IdentifierSet;
const RelationshipSet = require('../index').RelationshipSet;
const Publisher = require('../index').Publisher;

const genderData = {id: 1, name: 'test'};
const editorTypeData = {id: 1, label: 'test_type'};
const editorData = {
	id: 1, name: 'bob', email: 'bob@test.org', password: 'test',
	genderId: 1, typeId: 1
};
const setData = {id: 1};
const revisionAttribs = {id: 1, authorId: 1};
const publisherAttribs = {
	revisionId: 1, aliasSetId: 1, identifierSetId: 1,
	relationshipSetId: 1, annotationId: 1,
	disambiguationId: 1
};

describe('EditorEntityVisits model', () => {
	beforeEach(() => {
		return new Gender(genderData).save(null, {method: 'insert'})
			.then(() =>
				new EditorType(editorTypeData).save(null, {method: 'insert'})
			)
			.then(() =>
				new Editor(editorData).save(null, {method: 'insert'})
			)
			.then(() =>
				Promise.all([
					new AliasSet(setData).save(null, {method: 'insert'}),
					new IdentifierSet(setData).save(null, {method: 'insert'}),
					new RelationshipSet(setData).save(null, {method: 'insert'}),
					new Disambiguation({id: 1, comment: 'Test Disambiguation'})
						.save(null, {method: 'insert'})
				])
			)
			.then(() =>
				new Revision(revisionAttribs).save(null, {method: 'insert'})
			)
			.then(() =>
				new Annotation({
					id: 1, content: 'Test Annotation', lastRevisionId: 1
				})
					.save(null, {method: 'insert'}))
			.then(() =>
				new Publisher(publisherAttribs)
					.save(null, {method: 'insert'})
			);
	});

	afterEach(() => {
		return util.truncateTables(Bookshelf, [
			'bookbrainz._editor_entity_visits',
			'bookbrainz.entity',
			'bookbrainz.revision',
			'bookbrainz.relationship_set',
			'bookbrainz.identifier_set',
			'bookbrainz.alias_set',
			'bookbrainz.annotation',
			'bookbrainz.disambiguation',
			'bookbrainz.editor',
			'bookbrainz.editor_type',
			'musicbrainz.gender'
		]);
	});

	it('should return a JSON object with correct keys when saved', () => {
		const publisherPromise = new Publisher(publisherAttribs)
				.save(null, {method: 'insert'});

		const editorVisitsPromise = publisherPromise
			.then((publisher) => {
				return new EditorEntityVisits({
					id: 1,
					editorId: editorData.id,
					bbid: publisher.attributes.bbid
				})
				.save(null, {method: 'insert'});
			});

		const jsonPromise = editorVisitsPromise
			.then((model) => model.refresh())
			.then((editorVisit) => {
				return editorVisit.toJSON();
			});

		return expect(jsonPromise).to.eventually.have.all.keys([
			'id', 'editorId', 'bbid'
		]);
	});
});
