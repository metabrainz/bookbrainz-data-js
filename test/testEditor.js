/*
 * Copyright (C) 2015  Ben Ockmore
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

'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

const _ = require('lodash');

const util = require('../lib/util');
const Bookshelf = require('./bookshelf');
const Editor = require('../lib/index').Editor;
const EditorType = require('../lib/index').EditorType;
const Gender = require('../lib/index').Gender;
const Revision = require('../lib/index').Revision;

const genderAttribs = {
	id: 1,
	name: 'test'
};

const editorTypeAttribs = {
	id: 1,
	label: 'test_type'
};

const editorAttribs = {
	genderId: 1,
	id: 1,
	name: 'bob',
	typeId: 1
};

const editorAttribsWithOptional = _.assign(_.clone(editorAttribs), {
	// countryId: 1,
	genderId: 1
});

describe('Editor model', () => {
	beforeEach(() =>
		new Gender(genderAttribs).save(null, {method: 'insert'})
			.then(() =>
				new EditorType(editorTypeAttribs).save(null, {method: 'insert'})
			)
	);

	afterEach(function truncate() {
		this.timeout(0);

		return util.truncateTables(Bookshelf, [
			'bookbrainz.revision',
			'bookbrainz.editor',
			'bookbrainz.editor_type',
			'musicbrainz.gender'
		]);
	});

	it('should return a JSON object with correct keys when saved', () => {
		const editorPromise = new Editor(editorAttribsWithOptional)
			.save(null, {method: 'insert'})
			.then(() => {
				const revisionAttribs = {
					authorId: 1,
					id: 1
				};

				return new Revision(revisionAttribs)
					.save(null, {method: 'insert'});
			})
			.then(() =>
				new Editor({id: 1})
					.fetch({
						withRelated: [
							'type',
							'gender',
							'revisions'
						]
					})
			)
			.then((editor) => editor.toJSON());

		return expect(editorPromise).to.eventually.have.all.keys([
			'id', 'name', 'reputation', 'bio', 'birthDate',
			'createdAt', 'activeAt', 'typeId', 'gender', 'genderId',
			'areaId', 'revisionsApplied', 'revisionsReverted',
			'totalRevisions', 'type', 'revisions', 'titleUnlockId',
			'metabrainzUserId', 'cachedMetabrainzName'
		]);
	});
});
