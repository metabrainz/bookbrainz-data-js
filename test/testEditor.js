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

const Bookshelf = require('./bookshelf');

const Editor = require('../index').Editor;
const EditorType = require('../index').EditorType;
const Gender = require('../index').Gender;
const Message = require('../index').Message;
const MessageReceipt = require('../index').MessageReceipt;
const Revision = require('../index').Revision;
const _ = require('lodash');

chai.use(chaiAsPromised);

const genderAttribs = {
	id: 1,
	name: 'test'
};

const editorTypeAttribs = {
	id: 1,
	label: 'test_type'
};

const editorAttribs = {
	id: 1,
	name: 'bob',
	email: 'bob@test.org',
	password: 'test',
	editorTypeId: 1
};

const editorAttribsWithOptional = _.assign(_.clone(editorAttribs), {
	countryId: 1,
	genderId: 1
});

describe('Editor model', () => {
	beforeEach(() => {
		return Promise.all([
			new Gender(genderAttribs).save(null, {method: 'insert'}),
			new EditorType(editorTypeAttribs).save(null, {method: 'insert'})
		]);
	});

	afterEach(() => {
		return Promise.all([
			Bookshelf.knex.raw('TRUNCATE bookbrainz.editor CASCADE'),
			Bookshelf.knex.raw('TRUNCATE bookbrainz.editor_type CASCADE'),
			Bookshelf.knex.raw('TRUNCATE musicbrainz.gender CASCADE'),
			Bookshelf.knex.raw('TRUNCATE bookbrainz.message CASCADE'),
			Bookshelf.knex.raw('TRUNCATE bookbrainz.message_receipt CASCADE'),
			Bookshelf.knex.raw('TRUNCATE bookbrainz.revision CASCADE')
		]);
	});

	it('should return a JSON object with correct keys when saved', () => {
		const editorPromise = new Editor(editorAttribsWithOptional)
			.save(null, {method: 'insert'})
			.then(() => {
				const messageAttribs = {
					id: 1,
					senderId: 1,
					subject: 'test',
					content: 'test'
				};

				const messageReceiptAttribs = {
					messageId: 1,
					recipientId: 1
				};

				const revisionAttribs = {
					id: 1,
					authorId: 1,
					_type: 1
				};

				return Promise.all([
					new Message(messageAttribs).save(null, {method: 'insert'}),
					new MessageReceipt(messageReceiptAttribs)
						.save(null, {method: 'insert'}),
					new Revision(revisionAttribs).save(null, {method: 'insert'})
				]);
			})
			.then(() => {
				return new Editor({id: 1})
					.fetch({
						withRelated: [
							'editorType',
							'gender',
							'messages',
							'revisions'
						]
					});
			})
			.then((editor) => editor.toJSON());

		return expect(editorPromise).to.eventually.have.all.keys([
			'id', 'name', 'email', 'reputation', 'bio', 'birthDate',
			'createdAt', 'activeAt', 'editorTypeId', 'gender', 'genderId',
			'countryId', 'password', 'revisionsApplied', 'revisionsReverted',
			'totalRevisions', 'editorType', 'messages', 'revisions'
		]);
	});

	it('should hash passwords for new editors', () => {
		const editorPromise = new Editor(editorAttribs)
			.save(null, {method: 'insert'})
			.then(() => new Editor({id: 1}).fetch({require: true}))
			.then((editor) => editor.get('password'));

		return Promise.all([
			expect(editorPromise).to.eventually.not.equal('test'),
			expect(editorPromise).to.eventually.match(/^[.\/$A-Za-z0-9]{60}$/)
		]);
	});

	it('should hash updated passwords', () => {
		let hashed;

		const editorPromise = new Editor(editorAttribs)
			.save(null, {method: 'insert'})
			.then(() => new Editor({id: 1}).fetch({require: true}))
			.then((editor) => {
				hashed = editor.get('password');
				editor.set('password', 'orange');

				return editor.save();
			})
			.then(() => new Editor({id: 1}).fetch({require: true}))
			.then((editor) => editor.get('password'));

		return Promise.all([
			expect(editorPromise).to.eventually.not.equal('orange'),
			expect(editorPromise).to.eventually.not.equal(hashed),
			expect(editorPromise).to.eventually.match(/^[.\/$A-Za-z0-9]{60}$/)
		]);
	});

	it('should distinguish correct and incorrect passwords', () => {
		const editorPromise = new Editor(editorAttribs)
			.save(null, {method: 'insert'})
			.then(() => {
				return new Editor({id: 1})
					.fetch({require: true});
			})
			.then((editor) => {
				return [
					editor.checkPassword('test'),
					editor.checkPassword('orange')
				];
			});

		return editorPromise.spread((correct, incorrect) => {
			return Promise.all([
				expect(correct).to.equal(true),
				expect(incorrect).to.equal(false)
			]);
		});
	});
});
