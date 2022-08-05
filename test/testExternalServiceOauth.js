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

import bookbrainzData from './bookshelf';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {truncateTables} from '../lib/util';


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

describe('ExternalServiceOauth model', () => {
	beforeEach(
		() =>
			new EditorType(editorTypeAttribs)
				.save(null, {method: 'insert'})
				.then(
					() =>
						new Editor(editorAttribs)
							.save(null, {method: 'insert'})
				)
	);

	afterEach(function truncate() {
		this.timeout(0); // eslint-disable-line @typescript-eslint/no-invalid-this

		return truncateTables(bookshelf, [
			'bookbrainz.external_service_oauth',
			'bookbrainz.editor',
			'bookbrainz.editor_type'
		]);
	});


	it('should return a JSON object with correct keys when saved', () => {
		const externalServiceOauthPromise = new ExternalServiceOauth(externalServiceOauthAttribs)
			.save(null, {method: 'insert'})
			.then((model) => model.refresh())
			.then((externalServiceOauth) => externalServiceOauth.toJSON());

		return expect(externalServiceOauthPromise).to.eventually.have.all.keys([
			'accessToken', 'editorId', 'id', 'refreshToken', 'scopes', 'service', 'tokenExpires'
		]);
	});
});
