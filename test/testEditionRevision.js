/*
 * Copyright (C) 2015-2016  Ben Ockmore
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
const Editor = require('../index').Editor;
const EditorType = require('../index').EditorType;
const Gender = require('../index').Gender;
const Revision = require('../index').Revision;
const Edition = require('../index').Edition;
const EditionRevision = require('../index').EditionRevision;
const Annotation = require('../index').Annotation;
const Disambiguation = require('../index').Disambiguation;
const AliasSet = require('../index').AliasSet;
const IdentifierSet = require('../index').IdentifierSet;
const RelationshipSet = require('../index').RelationshipSet;

const data = {
	gender: {
		id: 1,
		name: 'test'
	},
	editorType: {
		id: 1,
		label: 'test_type'
	},
	editor: {
		id: 1,
		name: 'bob',
		password: 'test',
		genderId: 1,
		typeId: 1
	},
	set: {id: 1},
	revision: {
		id: 1,
		authorId: 1
	},
	edition: {
		bbid: 'de305d54-75b4-431b-adb2-eb6b9e546014',
		revisionId: 1,
		aliasSetId: 1,
		identifierSetId: 1,
		relationshipSetId: 1,
		annotationId: 1,
		disambiguationId: 1
	},
	disambiguation: {
		id: 1,
		comment: 'Test Disambiguation'
	},
	annotation: {
		id: 1,
		content: 'Test Annotation',
		lastRevisionId: 1
	}
};

describe('EditionRevision model', () => {
	beforeEach(() => {
		return new Gender(data.gender)
			.save(null, {method: 'insert'})
			.then(() =>
				new EditorType(data.editorType).save(null, {method: 'insert'})
			)
			.then(() =>
				new Editor(data.editor).save(null, {method: 'insert'})
			)
			.then(() =>
				Promise.all([
					new AliasSet(data.set).save(null, {method: 'insert'}),
					new IdentifierSet(data.set).save(null, {method: 'insert'}),
					new RelationshipSet(data.set)
						.save(null, {method: 'insert'}),
					new Disambiguation(data.disambiguation)
						.save(null, {method: 'insert'})
				])
			)
			.then(() =>
				new Revision(data.revision).save(null, {method: 'insert'})
			)
			.then(() =>
				new Annotation(data.annotation).save(null, {method: 'insert'})
			)
			.then(() =>
				new Edition(data.edition).save(null, {method: 'insert'})
			);
	});

	afterEach(function truncate() {
		this.timeout(0);

		return util.truncateTables(Bookshelf, [
			'bookbrainz.annotation',
			'bookbrainz.disambiguation',
			'bookbrainz.alias',
			'bookbrainz.identifier',
			'bookbrainz.relationship',
			'bookbrainz.relationship_set',
			'bookbrainz.identifier_set',
			'bookbrainz.alias_set',
			'bookbrainz.edition_revision',
			'bookbrainz.edition_header',
			'bookbrainz.edition_data',
			'bookbrainz.revision',
			'bookbrainz.editor',
			'bookbrainz.editor_type',
			'musicbrainz.gender'
		]);
	});

	it('should return a JSON object with correct keys when saved', () => {
		const relatedToLoad = ['revision', 'entity', 'data'];
		const revisionPromise = new EditionRevision({id: 1})
			.fetch({withRelated: relatedToLoad})
			.then((revision) => revision.toJSON());

		return expect(revisionPromise).to.eventually.have.all.keys([
			'id', 'revision', 'entity', 'data', 'bbid', 'dataId'
		]);
	});
});
