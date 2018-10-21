/*
 * Copyright (C) 2018  Ben Ockmore
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
import _ from 'lodash';
import bookbrainzData from '../bookshelf';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import faker from 'faker';
import {truncateTables} from '../../lib/util';


chai.use(chaiAsPromised);
const {expect} = chai;
const {updateRelationshipSets} = bookbrainzData.func.relationship;
const {
	RelationshipType, Entity, Gender, EditorType, Revision, Annotation, Work,
	Editor, AliasSet, IdentifierSet, RelationshipSet, Disambiguation, bookshelf
} = bookbrainzData;

const aBBID = faker.random.uuid();
const bBBID = faker.random.uuid();
const cBBID = faker.random.uuid();
const dBBID = faker.random.uuid();

function getRelationshipData(typeId, sourceBbid, targetBbid) {
	return {
		sourceBbid,
		targetBbid,
		typeId
	};
}

function getEntityData(bbid) {
	return {
		bbid,
		type: faker.random.arrayElement([
			'Creator', 'Edition', 'Publication', 'Publisher', 'Work'
		])
	};
}

function getRelationshipTypeData(id) {
	return {
		description: faker.random.words(10),
		id,
		label: faker.random.alphaNumeric(40),
		linkPhrase: faker.random.words(3),
		reverseLinkPhrase: faker.random.words(3),
		sourceEntityType: faker.random.arrayElement([
			'Creator', 'Edition', 'Publication', 'Publisher', 'Work'
		]),
		targetEntityType: faker.random.arrayElement([
			'Creator', 'Edition', 'Publication', 'Publisher', 'Work'
		])
	};
}

let lastRevisionID = 1;
let lastAnnotationID = 1;
async function makeEntity(bbid) {
	const revisionId = lastRevisionID++;
	const annotationId = lastAnnotationID++;
	const revisionAttribs = {
		authorId: 1,
		id: revisionId
	};

	const workAttribs = {
		aliasSetId: 1,
		annotationId,
		bbid,
		disambiguationId: null,
		identifierSetId: null,
		relationshipSetId: null,
		revisionId
	};

	await new Revision(revisionAttribs)
		.save(null, {method: 'insert'});

	await new Annotation({
		content: 'Test Annotation',
		id: annotationId,
		lastRevisionId: revisionId
	})
		.save(null, {method: 'insert'});

	await new Entity({bbid, type: 'Work'}).save(null, {method: 'insert'});

	const entity = await new Work(workAttribs).save(null, {method: 'insert'});

	const refreshedEntity = await entity.refresh({
		withRelated: [
			'relationshipSet', 'aliasSet', 'identifierSet',
			'annotation', 'disambiguation'
		]
	});

	return refreshedEntity.toJSON();
}

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

describe('updateRelationshipSet', () => {
	before(async function () {
		await Promise.all([
			new Gender(genderData).save(null, {method: 'insert'}),
			new EditorType(editorTypeData).save(null, {method: 'insert'})
		]);

		await new Editor(editorAttribs).save(null, {method: 'insert'});

		return Promise.all([
			new RelationshipType(getRelationshipTypeData(1))
				.save(null, {method: 'insert'}),
			new AliasSet(setData)
				.save(null, {method: 'insert'})
		]);
	});

	after(function () {
		return truncateTables(bookshelf, [
			'bookbrainz.relationship_type',
			'bookbrainz.alias_set',
			'bookbrainz.editor',
			'bookbrainz.editor_type',
			'musicbrainz.gender'
		]);
	});

	beforeEach(function () {
		return Promise.all([
			makeEntity(aBBID),
			makeEntity(bBBID),
			makeEntity(cBBID),
			makeEntity(dBBID)
		]);
	});

	afterEach(function () {
		return truncateTables(bookshelf, [
			'bookbrainz.relationship',
			'bookbrainz.work_data',
			'bookbrainz.entity',
			'bookbrainz.revision',
			'bookbrainz.annotation',
			'bookbrainz.relationship_set'
		]);
	});

	/* eslint-disable-next-line max-len */
	it('should return an empty object if all null/empty sets are passed', async function () {
		const result = await bookshelf.transaction(
			(trx) => updateRelationshipSets(
				bookbrainzData, trx, null, []
			)
		);

		expect(result).to.be.empty;
	});


	/* eslint-disable-next-line max-len */
	it('should return an object with two entries if one relationship is added to an empty set', async function () {
		const relationshipData = getRelationshipData(1, aBBID, bBBID);

		const result = await bookshelf.transaction(async (trx) => {
			const sets = await updateRelationshipSets(
				bookbrainzData, trx, null, [relationshipData]
			);

			return Promise.props(
				_.transform(sets, (acc, set, bbid) => {
					acc[bbid] = set.refresh({
						transacting: trx, withRelated: 'relationships'
					});
				}, {})
			);
		});

		expect(result).to.be.an('object').that.has.all.keys(aBBID, bBBID);
		expect(result[aBBID].related('relationships').toJSON()[0])
			.to.be.an('object').to.include(relationshipData);
		expect(result[bBBID].related('relationships').toJSON()[0])
			.to.be.an('object').to.include(relationshipData);
	});

	/* eslint-disable-next-line max-len */
	it('should return a new set if changes are made to the relationships in the set', async function () {
		const firstRelationshipData = getRelationshipData(1, aBBID, bBBID);
		const secondRelationshipData = getRelationshipData(1, aBBID, cBBID);

		const firstResult = await bookshelf.transaction(async (trx) => {
			const sets = await updateRelationshipSets(
				bookbrainzData, trx, null,
				[firstRelationshipData, secondRelationshipData]
			);

			const updatedEntitiesPromise = Promise.all(
				_.map(sets, async (set, bbid) => {
					const revision = await new Revision({authorId: 1})
						.save(null, {transacting: trx});
					return new Work({
						bbid,
						relationshipSetId: set.get('id'),
						revisionId: revision.get('id')
					})
						.save(null, {transacting: trx});
				})
			);

			const refreshedSetsPromise = Promise.props(
				_.transform(sets, (acc, set, bbid) => {
					acc[bbid] = set.refresh({
						transacting: trx, withRelated: 'relationships'
					});
				}, {})
			);

			return Promise.join(refreshedSetsPromise, updatedEntitiesPromise,
				(refreshedSets) => refreshedSets);
		});

		const firstSet = firstResult[aBBID];
		const firstSetRelationships = firstSet.related('relationships').toJSON()
			.map((relationship) =>
				_.pick(relationship, ['typeId', 'sourceBbid', 'targetBbid']));

		firstSetRelationships[1].targetBbid = dBBID;
		const thirdRelationshipData = firstSetRelationships[1];

		const result = await bookshelf.transaction(async (trx) => {
			const sets = await updateRelationshipSets(
				bookbrainzData, trx, firstSet, firstSetRelationships
			);

			return Promise.props(
				_.transform(sets, (acc, set, bbid) => {
					acc[bbid] = set && set.refresh({
						transacting: trx, withRelated: 'relationships'
					});
				}, {})
			);
		});

		expect(result)
			.to.be.an('object').that.has.all.keys(aBBID, cBBID, dBBID);
		expect(result[aBBID].related('relationships').toJSON()[0])
			.to.be.an('object').to.include(firstRelationshipData);
		expect(result[aBBID].related('relationships').toJSON()[1])
			.to.be.an('object').to.include(thirdRelationshipData);
		expect(result[cBBID]).to.be.null;
		expect(result[dBBID].related('relationships').toJSON()[0])
			.to.be.an('object').to.include(thirdRelationshipData);
	});

	it('should return the old set if no changes are made', async function () {
		const firstRelationshipData = getRelationshipData(1, aBBID, bBBID);
		const secondRelationshipData = getRelationshipData(1, aBBID, cBBID);

		const firstResult = await bookshelf.transaction(async (trx) => {
			const sets = await updateRelationshipSets(
				bookbrainzData, trx, null,
				[firstRelationshipData, secondRelationshipData]
			);

			const updatedEntitiesPromise = Promise.all(
				_.map(sets, async (set, bbid) => {
					const revision = await new Revision({authorId: 1})
						.save(null, {transacting: trx});
					return new Work({
						bbid,
						relationshipSetId: set.get('id'),
						revisionId: revision.get('id')
					})
						.save(null, {transacting: trx});
				})
			);

			const refreshedSetsPromise = Promise.props(
				_.transform(sets, (acc, set, bbid) => {
					acc[bbid] = set.refresh({
						transacting: trx, withRelated: 'relationships'
					});
				}, {})
			);

			return Promise.join(refreshedSetsPromise, updatedEntitiesPromise,
				(refreshedSets) => refreshedSets);
		});

		const firstSet = firstResult[aBBID];
		const firstSetRelationships = firstSet.related('relationships').toJSON()
			.map((relationship) =>
				_.pick(relationship, ['typeId', 'sourceBbid', 'targetBbid']));

		const result = await bookshelf.transaction(async (trx) => {
			const sets = await updateRelationshipSets(
				bookbrainzData, trx, firstSet, firstSetRelationships
			);

			return Promise.props(
				_.transform(sets, (acc, set, bbid) => {
					acc[bbid] = set && set.refresh({
						transacting: trx, withRelated: 'relationships'
					});
				}, {})
			);
		});

		expect(result).to.be.empty;
	});
});
