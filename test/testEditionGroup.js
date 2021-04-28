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
	AliasSet, Annotation, Disambiguation, Editor, EditorType, Entity, Gender,
	IdentifierSet, EditionGroup, RelationshipSet, Revision, UserCollection, UserCollectionItem, bookshelf
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
const aBBID2 = faker.random.uuid();

describe('EditionGroup model', () => {
	beforeEach(
		() =>
			new Gender(genderData).save(null, {method: 'insert'})
				.then(
					() =>
						new EditorType(editorTypeData)
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
						new Entity({bbid: aBBID, type: 'EditionGroup'})
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
			'bookbrainz.user_collection',
			'bookbrainz.user_collection_item',
			'musicbrainz.gender'
		]);
	});

	it('should return a JSON object with correct keys when saved', () => {
		const revisionAttribs = {
			authorId: 1,
			id: 1
		};
		const editionGroupAttribs = {
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

		const entityPromise = annotationPromise
			.then(
				() =>
					new EditionGroup(editionGroupAttribs)
						.save(null, {method: 'insert'})
			)
			.then((model) => model.refresh({
				withRelated: [
					'relationshipSet', 'aliasSet', 'identifierSet',
					'annotation', 'disambiguation', 'authorCredit', 'collections'
				]
			}))
			.then((entity) => entity.toJSON());

		return expect(entityPromise).to.eventually.have.all.keys([
			'aliasSet', 'aliasSetId', 'annotation', 'annotationId', 'authorCreditId',
			'bbid', 'dataId', 'defaultAliasId', 'disambiguation',
			'disambiguationId', 'identifierSet', 'identifierSetId', 'master',
			'relationshipSet', 'relationshipSetId', 'revisionId', 'type',
			'typeId', 'collections'
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
			const editionGroupAttribs = {
				aliasSetId: 1,
				bbid: aBBID,
				identifierSetId: 1,
				relationshipSetId: 1,
				revisionId: 1
			};

			const revisionOnePromise = new Revision(revisionAttribs)
				.save(null, {method: 'insert'});

			const entityPromise = revisionOnePromise
				.then(
					() =>
						new EditionGroup(editionGroupAttribs)
							.save(null, {method: 'insert'})
				)
				.then((model) => model.refresh())
				.then((entity) => entity.toJSON());

			const revisionTwoPromise = entityPromise
				.then(() => {
					revisionAttribs.id = 2;
					return new Revision(revisionAttribs)
						.save(null, {method: 'insert'});
				});

			const entityUpdatePromise = Promise.join(entityPromise,
				revisionTwoPromise, (entity) => {
					const entityUpdateAttribs = {
						bbid: entity.bbid,
						revisionId: 2
					};

					return new EditionGroup(entityUpdateAttribs).save();
				})
				.then(
					(model) =>
						new EditionGroup({bbid: model.get('bbid')}).fetch()
				)
				.then((entity) => entity.toJSON());

			return Promise.all([
				expect(entityUpdatePromise)
					.to.eventually.have.property('revisionId', 2),
				expect(entityUpdatePromise)
					.to.eventually.have.property('master', true)
			]);
		});
	it('should return a JSON object with related collections if there exist any', async () => {
		const revisionAttribs = {
			authorId: 1,
			id: 1
		};
		const editionGroupAttribs = {
			aliasSetId: 1,
			bbid: aBBID,
			identifierSetId: 1,
			relationshipSetId: 1,
			revisionId: 1
		};
		const userCollectionAttribs = {
			entityType: 'EditionGroup',
			id: aBBID2,
			name: 'Test Collection',
			ownerId: 1
		};
		const userCollectionItemAttribs = {
			bbid: aBBID,
			collectionId: aBBID2
		};

		await new Revision(revisionAttribs).save(null, {method: 'insert'});
		const model = await new EditionGroup(editionGroupAttribs).save(null, {method: 'insert'});
		await new UserCollection(userCollectionAttribs).save(null, {method: 'insert'});
		await new UserCollectionItem(userCollectionItemAttribs).save(null, {method: 'insert'});
		await model.refresh({
			withRelated: ['collections']
		});
		const json = model.toJSON();
		const {collections} = json;

		// collections exist
		return expect(collections).to.have.lengthOf.above(0);
	});

	it('should return a JSON object with empty collections array', async () => {
		const revisionAttribs = {
			authorId: 1,
			id: 1
		};
		const editionGroupAttribs = {
			aliasSetId: 1,
			bbid: aBBID,
			identifierSetId: 1,
			relationshipSetId: 1,
			revisionId: 1
		};

		await new Revision(revisionAttribs).save(null, {method: 'insert'});
		const model = await new EditionGroup(editionGroupAttribs).save(null, {method: 'insert'});
		await model.refresh({
			withRelated: ['collections']
		});
		const json = model.toJSON();
		const {collections} = json;

		// collections does not exist
		return expect(collections).to.be.empty;
	});
});
