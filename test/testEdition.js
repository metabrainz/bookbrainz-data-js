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
const Edition = require('../index').Edition;
const Revision = require('../index').Revision;
const Gender = require('../index').Gender;
const EditorType = require('../index').EditorType;
const Editor = require('../index').Editor;
const Annotation = require('../index').Annotation;
const Disambiguation = require('../index').Disambiguation;
const AliasSet = require('../index').AliasSet;
const IdentifierSet = require('../index').IdentifierSet;
const RelationshipSet = require('../index').RelationshipSet;

const genderData = {
	id: 1,
	name: 'test'
};
const editorTypeData = {
	id: 1,
	label: 'test_type'
};
const editorAttribs = {
	id: 1,
	name: 'bob',
	genderId: 1,
	typeId: 1
};
const setData = {id: 1};

describe('Edition model', () => {
	beforeEach(() =>
		new Gender(genderData).save(null, {method: 'insert'})
			.then(() =>
				new EditorType(editorTypeData).save(null, {method: 'insert'})
			)
			.then(() =>
				new Editor(editorAttribs).save(null, {method: 'insert'})
			)
			.then(() =>
				Promise.all([
					new AliasSet(setData).save(null, {method: 'insert'}),
					new IdentifierSet(setData).save(null, {method: 'insert'}),
					new RelationshipSet(setData).save(null, {method: 'insert'}),
					new Disambiguation({
						id: 1,
						comment: 'Test Disambiguation'
					})
						.save(null, {method: 'insert'})
				])
			)
	);

	afterEach(function truncate() {
		this.timeout(0);

		return util.truncateTables(Bookshelf, [
			'bookbrainz.entity',
			'bookbrainz.revision',
			'bookbrainz.alias',
			'bookbrainz.identifier',
			'bookbrainz.relationship',
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
		const revisionAttribs = {
			id: 1,
			authorId: 1
		};
		const editionAttribs = {
			revisionId: 1,
			aliasSetId: 1,
			identifierSetId: 1,
			relationshipSetId: 1,
			annotationId: 1,
			disambiguationId: 1
		};

		const revisionPromise = new Revision(revisionAttribs)
			.save(null, {method: 'insert'});

		const annotationPromise = revisionPromise
			.then(() =>
				new Annotation({
					id: 1,
					content: 'Test Annotation',
					lastRevisionId: 1
				})
					.save(null, {method: 'insert'})
			);

		const editionPromise = annotationPromise
			.then(() =>
				new Edition(editionAttribs).save(null, {method: 'insert'})
			)
			.then((model) => model.refresh({
				withRelated: [
					'relationshipSet', 'aliasSet', 'identifierSet',
					'annotation', 'disambiguation'
				]
			}))
			.then((edition) => edition.toJSON());

		return expect(editionPromise).to.eventually.have.all.keys([
			'aliasSet', 'aliasSetId', 'annotation', 'annotationId', 'bbid',
			'creatorCreditId', 'dataId', 'defaultAliasId', 'depth',
			'disambiguation', 'disambiguationId', 'formatId', 'height',
			'identifierSet', 'identifierSetId', 'languageSetId', 'master',
			'pages', 'publicationBbid', 'publisherSetId', 'relationshipSet',
			'relationshipSetId', 'releaseEventSetId', 'revisionId', 'statusId',
			'type', 'weight', 'width'
		]);
	});

	it('should return the master revision when multiple revisions exist',
		() => {
			/* Revision ID order is reversed so that result is not dependent on
			row order */
			const revisionAttribs = {
				id: 1,
				authorId: 1
			};
			const editionAttribs = {
				revisionId: 1,
				aliasSetId: 1,
				identifierSetId: 1,
				relationshipSetId: 1
			};

			const revisionOnePromise = new Revision(revisionAttribs)
				.save(null, {method: 'insert'});

			const editionPromise = revisionOnePromise
				.then(() =>
					new Edition(editionAttribs).save()
				)
				.then((model) => model.refresh())
				.then((creator) => creator.toJSON());

			const revisionTwoPromise = editionPromise
				.then(() => {
					revisionAttribs.id = 2;
					return new Revision(revisionAttribs)
						.save(null, {method: 'insert'});
				});

			const editionUpdatePromise = Promise.join(editionPromise,
				revisionTwoPromise, (edition) => {
					const editionUpdateAttribs = {
						bbid: edition.bbid,
						revisionId: 2
					};

					return new Edition(editionUpdateAttribs).save();
				})
				.then((model) =>
					new Edition({bbid: model.get('bbid')}).fetch()
				)
				.then((edition) => edition.toJSON());

			return Promise.all([
				expect(editionUpdatePromise)
					.to.eventually.have.property('revisionId', 2),
				expect(editionUpdatePromise)
					.to.eventually.have.property('master', true)
			]);
		});
});
