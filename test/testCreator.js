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
const Creator = require('../index').Creator;
const Revision = require('../index').Revision;
const Gender = require('../index').Gender;
const EditorType = require('../index').EditorType;
const Editor = require('../index').Editor;
const AliasSet = require('../index').AliasSet;
const IdentifierSet = require('../index').IdentifierSet;
const RelationshipSet = require('../index').RelationshipSet;

const genderData = {id: 1, name: 'test'};
const editorTypeData = {id: 1, label: 'test_type'};
const editorData = {
	id: 1, name: 'bob', email: 'bob@test.org', password: 'test',
	genderId: 1, typeId: 1
};
const setData = {id: 1};

describe('Creator model', () => {
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
					new RelationshipSet(setData).save(null, {method: 'insert'})
				])
			);
	});

	afterEach(() => {
		return util.truncateTables(Bookshelf, [
			'bookbrainz.entity',
			'bookbrainz.revision',
			'bookbrainz.relationship_set',
			'bookbrainz.identifier_set',
			'bookbrainz.alias_set',
			'bookbrainz.editor',
			'bookbrainz.editor_type',
			'musicbrainz.gender'
		]);
	});

	it('should return a JSON object with correct keys when saved', () => {
		const revisionAttribs = {id: 1, authorId: 1};
		const creatorAttribs = {
			revisionId: 1, aliasSetId: 1, identifierSetId: 1,
			relationshipSetId: 1
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
			'bbid', 'revisionId', 'annotationId',
			'disambiguationId', 'defaultAliasId', 'beginYear', 'beginMonth',
			'beginDay', 'beginAreaId', 'endYear', 'endMonth', 'endDay',
			'endAreaId', 'ended', 'areaId', 'genderId', 'typeId', 'aliasSetId',
			'identifierSetId', 'relationshipSetId', 'master', 'type'
		]);
	});

	it('should return the master revision when multiple revisions exist',
		() => {
			/* Revision ID order is reversed so that result is not dependent on
			row order */
			const revisionAttribs = {id: 1, authorId: 1};
			const creatorAttribs = {
				revisionId: 1, aliasSetId: 1, identifierSetId: 1,
				relationshipSetId: 1
			};

			const revisionOnePromise = new Revision(revisionAttribs)
				.save(null, {method: 'insert'});

			const creatorPromise = revisionOnePromise
				.then(() =>
					new Creator(creatorAttribs).save()
				)
				.then((model) => model.refresh())
				.then((creator) => creator.toJSON());

			const revisionTwoPromise = creatorPromise
				.then(() => {
					revisionAttribs.id = 2;
					return new Revision(revisionAttribs)
						.save(null, {method: 'insert'});
				});

			const creatorUpdatePromise = Promise.join(creatorPromise,
				revisionTwoPromise, (creator) => {
					const creatorUpdateAttribs = {
						bbid: creator.bbid,
						revisionId: 2,
						ended: true
					};

					return new Creator(creatorUpdateAttribs).save();
				})
				.then((model) =>
					new Creator({bbid: model.get('bbid'), master: true}).fetch()
				)
				.then((creator) => {
					console.log(creator.toJSON());
					return creator.toJSON();
				});

			return Promise.all([
				expect(creatorUpdatePromise)
					.to.eventually.have.property('revisionId', 2),
				expect(creatorUpdatePromise)
					.to.eventually.have.property('ended', true)
			]);
		});
});
