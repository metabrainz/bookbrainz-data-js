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
var MessageReceipt = orm.MessageReceipt;

chai.use(chaiAsPromised);

describe('MessageReceipt model', function() {
	var editorTypeVars = {id: 1, label: 'test_type'};
	var editorVars = {
		id: 1, name: 'bob', email: 'bob@test.org', password: 'test',
		countryId: 1, genderId:1, editorTypeId: 1
	};
	var messageVars = {senderId: 1, subject: 'test', content: 'test'};
	beforeEach(function() {
		return Promise.all([
			new Gender({id: 1, name: 'test'}).save(null, {method: 'insert'}),
			new EditorType(editorTypeVars).save(null, {method: 'insert'}),
			new Editor(editorVars).save(null, {method: 'insert'}),
			new Message(messageVars).save(null, {method: 'insert'})
		]);
	});

	afterEach(function() {
		return Promise.all([
			Bookshelf.knex.raw('TRUNCATE bookbrainz.editor CASCADE'),
			Bookshelf.knex.raw('TRUNCATE bookbrainz.editor_type CASCADE'),
			Bookshelf.knex.raw('TRUNCATE musicbrainz.gender CASCADE'),
			Bookshelf.knex.raw('TRUNCATE bookbrainz.message CASCADE'),
			Bookshelf.knex.raw('TRUNCATE bookbrainz.message_receipt CASCADE')
		]);
	});

	it('should return a JSON object with correct keys when saved', function() {
		var msgReceiptVars = {messageId: 1, recipientId: 1};
		var msgReceiptPromise = new MessageReceipt(msgReceiptVars).save()
		.then(function reloadWithRelated(model) {
			return model.refresh({withRelated: ['message', 'recipient']})
			.then(util.fetchJSON);
		});

		return expect(msgReceiptPromise).to.eventually.have.all.keys([
			'id', 'recipient', 'recipientId', 'message', 'messageId', 'archived'
		]);
	});
});
