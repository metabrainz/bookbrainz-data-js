/*
 * Copyright (C) 2022  Shivam Awasthi
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
import {loadAuthorNames} from '../../lib/func/work';
import {truncateTables} from '../../lib/util';


chai.use(chaiAsPromised);
const {expect} = chai;
const {
	AliasSet, Editor, EditorType, Entity, Gender, RelationshipType, Author, Relationship, Alias,
	RelationshipSet, Revision, Work, bookshelf, Language, RelationshipAttribute, RelationshipAttributeSet,
	RelationshipAttributeTextValue, RelationshipAttributeType
} = bookbrainzData;

const editorData = {
	genderId: 1,
	id: 1,
	name: 'bob',
	typeId: 1
};

const genderData = {
	id: 1,
	name: 'test'
};
const editorTypeData = {
	id: 1,
	label: 'test_type'
};

const setData = {id: 1};
const authorAliasSet = {
	defaultAliasId: 1,
	id: 2
};

const workBBID = faker.random.uuid();
const authorBBID = faker.random.uuid();

const aliasAttribs = {
	id: 1,
	languageId: 1,
	name: 'John Doe',
	primary: true,
	sortName: 'Doe, John'
};

const authorAttribs = {
	aliasSetId: 2,
	bbid: authorBBID,
	revisionId: 2
};


const relationshipTypeData = {
	description: 'test descryption',
	id: 8,
	label: 'test label',
	linkPhrase: 'test phrase',
	reverseLinkPhrase: 'test reverse link phrase',
	sourceEntityType: 'Author',
	targetEntityType: 'Work'
};

const revisionAttribs = {
	authorId: 1,
	id: 1
};
const revisionAttribs2 = {
	authorId: 1,
	id: 2
};
const workAttribs = {
	aliasSetId: 1,
	bbid: workBBID,
	relationshipSetId: 1,
	revisionId: 1
};
const languageAttribs = {
	frequency: 1,
	id: 1,
	isoCode1: 'en',
	isoCode2b: 'eng',
	isoCode2t: 'eng',
	isoCode3: 'eng',
	name: 'English'
};
const relAttribTypeAttribs = {
	name: 'test name',
	root: 1
};

async function createWork() {
	await new Gender(genderData).save(null, {method: 'insert'});
	await new EditorType(editorTypeData).save(null, {method: 'insert'});
	await new Editor(editorData).save(null, {method: 'insert'});
	await new AliasSet(setData).save(null, {method: 'insert'});
	const relSetOfWork = await new RelationshipSet(setData).save(null, {method: 'insert'});
	await new Entity({bbid: workBBID, type: 'Work'}).save(null, {method: 'insert'});
	await new Revision(revisionAttribs).save(null, {method: 'insert'});
	await new Work(workAttribs).save(null, {method: 'insert'});
	return relSetOfWork;
}

async function createRelationshipAttributeSet() {
	const attributeType = await new RelationshipAttributeType(relAttribTypeAttribs)
		.save(null, {method: 'insert'});
	const attribute = await new RelationshipAttribute({attributeType: attributeType.get('id')})
		.save(null, {method: 'insert'});
	await new RelationshipAttributeTextValue({attributeId: attribute.get('id'), textValue: 'test value'})
		.save(null, {method: 'insert'});
	const relationshipAttributeSet = await new RelationshipAttributeSet()
		.save(null, {method: 'insert'});
	await relationshipAttributeSet.relationshipAttributes().attach(attribute);
	return relationshipAttributeSet.get('id');
}

async function createAuthorAndRelationshipSet(attributeSetId, relSetOfWork) {
	await new Entity({bbid: authorBBID, type: 'Author'}).save(null, {method: 'insert'});
	await new Revision(revisionAttribs2).save(null, {method: 'insert'});
	await new Author(authorAttribs).save(null, {method: 'insert'});
	const relationshipType = await new RelationshipType(relationshipTypeData).save(null, {method: 'insert'});
	const relationshipData = {
		attributeSetId,
		sourceBbid: authorBBID,
		targetBbid: workBBID,
		typeId: relationshipType.id
	};
	const relationship = await new Relationship(relationshipData).save(null, {method: 'insert'});
	await relSetOfWork.relationships().attach(relationship);
}

describe('loadAuthorNames', () => {
	before(
		async () => {
			const relSetOfWork = await createWork();
			await new Language(languageAttribs).save(null, {method: 'insert'});
			await new Alias(aliasAttribs).save(null, {method: 'insert'});
			await new AliasSet(authorAliasSet).save(null, {method: 'insert'});
			const attributeSetId = await createRelationshipAttributeSet();
			await createAuthorAndRelationshipSet(attributeSetId, relSetOfWork);
		}
	);

	after(function truncate() {
		this.timeout(0); // eslint-disable-line @typescript-eslint/no-invalid-this
		return truncateTables(bookshelf, [
			'bookbrainz.alias',
			'bookbrainz.relationship',
			'bookbrainz.relationship_set',
			'bookbrainz.alias_set',
			'bookbrainz.author_revision',
			'bookbrainz.author_header',
			'bookbrainz.author_data',
			'bookbrainz.work_revision',
			'bookbrainz.work_header',
			'bookbrainz.work_data',
			'bookbrainz.revision',
			'bookbrainz.entity',
			'bookbrainz.editor',
			'bookbrainz.editor_type',
			'musicbrainz.gender',
			'musicbrainz.language',
			'bookbrainz.relationship_attribute_set',
			'bookbrainz.relationship_attribute',
			'bookbrainz.relationship_attribute_type'
		]);
	});

	it('should return an empty array if the list of workBBIDs is empty', async () => {
		const authorsData = await loadAuthorNames(bookbrainzData, []);
		expect(authorsData).to.be.an('array').that.is.empty;
	});

	it('should return an array of objects with appropriate keys when the list of workBBIDs is not empty', async () => {
		const authorsData = await loadAuthorNames(bookbrainzData, [workBBID]);
		expect(authorsData).to.be.an('array');
		expect(authorsData[0]).to.have.all.keys('authoralias', 'authorbbid', 'workbbid');
		expect(authorsData[0].authoralias).to.equal(aliasAttribs.name);
	});
});
