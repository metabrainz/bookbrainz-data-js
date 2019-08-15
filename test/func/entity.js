/* eslint-disable camelcase */
/*
 * Copyright (C) 2019  Nicolas Pelletier
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

import bookbrainzData from '../bookshelf';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import faker from 'faker';
import {truncateTables} from '../../lib/util';


chai.use(chaiAsPromised);
const {expect} = chai;
const {recursivelyGetRedirectBBID, getEntity} = bookbrainzData.func.entity;
const {Entity, AliasSet, RelationshipSet, IdentifierSet,
	Author, Disambiguation, Gender, Editor, EditorType,
	Revision, Annotation, bookshelf} = bookbrainzData;

const aBBID = faker.random.uuid();
const bBBID = faker.random.uuid();
const cBBID = faker.random.uuid();
const dBBID = faker.random.uuid();
const eBBID = faker.random.uuid();

describe('recursivelyGetRedirectBBID', () => {
	before(
		async () => {
			await new Entity({bbid: aBBID, type: 'Author'})
				.save(null, {method: 'insert'});
			await new Entity({bbid: bBBID, type: 'Author'})
				.save(null, {method: 'insert'});
			await new Entity({bbid: cBBID, type: 'Author'})
				.save(null, {method: 'insert'});
			await new Entity({bbid: dBBID, type: 'Author'})
				.save(null, {method: 'insert'});
			await new Entity({bbid: eBBID, type: 'Author'})
				.save(null, {method: 'insert'});
			// Redirect aBBID -> bBBID  and cBBID -> dBBID -> eBBID
			await bookshelf.knex('bookbrainz.entity_redirect').insert([
				{source_bbid: aBBID, target_bbid: bBBID},
				{source_bbid: cBBID, target_bbid: dBBID},
				{source_bbid: dBBID, target_bbid: eBBID}
			]);
		}
	);

	after(function truncate() {
		this.timeout(0); // eslint-disable-line babel/no-invalid-this
		return truncateTables(bookshelf, [
			'bookbrainz.entity_redirect',
			'bookbrainz.entity'
		]);
	});

	it('should return a single-step redirected bbid', async function () {
		const redirectedBBID = await recursivelyGetRedirectBBID(bookbrainzData, aBBID);
		expect(redirectedBBID).to.equal(bBBID);
	});

	it('should return a multiple-step redirected bbid', async function () {
		const redirectedBBID = await recursivelyGetRedirectBBID(bookbrainzData, cBBID);
		expect(redirectedBBID).to.equal(eBBID);
	});
});

describe('getEntity', () => {
	async function createAuthorWithData(index, bbid) {
		const editorAttribs = {
			genderId: 1,
			id: index,
			name: `Fnord ${index}`,
			typeId: 1
		};
		const revisionAttribs = {
			authorId: index,
			id: index
		};
		const authorAttribs = {
			aliasSetId: index,
			annotationId: index,
			bbid,
			disambiguationId: index,
			identifierSetId: index,
			relationshipSetId: index,
			revisionId: index
		};
		new AliasSet({id: index})
			.save(null, {method: 'insert'});
		new IdentifierSet({id: index})
			.save(null, {method: 'insert'});
		new RelationshipSet({id: index})
			.save(null, {method: 'insert'});
		await new Disambiguation({comment: `Test Disambiguation ${index}`,
			id: index})
			.save(null, {method: 'insert'});
		await new Editor(editorAttribs).save(null, {method: 'insert'});
		await new Revision(revisionAttribs)
			.save(null, {method: 'insert'});
		await new Annotation({
			content: `Test Annotation ${index}`,
			id: index,
			lastRevisionId: index
		})
			.save(null, {method: 'insert'});
		await new Entity({bbid, type: 'Author'})
			.save(null, {method: 'insert'});
		await new Author(authorAttribs).save(null, {method: 'insert'});
	}

	before(
		async () => {
			const genderData = {
				id: 1,
				name: 'test'
			};
			const editorTypeData = {
				id: 1,
				label: 'test_type'
			};
			await Promise.all([
				new Gender(genderData).save(null, {method: 'insert'}),
				new EditorType(editorTypeData).save(null, {method: 'insert'})
			]);

			await createAuthorWithData(1, aBBID);
			await createAuthorWithData(2, bBBID);
			await createAuthorWithData(3, cBBID);
			// Redirect bBBID -> cBBID
			await bookshelf.knex('bookbrainz.entity_redirect')
				.insert({source_bbid: bBBID, target_bbid: cBBID});
		}
	);

	after(function truncate() {
		this.timeout(0); // eslint-disable-line babel/no-invalid-this
		return truncateTables(bookshelf, [
			'bookbrainz.entity_redirect',
			'bookbrainz.entity',
			'bookbrainz.annotation',
			'bookbrainz.revision',
			'bookbrainz.author_header',
			'bookbrainz.editor',
			'bookbrainz.disambiguation',
			'bookbrainz.editor_type',
			'bookbrainz.relationship_set',
			'bookbrainz.identifier_set',
			'bookbrainz.alias_set',
			'musicbrainz.gender'
		]);
	});

	it('should return an entity', async function () {
		const entityJSON = await getEntity(bookbrainzData, 'Author', aBBID);
		expect(entityJSON).to.have.all.keys([
			'aliasSetId', 'annotationId', 'areaId',
			'bbid', 'beginAreaId', 'beginDate', 'beginDay', 'beginMonth',
			'beginYear', 'dataId', 'defaultAliasId',
			'disambiguationId', 'endAreaId', 'endDate', 'endDay', 'endMonth',
			'endYear', 'ended', 'genderId', 'identifierSetId',
			'master', 'relationshipSetId', 'revisionId',
			'type', 'typeId'
		]);
		expect(entityJSON.bbid).to.equal(aBBID);
		expect(entityJSON.aliasSetId).to.equal(1);
		expect(entityJSON.annotationId).to.equal(1);
		expect(entityJSON.relationshipSetId).to.equal(1);
		expect(entityJSON.identifierSetId).to.equal(1);
		expect(entityJSON.revisionId).to.equal(1);
	});

	it('should return an entity with extra relations', async function () {
		const relations = ['aliasSet', 'annotation', 'disambiguation',
			'identifierSet', 'relationshipSet', 'revision'];
		const entityJSON = await getEntity(bookbrainzData, 'Author', aBBID, relations);
		expect(entityJSON).to.have.all.keys([
			'aliasSet', 'aliasSetId', 'annotation', 'annotationId', 'areaId',
			'bbid', 'beginAreaId', 'beginDate', 'beginDay', 'beginMonth',
			'beginYear', 'dataId', 'defaultAliasId', 'disambiguation',
			'disambiguationId', 'endAreaId', 'endDate', 'endDay', 'endMonth',
			'endYear', 'ended', 'genderId', 'identifierSet', 'identifierSetId',
			'master', 'relationshipSet', 'relationshipSetId', 'revision', 'revisionId',
			'type', 'typeId'
		]);
		expect(entityJSON.bbid).to.equal(aBBID);
		expect(entityJSON.aliasSetId).to.equal(1);
		expect(entityJSON.annotationId).to.equal(1);
		expect(entityJSON.relationshipSetId).to.equal(1);
		expect(entityJSON.identifierSetId).to.equal(1);
		expect(entityJSON.revisionId).to.equal(1);
	});

	it('should return the target entity for a redirected bbid', async function () {
		const redirectedEntityJSON = await getEntity(bookbrainzData, 'Author', bBBID);
		expect(redirectedEntityJSON.bbid).to.equal(cBBID);
		expect(redirectedEntityJSON.aliasSetId).to.equal(3);
		expect(redirectedEntityJSON.annotationId).to.equal(3);
		expect(redirectedEntityJSON.relationshipSetId).to.equal(3);
		expect(redirectedEntityJSON.identifierSetId).to.equal(3);
		expect(redirectedEntityJSON.revisionId).to.equal(3);
	});
});
