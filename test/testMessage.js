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

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;
var Promise = require('bluebird');
var util = require('../util');

var Bookshelf = require('./bookshelf').bookshelf;
var orm = require('./bookshelf').orm;
var Editor = orm.Editor;
var EditorType = orm.EditorType;
var Gender = orm.Gender;
var Message = orm.Message;

chai.use(chaiAsPromised);

var genderAttribs = {id: 1, name: 'test'};
var editorTypeAttribs = {id: 1, label: 'test_type'};
var editorAttribs = {
	id: 1, name: 'bob', email: 'bob@test.org', password: 'test', countryId: 1,
	genderId:1, editorTypeId: 1
};

describe('Message model', function() {
	beforeEach(function createRelations() {
		return Promise.all([
			new Gender(genderAttribs).save(null, {method: 'insert'}),
			new EditorType(editorTypeAttribs).save(null, {method: 'insert'}),
			new Editor(editorAttribs).save(null, {method: 'insert'})
		]);
	});

	afterEach(function destroyData() {
		return Promise.all([
			Bookshelf.knex.raw('TRUNCATE bookbrainz.editor CASCADE'),
			Bookshelf.knex.raw('TRUNCATE bookbrainz.editor_type CASCADE'),
			Bookshelf.knex.raw('TRUNCATE musicbrainz.gender CASCADE'),
			Bookshelf.knex.raw('TRUNCATE bookbrainz.message CASCADE')
		]);
	});

	it('should return a JSON object with correct keys when saved', function() {
		var messagePromise = new Message({
			senderId: 1, subject: 'test', content: 'test'
		}).save()
		.then(function(model) {
			return model.refresh({withRelated: ['sender']})
			.then(util.fetchJSON);
		});

		return expect(messagePromise).to.eventually.have.all.keys([
			'id', 'sender', 'senderId', 'content', 'subject'
		]);
	});

	it('should include a filled out sender relation if requested', function() {
		var messageData = {senderId: 1, subject: 'test', content: 'test'};
		var messagePromise = new Message(messageData).save()
		.then(function(model) {
			return model.refresh({withRelated: ['sender']});
		})
		.then(function(model) {
			return model.toJSON().sender;
		});

		return expect(messagePromise).to.eventually.have.any.keys([
			'id', 'name', 'email'
		]);
	});
});

describe('Message collection', function() {
	beforeEach(function() {
		return Promise.all([
			new Gender(genderAttribs).save(null, {method: 'insert'}),
			new EditorType(editorTypeAttribs).save(null, {method: 'insert'}),
			new Editor(editorAttribs).save(null, {method: 'insert'})
		]);
	});

	afterEach(function() {
		return Promise.all([
			Bookshelf.knex.raw('TRUNCATE bookbrainz.editor CASCADE'),
			Bookshelf.knex.raw('TRUNCATE bookbrainz.editor_type CASCADE'),
			Bookshelf.knex.raw('TRUNCATE musicbrainz.gender CASCADE'),
			Bookshelf.knex.raw('TRUNCATE bookbrainz.message CASCADE')
		]);
	});

	it('should include a filled out sender relation if requested', function() {
		var messagePromise = new Message({
			senderId: 1, subject: 'test', content: 'test'
		}).save()
		.then(function() {
			return new Message().fetchAll({withRelated: ['sender']});
		})
		.then(function(collection) {
			return collection.toJSON()[0].sender;
		});

		return expect(messagePromise).to.eventually.have.any.keys([
			'id', 'name', 'email'
		]);
	});
});
