import Promise from 'bluebird';
import bookbrainzData from './bookshelf';
import chai from 'chai';
import faker from 'faker';
import {truncateTables} from '../lib/util';


const {expect} = chai;
const {
	Editor, EditorType, Entity,
	Gender, UserCollection, UserCollectionItem, bookshelf
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

const aBBID = faker.random.uuid();
const aBBID2 = faker.random.uuid();

describe('UserCollection model', () => {
	beforeEach(
		async () => {
			await new Gender(genderData).save(null, {method: 'insert'});
			await new EditorType(editorTypeData).save(null, {method: 'insert'});
			await new Editor(editorAttribs).save(null, {method: 'insert'});
			await new Entity({bbid: aBBID, type: 'Work'}).save(null, {method: 'insert'});
		}
	);

	afterEach(function truncate() {
		this.timeout(0); // eslint-disable-line babel/no-invalid-this

		return truncateTables(bookshelf, [
			'bookbrainz.entity',
			'bookbrainz.editor',
			'bookbrainz.editor_type',
			'musicbrainz.gender',
			'bookbrainz.user_collection',
			'bookbrainz.user_collection_item'
		]);
	});

	it('should return a JSON object without itemCount when saved and fetched without withItemCount flag', async () => {
		const userCollectionAttribs = {
			entityType: 'Work',
			id: aBBID2,
			name: 'Test Collection',
			ownerId: 1
		};
		const userCollectionItemAttribs = {
			bbid: aBBID,
			collectionId: aBBID2
		};

		const userCollectionPromise = await new UserCollection(userCollectionAttribs).save(null, {method: 'insert'});
		const userCollectionItem = await new UserCollectionItem(userCollectionItemAttribs).save(null, {method: 'insert'});

		const userCollection = await new UserCollection({id: aBBID2}).fetch({
			withRelated: ['owner']
		});

		const collection = userCollection.toJSON();

		return expect(collection).to.not.have.key([
			'itemCount'
		]);
	});

	it('should return a JSON object with itemCount when saved and fetched with withItemCount flag', async () => {
		const userCollectionAttribs = {
			entityType: 'Work',
			id: aBBID2,
			name: 'Test Collection',
			ownerId: 1
		};
		const userCollectionItemAttribs = {
			bbid: aBBID,
			collectionId: aBBID2
		};

		const userCollectionPromise = await new UserCollection(userCollectionAttribs).save(null, {method: 'insert'});
		const userCollectionItem = await new UserCollectionItem(userCollectionItemAttribs).save(null, {method: 'insert'});

		const userCollection = await new UserCollection({id: aBBID2}).fetch({
			withItemCount: true,
			withRelated: ['owner']
		});

		const collection = userCollection.toJSON();

		return expect(collection).to.have.all.keys([
			'createdAt', 'description', 'entityType', 'id', 'itemCount', 'lastModified', 'name', 'owner', 'ownerId', 'public'
		]);
	});
});
