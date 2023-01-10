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

import bookbrainzData from './bookshelf';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import faker from 'faker';
import {truncateTables} from '../lib/util';


chai.use(chaiAsPromised);
const {expect} = chai;
const {
	Alias, AliasSet, Annotation, Author, AuthorCredit, AuthorCreditName,
	Disambiguation, Edition, EditionGroup, Editor, EditorType, Entity,
	Gender, IdentifierSet, RelationshipSet, Revision,
	UserCollection, UserCollectionItem, bookshelf
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


let defaultAliasId;

const revisionAttribs = {
	authorId: 1,
	id: 1
};
const authorAttribs = {
	aliasSetId: 1,
	annotationId: 1,
	bbid: aBBID,
	defaultAliasId,
	disambiguationId: 1,
	identifierSetId: 1,
	relationshipSetId: 1,
	revisionId: 1
};

async function createAuthor() {
	await new Revision({...revisionAttribs, id: revisionAttribs.id++})
		.save(null, {method: 'insert'});
	await new Annotation({
		content: 'Test Annotation',
		id: 1,
		lastRevisionId: 1
	})
		.save(null, {method: 'insert'});

	/** Create the Author entity */
	await new Entity({bbid: aBBID, type: 'Author'})
		.save(null, {method: 'insert'});
	const author = await new Author(authorAttribs)
		.save(null, {method: 'insert'});

	return author;
}
function truncateAll() {
	return truncateTables(bookshelf, [
		'bookbrainz.entity',
		'bookbrainz.author_header',
		'bookbrainz.author_data',
		'bookbrainz.author_credit',
		'bookbrainz.author_credit_name',
		'bookbrainz.revision',
		'bookbrainz.relationship_set',
		'bookbrainz.identifier_set',
		'bookbrainz.alias',
		'bookbrainz.alias_set',
		'bookbrainz.annotation',
		'bookbrainz.disambiguation',
		'bookbrainz.editor',
		'bookbrainz.editor_type',
		'bookbrainz.user_collection',
		'bookbrainz.user_collection_item',
		'musicbrainz.gender'
	]);
}
describe('Author model', () => {
	before(
		async () => {
			await truncateAll();
			await new Gender(genderData).save(null, {method: 'insert'});
			await new EditorType(editorTypeData)
				.save(null, {method: 'insert'});
			await new Editor(editorAttribs)
				.save(null, {method: 'insert'});


			const alias = await new Alias({name: 'FNORD', sortName: 'FNORD'}).save(null, {method: 'insert'});
			defaultAliasId = alias.get('id');
			const aliasSet = await new AliasSet({...setData, defaultAliasId}).save(null, {method: 'insert'});
			await aliasSet.aliases().attach(alias);

			await new IdentifierSet(setData)
				.save(null, {method: 'insert'});
			await new RelationshipSet(setData)
				.save(null, {method: 'insert'});
			await new Disambiguation({
				comment: 'Test Disambiguation',
				id: 1
			})
				.save(null, {method: 'insert'});

			await createAuthor();
		}
	);

	after(truncateAll);

	it('should return a JSON object with correct keys when saved', () => {
		const revisionPromise = new Revision({...revisionAttribs, id: revisionAttribs.id++})
			.save(null, {method: 'insert'});

		const annotationPromise = revisionPromise
			.then(
				() =>
					new Annotation({
						content: 'Test Annotation',
						id: 123,
						lastRevisionId: 1
					})
						.save(null, {method: 'insert'})
			);
		const bbid = faker.random.uuid();
		const authorPromise = annotationPromise
			.then(
				() =>
					new Entity({bbid, type: 'Author'}).save(null, {method: 'insert'})
			)
			.then(
				() =>
					new Author({...authorAttribs, bbid}).save(null, {method: 'insert'})
			)
			.then((model) => model.refresh({
				withRelated: [
					'relationshipSet', 'aliasSet', 'identifierSet',
					'annotation', 'disambiguation', 'collections'
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
			'type', 'typeId', 'collections', 'sortName', 'name', 'authorType'
		]);
	});

	it('should return the master revision when multiple revisions exist',
		() => {
			/*
			 * Revision ID order is reversed so that result is not dependent on
			 * row order
			 */

			const revisionOnePromise = new Revision({...revisionAttribs, id: revisionAttribs.id++})
				.save(null, {method: 'insert'});
			const bbid = faker.random.uuid();
			const authorPromise = revisionOnePromise
				.then(
					() => new Entity({bbid, type: 'Author'}).save(null, {method: 'insert'})
				)
				.then(
					() =>
						new Author({...authorAttribs, annotationId: null, bbid})
							.save(null, {method: 'insert'})
				)
				.then((model) => model.refresh())
				.then((author) => author.toJSON());

			const revisionTwoPromise = authorPromise
				.then(() => new Revision({...revisionAttribs, id: 234})
					.save(null, {method: 'insert'}));

			const authorUpdatePromise = Promise.all(
				[authorPromise, revisionTwoPromise]
			)
				.then(([author]) => {
					const authorUpdateAttribs = {
						bbid: author.bbid,
						ended: true,
						revisionId: 234
					};

					return new Author(authorUpdateAttribs).save();
				})
				.then(
					(model) => new Author({bbid: model.get('bbid')}).fetch()
				)
				.then((author) => author.toJSON());

			return Promise.all([
				expect(authorUpdatePromise)
					.to.eventually.have.property('revisionId', 234),
				expect(authorUpdatePromise)
					.to.eventually.have.property('master', true),
				expect(authorUpdatePromise)
					.to.eventually.have.property('ended', true)
			]);
		});

	it('should return a JSON object with related collections if there exist any', async () => {
		const bbid = faker.random.uuid();
		const userCollectionAttribs = {
			entityType: 'Author',
			id: aBBID2,
			name: 'Test Collection',
			ownerId: 1
		};
		const userCollectionItemAttribs = {
			bbid,
			collectionId: aBBID2
		};

		await new Revision({...revisionAttribs, id: revisionAttribs.id++}).save(null, {method: 'insert'});
		await new Entity({bbid, type: 'Author'}).save(null, {method: 'insert'});
		const model = await new Author({...authorAttribs, bbid}).save(null, {method: 'insert'});

		await new UserCollection(userCollectionAttribs).save(null, {method: 'insert'});
		await new UserCollectionItem(userCollectionItemAttribs).save(null, {method: 'insert'});
		await model.refresh({
			withRelated: ['collections']
		});
		const json = model.toJSON();
		const {collections} = json;

		// collections exist
		return expect(collections).to.have.lengthOf(1);
	});

	it('should return a JSON object with empty collections array', async () => {
		const bbid = faker.random.uuid();
		await new Revision({...revisionAttribs, id: revisionAttribs.id++}).save(null, {method: 'insert'});
		await new Entity({bbid, type: 'Author'}).save(null, {method: 'insert'});
		const model = await new Author({...authorAttribs, bbid}).save(null, {method: 'insert'});
		await model.refresh({
			withRelated: ['collections']
		});
		const json = model.toJSON();
		const {collections} = json;

		// collections does not exist
		return expect(collections).to.be.empty;
	});

	describe('with Author Credits', () => {
		const entityBBID = faker.random.uuid();
		const entityAtribs = {...authorAttribs, authorCreditId: 1, bbid: entityBBID, defaultAliasId};
		beforeEach(async () => {
			/** Create the Author Credit */
			await new AuthorCredit({...setData, authorCount: 0})
				.save(null, {method: 'insert'});
			await new AuthorCreditName(
				{authorBbid: aBBID, authorCreditId: 1, joinPhrase: '', name: 'John Fnord', position: 0}
			)
				.save(null, {method: 'insert'});
		});
		afterEach(async () => {
			await truncateTables(bookshelf, [
				'bookbrainz.author_credit',
				'bookbrainz.author_credit_name',
				'bookbrainz.edition_data',
				'bookbrainz.edition_header',
				'bookbrainz.edition_revision',
				'bookbrainz.edition_group_data',
				'bookbrainz.edition_group_header',
				'bookbrainz.edition_group_revision'
			]);
		});
		it('should return the associated Author Credits for an Author',
			async function () {
				const author = await new Author({bbid: aBBID}).fetch({withRelated: 'authorCredits.names'});
				const AC = await author.related('authorCredits');
				expect(AC).to.have.length.of(1);
				const firstAC = AC.first().toJSON();
				expect(firstAC.names).to.have.length.of(1);
				expect(firstAC.names[0].authorBBID).to.equal(aBBID);
				expect(firstAC.names[0].name).to.equal('John Fnord');
			});
		it('should return the associated Editions using creditedEditions method',
			async function () {
				/** Create the Edition entity that uses the AuthorCredit */
				await new Revision({...revisionAttribs, id: revisionAttribs.id++})
					.save(null, {method: 'insert'});
				await new Entity({bbid: entityBBID, type: 'Edition'})
					.save(null, {method: 'insert'});
				await new Edition(entityAtribs)
					.save(null, {method: 'insert'});

				const author = await new Author({bbid: aBBID}).fetch();
				const creditedEditions = await author.creditedEditions();
				expect(creditedEditions).to.have.length.of(1);
				expect(creditedEditions[0].bbid).to.equal(entityBBID);
				expect(creditedEditions[0].name).to.equal('FNORD');
			});
		it('should return the associated Edition Groups using creditedEditionGroups method',
			async function () {
				/** Create the Edition Group entity that uses the AuthorCredit */
				const anotherBBID = faker.random.uuid();
				await new Revision({...revisionAttribs, id: revisionAttribs.id++})
					.save(null, {method: 'insert'});
				await new Entity({bbid: anotherBBID, type: 'EditionGroup'})
					.save(null, {method: 'insert'});
				await new EditionGroup({...entityAtribs, bbid: anotherBBID})
					.save(null, {method: 'insert'});

				const author = await new Author({bbid: aBBID}).fetch();
				const creditedEditionGroups = await author.creditedEditionGroups();
				expect(creditedEditionGroups).to.have.length.of(1);
				expect(creditedEditionGroups[0].bbid).to.equal(anotherBBID);
				expect(creditedEditionGroups[0].name).to.equal('FNORD');
			});
	});
});
