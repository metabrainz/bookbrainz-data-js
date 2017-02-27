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

const util = require('../lib/util');
const Bookshelf = require('./bookshelf');
const Edition = require('../lib/index').Edition;
const Revision = require('../lib/index').Revision;
const Gender = require('../lib/index').Gender;
const EditorType = require('../lib/index').EditorType;
const Editor = require('../lib/index').Editor;
const Annotation = require('../lib/index').Annotation;
const Disambiguation = require('../lib/index').Disambiguation;
const AliasSet = require('../lib/index').AliasSet;
const IdentifierSet = require('../lib/index').IdentifierSet;
const RelationshipSet = require('../lib/index').RelationshipSet;

const genderData = {
	id: 1,
	name: 'test'
};
const editorTypeData = {
	id: 1,
	label: 'test_type'
};
const editorAttribs = {
	genderId: 1,
	id: 1,
	name: 'bob',
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
						comment: 'Test Disambiguation',
						id: 1
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
			authorId: 1,
			id: 1
		};
		const editionAttribs = {
			aliasSetId: 1,
			annotationId: 1,
			disambiguationId: 1,
			identifierSetId: 1,
			relationshipSetId: 1,
			revisionId: 1
		};

		const revisionPromise = new Revision(revisionAttribs)
			.save(null, {method: 'insert'});

		const annotationPromise = revisionPromise
			.then(() =>
				new Annotation({
					content: 'Test Annotation',
					id: 1,
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
				authorId: 1,
				id: 1
			};
			const editionAttribs = {
				aliasSetId: 1,
				identifierSetId: 1,
				relationshipSetId: 1,
				revisionId: 1
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
