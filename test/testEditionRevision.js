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
import {truncateTables} from '../lib/util';

chai.use(chaiAsPromised);
const {expect} = chai;
const {
	AliasSet, Annotation, Disambiguation, Edition, EditionRevision, Editor,
	EditorType, Gender, IdentifierSet, RelationshipSet, Revision, bookshelf
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
	edition: {
		aliasSetId: 1,
		annotationId: 1,
		bbid: 'de305d54-75b4-431b-adb2-eb6b9e546014',
		disambiguationId: 1,
		identifierSetId: 1,
		relationshipSetId: 1,
		revisionId: 1
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
	revision: {
		authorId: 1,
		id: 1
	},
	set: {id: 1}
};

describe('EditionRevision model', () => {
	beforeEach(() =>
		new Gender(data.gender)
			.save(null, {method: 'insert'})
			.then(() =>
				new EditorType(data.editorType).save(null, {method: 'insert'})
			)
			.then(() =>
				new Editor(data.editor).save(null, {method: 'insert'})
			)
			.then(() =>
				Promise.all([
					new AliasSet(data.set).save(null, {method: 'insert'}),
					new IdentifierSet(data.set).save(null, {method: 'insert'}),
					new RelationshipSet(data.set)
						.save(null, {method: 'insert'}),
					new Disambiguation(data.disambiguation)
						.save(null, {method: 'insert'})
				])
			)
			.then(() =>
				new Revision(data.revision).save(null, {method: 'insert'})
			)
			.then(() =>
				new Annotation(data.annotation).save(null, {method: 'insert'})
			)
			.then(() =>
				new Edition(data.edition).save(null, {method: 'insert'})
			)
	);

	afterEach(function truncate() {
		this.timeout(0);

		return truncateTables(bookshelf, [
			'bookbrainz.annotation',
			'bookbrainz.disambiguation',
			'bookbrainz.alias',
			'bookbrainz.identifier',
			'bookbrainz.relationship',
			'bookbrainz.relationship_set',
			'bookbrainz.identifier_set',
			'bookbrainz.alias_set',
			'bookbrainz.edition_revision',
			'bookbrainz.edition_header',
			'bookbrainz.edition_data',
			'bookbrainz.revision',
			'bookbrainz.editor',
			'bookbrainz.editor_type',
			'musicbrainz.gender'
		]);
	});

	it('should return a JSON object with correct keys when saved', () => {
		const relatedToLoad = ['revision', 'entity', 'data'];
		const revisionPromise = new EditionRevision({id: 1})
			.fetch({withRelated: relatedToLoad})
			.then((revision) => revision.toJSON());

		return expect(revisionPromise).to.eventually.have.all.keys([
			'id', 'revision', 'entity', 'data', 'bbid', 'dataId'
		]);
	});
});
