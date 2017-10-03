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

import Promise from 'bluebird';
import bookbrainzData from './bookshelf';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {truncateTables} from '../lib/util';

chai.use(chaiAsPromised);
const {expect} = chai;
const {
	AliasSet, Annotation, Creator, Disambiguation, Editor, EditorType, Gender,
	IdentifierSet, RelationshipSet, Revision, bookshelf
} = bookbrainzData;

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

describe('Creator model', () => {
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
		this.timeout(0); // eslint-disable-line babel/no-invalid-this

		return truncateTables(bookshelf, [
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
		const revisionAttribs = {
			authorId: 1,
			id: 1
		};
		const creatorAttribs = {
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

		const creatorPromise = annotationPromise
			.then(() =>
				new Creator(creatorAttribs).save(null, {method: 'insert'})
			)
			.then((model) => model.refresh({
				withRelated: [
					'relationshipSet', 'aliasSet', 'identifierSet',
					'annotation', 'disambiguation'
				]
			}))
			.then((creator) => creator.toJSON());

		return expect(creatorPromise).to.eventually.have.all.keys([
			'aliasSet', 'aliasSetId', 'annotation', 'annotationId', 'areaId',
			'bbid', 'beginAreaId', 'beginDate', 'beginDay', 'beginMonth',
			'beginYear', 'dataId', 'defaultAliasId', 'disambiguation',
			'disambiguationId', 'endAreaId', 'endDate', 'endDay', 'endMonth',
			'endYear', 'ended', 'genderId', 'identifierSet', 'identifierSetId',
			'master', 'relationshipSet', 'relationshipSetId', 'revisionId',
			'type', 'typeId'
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
			const creatorAttribs = {
				aliasSetId: 1,
				identifierSetId: 1,
				relationshipSetId: 1,
				revisionId: 1
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
						ended: true,
						revisionId: 2
					};

					return new Creator(creatorUpdateAttribs).save();
				})
				.then((model) =>
					new Creator({bbid: model.get('bbid')}).fetch()
				)
				.then((creator) => creator.toJSON());

			return Promise.all([
				expect(creatorUpdatePromise)
					.to.eventually.have.property('revisionId', 2),
				expect(creatorUpdatePromise)
					.to.eventually.have.property('master', true),
				expect(creatorUpdatePromise)
					.to.eventually.have.property('ended', true)
			]);
		});
});
