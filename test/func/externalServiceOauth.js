/*
 * Copyright (C) 2022  Ansh Goyal
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

import {
	deleteOauthToken,
	getOauthToken,
	saveOauthToken,
	updateOauthToken
} from '../../lib/func/externalServiceOauth';


import bookbrainzData from '../bookshelf';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {truncateTables} from '../../lib/util';


chai.use(chaiAsPromised);
const {expect} = chai;
const {
	Editor, EditorType, ExternalServiceOauth, bookshelf
} = bookbrainzData;

const editorTypeAttribs = {
	id: 1,
	label: 'test_type'
};

const editorAttribs = {
	id: 1,
	name: 'ben',
	typeId: 1
};

const externalServiceOauthAttribs = {
	accessToken: 'test access token',
	editorId: 1,
	id: 1,
	refreshToken: 'test refresh token',
	scopes: ['test scope'],
	service: 'critiquebrainz',
	tokenExpires: new Date()
};

describe('saveOauthToken', () => {
	beforeEach(
		async () => {
			await new EditorType(editorTypeAttribs)
				.save(null, {method: 'insert'});
			await new Editor(editorAttribs)
				.save(null, {method: 'insert'});
		}
	);

	afterEach(function truncate() {
		this.timeout(0); // eslint-disable-line @typescript-eslint/no-invalid-this

		return truncateTables(bookshelf, [
			'bookbrainz.external_service_oauth',
			'bookbrainz.editor',
			'bookbrainz.editor_type'
		]);
	});

	it('should save oauth token and return the saved token', async () => {
		const oauthToken = await saveOauthToken(
			editorAttribs.id,
			'critiquebrainz',
			'test access token',
			'test refresh token',
			new Date().getTime(),
			['test scope'],
			bookbrainzData
		);

		return expect(oauthToken).to.have.all.keys([
			'access_token', 'editor_id', 'refresh_token', 'scopes', 'service', 'token_expires'
		]);
	});
});

describe('getOauthToken', () => {
	beforeEach(
		async () => {
			await new EditorType(editorTypeAttribs)
				.save(null, {method: 'insert'});
			await new Editor(editorAttribs)
				.save(null, {method: 'insert'});
			await new ExternalServiceOauth(externalServiceOauthAttribs)
				.save(null, {method: 'insert'});
		}
	);
	afterEach(function truncate() {
		this.timeout(0); // eslint-disable-line @typescript-eslint/no-invalid-this

		return truncateTables(bookshelf, [
			// 'bookbrainz.external_service_oauth',
			'bookbrainz.editor',
			'bookbrainz.editor_type'
		]);
	});
	it('should return oauth token', async () => {
		const oauthToken = await getOauthToken(
			editorAttribs.id,
			'critiquebrainz',
			bookbrainzData
		);

		expect(oauthToken).to.have.all.keys([
			'access_token', 'editor_id', 'refresh_token', 'scopes', 'service', 'token_expires'
		]);
		expect(oauthToken.access_token).to.equal(externalServiceOauthAttribs.accessToken);
		expect(oauthToken.editor_id).to.equal(editorAttribs.id);
		expect(oauthToken.refresh_token).to.equal(externalServiceOauthAttribs.refreshToken);
	});
});


describe('updateOauthToken', () => {
	beforeEach(
		async () => {
			await new EditorType(editorTypeAttribs)
				.save(null, {method: 'insert'});
			await new Editor(editorAttribs)
				.save(null, {method: 'insert'});
			await new ExternalServiceOauth(externalServiceOauthAttribs)
				.save(null, {method: 'insert'});
		}
	);
	afterEach(function truncate() {
		this.timeout(0); // eslint-disable-line @typescript-eslint/no-invalid-this

		return truncateTables(bookshelf, [
			'bookbrainz.external_service_oauth',
			'bookbrainz.editor',
			'bookbrainz.editor_type'
		]);
	});
	it('should update oauth token', async () => {
		const oauthToken = await updateOauthToken(
			editorAttribs.id,
			'critiquebrainz',
			'new access token',
			'new refresh token',
			new Date().getTime(),
			bookbrainzData
		);

		expect(oauthToken).to.have.all.keys([
			'access_token', 'editor_id', 'refresh_token', 'scopes', 'service', 'token_expires'
		]);
		expect(oauthToken.access_token).to.equal('new access token');
		expect(oauthToken.refresh_token).to.equal('new refresh token');
	});
});

describe('deleteOauthToken', () => {
	beforeEach(
		async () => {
			await new EditorType(editorTypeAttribs)
				.save(null, {method: 'insert'});
			await new Editor(editorAttribs)
				.save(null, {method: 'insert'});
			await new ExternalServiceOauth(externalServiceOauthAttribs)
				.save(null, {method: 'insert'});
		}
	);
	afterEach(function truncate() {
		this.timeout(0); // eslint-disable-line @typescript-eslint/no-invalid-this

		return truncateTables(bookshelf, [
			'bookbrainz.external_service_oauth',
			'bookbrainz.editor',
			'bookbrainz.editor_type'
		]);
	});
	it('should delete oauth token', async () => {
		await deleteOauthToken(
			editorAttribs.id,
			'critiquebrainz',
			bookbrainzData
		);

		const oauthToken = await getOauthToken(
			editorAttribs.id,
			'critiquebrainz',
			bookbrainzData
		);

		return expect(oauthToken).to.be.an('undefined');
	});
});

