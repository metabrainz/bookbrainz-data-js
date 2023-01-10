/*
 * Copyright (C) 2021  Akash Gupta
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
import faker from 'faker';
import {truncateTables} from '../lib/util';


const {expect} = chai;
const {
	AliasSet, Annotation, Disambiguation, Editor, EditorType, Entity, Gender,
	IdentifierSet, RelationshipSet, Revision, Series, SeriesOrderingType, UserCollection, UserCollectionItem, bookshelf
} = bookbrainzData;

const genderData = {
	id: 1,
	name: 'test'
};
const editorTypeData = {
	id: 1,
	label: 'test_type'
};
const editorData = {
	genderId: 1,
	id: 1,
	name: 'bob',
	typeId: 1
};
const orderTypeData = {
	id: 1,
	label: 'Manual'
};

const setData = {id: 1};

const aBBID = faker.random.uuid();
const aBBID2 = faker.random.uuid();

const seriesAttribs = {
	aliasSetId: 1,
	bbid: aBBID,
	entityType: 'Author',
	identifierSetId: 1,
	orderingTypeId: 1,
	relationshipSetId: 1,
	revisionId: 1
};

describe('Series model', () => {
	beforeEach(
		async () => {
			await new Gender(genderData)
				.save(null, {method: 'insert'});
			await new EditorType(editorTypeData)
				.save(null, {method: 'insert'});
			await new Editor(editorData)
				.save(null, {method: 'insert'});
			await new AliasSet(setData)
				.save(null, {method: 'insert'});
			await new IdentifierSet(setData)
				.save(null, {method: 'insert'});
			await new SeriesOrderingType(orderTypeData)
				.save(null, {method: 'insert'});
			await new RelationshipSet(setData)
				.save(null, {method: 'insert'});
			await new Disambiguation({
				comment: 'Test Disambiguation',
				id: 1
			})
				.save(null, {method: 'insert'});
			await new Entity({bbid: aBBID, type: 'Series'})
				.save(null, {method: 'insert'});
		}
	);

	afterEach(function truncate() {
		this.timeout(0); // eslint-disable-line @typescript-eslint/no-invalid-this

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
			'bookbrainz.series_ordering_type',
			'bookbrainz.user_collection',
			'bookbrainz.user_collection_item',
			'musicbrainz.gender'
		]);
	});

	it('should return a JSON object with correct keys when saved', async () => {
		const revisionAttribs = {
			authorId: 1,
			id: 1
		};
		const entityAttribs = {
			aliasSetId: 1,
			annotationId: 1,
			bbid: aBBID,
			disambiguationId: 1,
			entityType: 'Author',
			identifierSetId: 1,
			orderingTypeId: 1,
			relationshipSetId: 1,
			revisionId: 1
		};

		await new Revision(revisionAttribs)
			.save(null, {method: 'insert'});

		await new Annotation({
			content: 'Test Annotation',
			id: 1,
			lastRevisionId: 1
		})
			.save(null, {method: 'insert'});

		const model = await new Series(entityAttribs).save(null, {method: 'insert'});
		await model.refresh({
			withRelated: [
				'relationshipSet', 'aliasSet', 'identifierSet',
				'annotation', 'disambiguation', 'collections'
			]
		});
		const entity = model.toJSON();

		return expect(entity).to.have.all.keys([
			'aliasSet', 'aliasSetId', 'annotation', 'annotationId', 'bbid',
			'dataId', 'defaultAliasId', 'disambiguation', 'disambiguationId',
			'identifierSet', 'identifierSetId', 'master',
			'relationshipSet', 'relationshipSetId', 'revisionId', 'type',
			'entityType', 'orderingTypeId', 'collections', 'sortName', 'name'
		]);
	});

	it('should return the master revision when multiple revisions exist',
		async () => {
			/*
			 * Revision ID order is reversed so that result is not dependent on
			 * row order
			 */
			const revisionAttribs = {
				authorId: 1,
				id: 1
			};

			await new Revision(revisionAttribs)
				.save(null, {method: 'insert'});

			const model1 = await new Series(seriesAttribs).save(null, {method: 'insert'});
			await model1.refresh();
			const entity = model1.toJSON();

			revisionAttribs.id = 2;
			await new Revision(revisionAttribs)
				.save(null, {method: 'insert'});

			const entityUpdateAttribs = {
				bbid: entity.bbid,
				revisionId: 2
			};
			const model2 = await new Series(entityUpdateAttribs).save();
			const model3 = await new Series({bbid: model2.get('bbid')}).fetch();
			const entityJSON = model3.toJSON();

			expect(entityJSON)
				.to.have.property('revisionId', 2);
			expect(entityJSON)
				.to.have.property('master', true);
		});

	it('should return a JSON object with related collections', async () => {
		const userCollectionAttribs = {
			entityType: 'Series',
			id: aBBID2,
			name: 'Test Collection',
			ownerId: 1
		};
		const userCollectionItemAttribs = {
			bbid: aBBID,
			collectionId: aBBID2
		};
		const revisionAttribs = {
			authorId: 1,
			id: 1
		};

		await new Revision(revisionAttribs).save(null, {method: 'insert'});
		const model = await new Series(seriesAttribs).save(null, {method: 'insert'});
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
		const revisionAttribs = {
			authorId: 1,
			id: 1
		};

		await new Revision(revisionAttribs).save(null, {method: 'insert'});
		const model = await new Series(seriesAttribs).save(null, {method: 'insert'});
		await model.refresh({
			withRelated: ['collections']
		});
		const json = model.toJSON();
		const {collections} = json;

		// collections does not exist
		return expect(collections).to.be.empty;
	});

	it('should allow to update the series ordering type', async () => {
		const entityAttribs = {
			aliasSetId: 1,
			annotationId: 1,
			bbid: aBBID,
			disambiguationId: 1,
			entityType: 'Author',
			identifierSetId: 1,
			orderingTypeId: 1,
			relationshipSetId: 1,
			revisionId: 1
		};
		const revisionAttribs = {
			authorId: 1,
			id: 1
		};
		const orderTypeData1 = {
			id: 2,
			label: 'Automatic'
		};
		await new Revision(revisionAttribs).save(null, {method: 'insert'});
		await new Annotation({
			content: 'Test Annotation',
			id: 1,
			lastRevisionId: 1
		})
			.save(null, {method: 'insert'});
		await new SeriesOrderingType(orderTypeData1)
			.save(null, {method: 'insert'});

		const model = await new Series(entityAttribs).save(null, {method: 'insert'});
		await model.refresh({withRelated: ['seriesOrderingType']});
		const entity = model.toJSON();
		expect(entity.seriesOrderingType).to.deep.equal(orderTypeData);
		revisionAttribs.id = 2;
		await new Revision(revisionAttribs)
			.save(null, {method: 'insert'});

		// Modify the seriesOrderingType attribute.
		const model2 = await new Series({bbid: aBBID, orderingTypeId: 2, revisionId: 2}).save();
		const model3 = await new Series({bbid: model2.get('bbid')}).fetch({withRelated: ['seriesOrderingType']});

		const updatedEntity = model3.toJSON();
		expect(updatedEntity.seriesOrderingType).to.deep.equal(orderTypeData1);
	});
});
