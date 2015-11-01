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
const expect = chai.expect;
const Promise = require('bluebird');
const util = require('../util');

const orm = require('./bookshelf');
const Bookshelf = orm.bookshelf;

const Annotation = orm.Annotation;

chai.use(chaiAsPromised);

describe('Annotation model', function setupData() {
	afterEach(function destroyData() {
		return Promise.all([
			Bookshelf.knex.raw('TRUNCATE bookbrainz.annotation CASCADE')
		]);
	});

	it('should return a JSON object with correct keys when saved', function() {
		const annotationAttribs = {
			content: 'Some Content'
		};

		const annotationPromise = new Annotation(annotationAttribs)
			.save(null, {method: 'insert'})
			.then((model) => model.refresh().then(util.fetchJSON));

		return expect(annotationPromise).to.eventually.have.all.keys([
			'id', 'content', 'createdAt'
		]);
	});
});
