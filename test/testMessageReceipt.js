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

const Bookshelf = require('./bookshelf');

const Editor = require('../index').Editor;
const EditorType = require('../index').EditorType;
const Gender = require('../index').Gender;
const Message = require('../index').Message;
const MessageReceipt = require('../index').MessageReceipt;

chai.use(chaiAsPromised);

describe('MessageReceipt model', function() {
	const editorTypeVars = {id: 1, label: 'test_type'};
	const editorVars = {
		id: 1, name: 'bob', email: 'bob@test.org', password: 'test',
		countryId: 1, genderId: 1, editorTypeId: 1
	};
	const messageVars = {senderId: 1, subject: 'test', content: 'test'};
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
		const msgReceiptVars = {messageId: 1, recipientId: 1};
		const msgReceiptPromise = new MessageReceipt(msgReceiptVars).save()
		.then((model) =>
			model.refresh({withRelated: ['message', 'recipient']})
			.then(util.fetchJSON)
		);

		return expect(msgReceiptPromise).to.eventually.have.all.keys([
			'id', 'recipient', 'recipientId', 'message', 'messageId', 'archived'
		]);
	});
});
