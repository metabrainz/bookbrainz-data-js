/*
 * Copyright (C) 2016  Max Prettyjohns
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
	AliasSet, Annotation, Disambiguation, Editor, EditorEntityVisits,
	EditorType, Gender, IdentifierSet, Publisher, RelationshipSet, Revision,
	bookshelf
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
const setData = {id: 1};
const revisionAttribs = {
	authorId: 1,
	id: 1
};
const publisherAttribs = {
	aliasSetId: 1,
	annotationId: 1,
	disambiguationId: 1,
	identifierSetId: 1,
	relationshipSetId: 1,
	revisionId: 1
};

describe('EditorEntityVisits model', () => {
	beforeEach(() =>
		new Gender(genderData).save(null, {method: 'insert'})
			.then(() =>
				new EditorType(editorTypeData).save(null, {method: 'insert'})
			)
			.then(() =>
				new Editor(editorData).save(null, {method: 'insert'})
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
			.then(() =>
				new Revision(revisionAttribs).save(null, {method: 'insert'})
			)
			.then(() =>
				new Annotation({
					content: 'Test Annotation',
					id: 1,
					lastRevisionId: 1
				})
					.save(null, {method: 'insert'}))
			.then(() =>
				new Publisher(publisherAttribs)
					.save(null, {method: 'insert'})
			)
	);

	afterEach(function truncate() {
		this.timeout(0); // eslint-disable-line babel/no-invalid-this

		return truncateTables(bookshelf, [
			'bookbrainz._editor_entity_visits',
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
		const publisherPromise = new Publisher(publisherAttribs)
			.save(null, {method: 'insert'});

		const editorVisitsPromise = publisherPromise
			.then((publisher) =>
				new EditorEntityVisits({
					bbid: publisher.attributes.bbid,
					editorId: editorData.id,
					id: 1
				})
					.save(null, {method: 'insert'})
			);

		const jsonPromise = editorVisitsPromise
			.then((model) => model.refresh())
			.then((editorVisit) =>
				editorVisit.toJSON()
			);

		return expect(jsonPromise).to.eventually.have.all.keys([
			'id', 'editorId', 'bbid'
		]);
	});
});
