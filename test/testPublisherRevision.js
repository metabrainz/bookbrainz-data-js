/*
 * Copyright (C) 2021 Akash Gupta
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
import {truncateTables} from '../lib/util';


const {expect} = chai;
const {
	AliasSet, Annotation, Disambiguation, Publisher, PublisherRevision, Editor,
	Entity, EditorType, Gender, IdentifierSet, RelationshipSet, Revision,
	bookshelf
} = bookbrainzData;

const data = {
	annotation: {
		content: 'Test Annotation',
		id: 1,
		lastRevisionId: 1
	},
	disambiguation: {
		comment: 'Test Disambiguation',
		id: 1
	},
	editor: {
		genderId: 1,
		id: 1,
		name: 'bob',
		typeId: 1
	},
	editorType: {
		id: 1,
		label: 'test_type'
	},
	gender: {
		id: 1,
		name: 'test'
	},
	publisher: {
		aliasSetId: 1,
		annotationId: 1,
		bbid: '8877c2b2-aeda-11eb-8529-0242ac130003',
		disambiguationId: 1,
		identifierSetId: 1,
		relationshipSetId: 1,
		revisionId: 1
	},
	revision: {
		authorId: 1,
		id: 1
	},
	set: {id: 1}
};

describe('PublisherRevision model', () => {
	beforeEach(
		async () => {
			await new Gender(data.gender)
				.save(null, {method: 'insert'});
			await new EditorType(data.editorType)
				.save(null, {method: 'insert'});
			await new Editor(data.editor)
				.save(null, {method: 'insert'});
			await new AliasSet(data.set)
				.save(null, {method: 'insert'});
			await new IdentifierSet(data.set)
				.save(null, {method: 'insert'});
			await new RelationshipSet(data.set)
				.save(null, {method: 'insert'});
			await new Disambiguation(data.disambiguation)
				.save(null, {method: 'insert'});
			await new Entity({
				bbid: '8877c2b2-aeda-11eb-8529-0242ac130003',
				type: 'Publisher'
			})
				.save(null, {method: 'insert'});
			await new Revision(data.revision)
				.save(null, {method: 'insert'});
			await new Annotation(data.annotation)
				.save(null, {method: 'insert'});
			await new Publisher(data.publisher)
				.save(null, {method: 'insert'});
		}
	);

	afterEach(function truncate() {
		this.timeout(0); // eslint-disable-line @typescript-eslint/no-invalid-this

		return truncateTables(bookshelf, [
			'bookbrainz.annotation',
			'bookbrainz.disambiguation',
			'bookbrainz.alias',
			'bookbrainz.entity',
			'bookbrainz.identifier',
			'bookbrainz.relationship',
			'bookbrainz.relationship_set',
			'bookbrainz.identifier_set',
			'bookbrainz.alias_set',
			'bookbrainz.publisher_revision',
			'bookbrainz.publisher_header',
			'bookbrainz.publisher_data',
			'bookbrainz.revision',
			'bookbrainz.editor',
			'bookbrainz.editor_type',
			'musicbrainz.gender'
		]);
	});

	it('should return a JSON object with correct keys when saved', async () => {
		const relatedToLoad = ['revision', 'entity', 'data'];
		const revision = await new PublisherRevision({id: 1}).fetch({withRelated: relatedToLoad});
		const revisionJSON = revision.toJSON();

		return expect(revisionJSON).to.have.all.keys([
			'id', 'revision', 'entity', 'data', 'bbid', 'dataId', 'isMerge'
		]);
	});
});
