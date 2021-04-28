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
	AliasSet, Annotation, AuthorCredit, Disambiguation, Edition, EditionGroup, Editor, EditorType, Entity,
	Gender, IdentifierSet, RelationshipSet, Revision, UserCollection, UserCollectionItem, bookshelf
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

const revisionAttribs = {
	authorId: 1,
	id: 1
};
const editionAttribs = {
	aliasSetId: 1,
	annotationId: 1,
	authorCreditId: 1,
	bbid: aBBID,
	disambiguationId: 1,
	identifierSetId: 1,
	relationshipSetId: 1,
	revisionId: 1
};

function createEdition() {
	return bookshelf.transaction(async function (transacting) {
		await new Revision(revisionAttribs)
			.save(null, {method: 'insert', transacting});
		await new Annotation({
			content: 'Test Annotation',
			id: 1,
			lastRevisionId: 1
		})
			.save(null, {method: 'insert', transacting});
		const edition = await new Edition(editionAttribs)
			.save(null, {method: 'insert', transacting});
		return edition;
	});
}

describe('Edition model', () => {
	beforeEach(
		() =>
			new Gender(genderData).save(null, {method: 'insert'})
				.then(
					() => new EditorType(editorTypeData)
						.save(null, {method: 'insert'})
				)
				.then(
					() => new Editor(editorAttribs)
						.save(null, {method: 'insert'})
				)
				.then(
					() => Promise.all([
						new AliasSet(setData)
							.save(null, {method: 'insert'}),
						new IdentifierSet(setData)
							.save(null, {method: 'insert'}),
						new RelationshipSet(setData)
							.save(null, {method: 'insert'}),
						new AuthorCredit({...setData, authorCount: 0})
							.save(null, {method: 'insert'}),
						new Disambiguation({
							comment: 'Test Disambiguation',
							id: 1
						})
							.save(null, {method: 'insert'}),
						new Entity({bbid: aBBID, type: 'Edition'})
							.save(null, {method: 'insert'})
					])
				)
	);

	afterEach(function truncate() {
		this.timeout(0); // eslint-disable-line babel/no-invalid-this

		return truncateTables(bookshelf, [
			'bookbrainz.entity',
			'bookbrainz.revision',
			'bookbrainz.alias',
			'bookbrainz.author_credit',
			'bookbrainz.identifier',
			'bookbrainz.relationship',
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

	it('should return a JSON object with correct keys when saved', async () => {
		const edition = await createEdition();
		await edition.refresh({
			withRelated: [
				'relationshipSet', 'aliasSet', 'identifierSet',
				'annotation', 'disambiguation', 'authorCredit', 'collections'
			]
		});
		const editionJSON = edition.toJSON();

		expect(editionJSON).to.have.all.keys([
			'aliasSet', 'aliasSetId', 'annotation', 'annotationId', 'bbid',
			'authorCredit', 'authorCreditId', 'dataId', 'defaultAliasId', 'depth',
			'disambiguation', 'disambiguationId', 'formatId', 'height',
			'identifierSet', 'identifierSetId', 'languageSetId', 'master',
			'pages', 'editionGroupBbid', 'publisherSetId', 'relationshipSet',
			'relationshipSetId', 'releaseEventSetId', 'revisionId', 'statusId',
			'type', 'weight', 'width', 'collections'
		]);
	});

	it('should automatically create an Edition Group if none has been passed', async () => {
		const edition = await createEdition();
		await edition.refresh({
			withRelated: [
				'relationshipSet', 'aliasSet', 'identifierSet',
				'annotation', 'disambiguation', 'authorCredit',
				'editionGroup'
			]
		});
		const editionJSON = edition.toJSON();

		expect(editionJSON.editionGroupBbid).to.be.a('string');
		expect(editionJSON.editionGroup.aliasSetId).to.equal(1);
		expect(editionJSON.editionGroup.revisionId).to.equal(1);
		expect(editionJSON.editionGroup.dataId).to.not.be.null;
	});

	it('should automatically create an Edition Group editionGroupBbid has been unset in existing Edition', async () => {
		let edition = await createEdition();

		let editionJSON = edition.toJSON();
		const firstEditionGroup = editionJSON.editionGroupBbid;
		expect(firstEditionGroup).to.be.a('string');

		// Save the Edition with no editionGroupBbid
		const revision2 = await new Revision({...revisionAttribs, id: 2})
			.save(null, {method: 'insert'});
		edition = await new Edition({...editionAttribs, editionGroupBbid: null, revisionId: revision2.id})
			.save();

		// Fetch it again
		edition = await new Edition({bbid: edition.get('bbid')}).fetch({withRelated: ['editionGroup']});
		editionJSON = edition.toJSON();

		// Check that a new Edition Group has been created automatically
		expect(editionJSON.editionGroupBbid).to.be.a('string');
		expect(editionJSON.editionGroupBbid).to.not.equal(firstEditionGroup);
	});

	it('should set the same Author Credit on auto-created Edition Group', async () => {
		const edition = await createEdition();

		const editionJSON = edition.toJSON();
		expect(editionJSON.authorCreditId).to.be.a('number');
		const editionGroupBBID = editionJSON.editionGroupBbid;

		// Fetch the Edition Group
		const editionGroup = await new EditionGroup({bbid: editionGroupBBID}).fetch({withRelated: ['authorCredit']});
		const editionGroupJSON = editionGroup.toJSON();

		// Check that the newly created Edition Group has the same Author Credit ID set
		expect(editionGroupJSON.authorCreditId).to.equal(editionJSON.authorCreditId);
	});

	it('should return the master revision when multiple revisions exist',
		() => {
			/*
			 * Revision ID order is reversed so that result is not dependent on
			 * row order
			 */
			const revisionAttribs2 = {
				authorId: 1,
				id: 1
			};
			const editionAttribs2 = {
				aliasSetId: 1,
				bbid: aBBID,
				identifierSetId: 1,
				relationshipSetId: 1,
				revisionId: 1
			};

			const revisionOnePromise = new Revision(revisionAttribs2)
				.save(null, {method: 'insert'});

			const editionPromise = revisionOnePromise
				.then(
					() =>
						new Edition(editionAttribs2)
							.save(null, {method: 'insert'})
				)
				.then((model) => model.refresh())
				.then((author) => author.toJSON());

			const revisionTwoPromise = editionPromise
				.then(() => {
					revisionAttribs2.id = 2;
					return new Revision(revisionAttribs2)
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
				.then(
					(model) => new Edition({bbid: model.get('bbid')}).fetch()
				)
				.then((edition) => edition.toJSON());

			return Promise.all([
				expect(editionUpdatePromise)
					.to.eventually.have.property('revisionId', 2),
				expect(editionUpdatePromise)
					.to.eventually.have.property('master', true)
			]);
		});

	it('should return a JSON object with related collections if there exist any', async () => {
		const edition = await createEdition();
		const userCollectionAttribs = {
			entityType: 'Author',
			id: aBBID2,
			name: 'Test Collection',
			ownerId: 1
		};
		const userCollectionItemAttribs = {
			bbid: aBBID,
			collectionId: aBBID2
		};

		await new UserCollection(userCollectionAttribs).save(null, {method: 'insert'});
		await new UserCollectionItem(userCollectionItemAttribs).save(null, {method: 'insert'});
		await edition.refresh({
			withRelated: ['collections']
		});
		const json = edition.toJSON();
		const {collections} = json;

		// collections exist
		return expect(collections).to.have.lengthOf(1);
	});

	it('should return a JSON object with empty collections array', async () => {
		const edition = await createEdition();
		await edition.refresh({
			withRelated: ['collections']
		});
		const json = edition.toJSON();
		const {collections} = json;

		// collections does not exist
		return expect(collections).to.be.empty;
	});
});
