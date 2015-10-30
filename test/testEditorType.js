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
const util = require('../util');

const orm = require('./bookshelf');
const Bookshelf = orm.bookshelf;

const EditorType = orm.EditorType;

describe('EditorType model', function() {
	afterEach(function() {
		return Bookshelf.knex.raw('TRUNCATE bookbrainz.editor_type CASCADE');
	});

	it('should return a JSON object with correct keys when saved', function() {
		const editorTypeCreationPromise = new EditorType({label: 'test_type'})
		.save()
		.then((model) => model.refresh().then(util.fetchJSON));

		return expect(editorTypeCreationPromise).to.eventually.have.all.keys([
			'id', 'label'
		]);
	});
});
