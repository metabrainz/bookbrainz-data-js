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
import faker from 'faker';
import {truncateTables} from '../lib/util';


chai.use(chaiAsPromised);
const {expect} = chai;
const {
	AliasSet, Annotation, Author, Disambiguation, Editor, EditorType, Entity,
	Gender, IdentifierSet, RelationshipSet, Revision, bookshelf
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

const aBBID = faker.random.uuid();

describe('Author model', () => {
	beforeEach(
		() =>
			new Gender(genderData).save(null, {method: 'insert'})
				.then(
					() => new EditorType(editorTypeData)
						.save(null, {method: 'insert'})
				)
				.then(
					() =>
						new Editor(editorAttribs)
							.save(null, {method: 'insert'})
				)
				.then(
					() => Promise.all([
						new AliasSet(setData).save(null, {method: 'insert'}),
						new IdentifierSet(setData)
							.save(null, {method: 'insert'}),
						new RelationshipSet(setData)
							.save(null, {method: 'insert'}),
						new Disambiguation({
							comment: 'Test Disambiguation',
							id: 1
						})
							.save(null, {method: 'insert'}),
						new Entity({bbid: aBBID, type: 'Creator'})
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
		const authorAttribs = {
			aliasSetId: 1,
			annotationId: 1,
			bbid: aBBID,
			disambiguationId: 1,
			identifierSetId: 1,
			relationshipSetId: 1,
			revisionId: 1
		};

		const revisionPromise = new Revision(revisionAttribs)
			.save(null, {method: 'insert'});

		const annotationPromise = revisionPromise
			.then(
				() =>
					new Annotation({
						content: 'Test Annotation',
						id: 1,
						lastRevisionId: 1
					})
						.save(null, {method: 'insert'})
			);

		const authorPromise = annotationPromise
			.then(
				() =>
					new Author(authorAttribs).save(null, {method: 'insert'})
			)
			.then((model) => model.refresh({
				withRelated: [
					'relationshipSet', 'aliasSet', 'identifierSet',
					'annotation', 'disambiguation'
				]
			}))
			.then((author) => author.toJSON());

		return expect(authorPromise).to.eventually.have.all.keys([
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
			/*
			 * Revision ID order is reversed so that result is not dependent on
			 * row order
			 */
			const revisionAttribs = {
				authorId: 1,
				id: 1
			};
			const authorAttribs = {
				aliasSetId: 1,
				bbid: aBBID,
				identifierSetId: 1,
				relationshipSetId: 1,
				revisionId: 1
			};

			const revisionOnePromise = new Revision(revisionAttribs)
				.save(null, {method: 'insert'});

			const authorPromise = revisionOnePromise
				.then(
					() =>
						new Author(authorAttribs)
							.save(null, {method: 'insert'})
				)
				.then((model) => model.refresh())
				.then((author) => author.toJSON());

			const revisionTwoPromise = authorPromise
				.then(() => {
					revisionAttribs.id = 2;
					return new Revision(revisionAttribs)
						.save(null, {method: 'insert'});
				});

			const authorUpdatePromise = Promise.join(authorPromise,
				revisionTwoPromise, (author) => {
					const authorUpdateAttribs = {
						bbid: author.bbid,
						ended: true,
						revisionId: 2
					};

					return new Author(authorUpdateAttribs).save();
				})
				.then(
					(model) => new Author({bbid: model.get('bbid')}).fetch()
				)
				.then((author) => author.toJSON());

			return Promise.all([
				expect(authorUpdatePromise)
					.to.eventually.have.property('revisionId', 2),
				expect(authorUpdatePromise)
					.to.eventually.have.property('master', true),
				expect(authorUpdatePromise)
					.to.eventually.have.property('ended', true)
			]);
		});
});
