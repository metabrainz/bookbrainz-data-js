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

import type {ExternalServiceTokenT} from './types';

/**
 * Fetches the Oauth token with related data
 * @param {number} editorId - Editor's id.
 * @param {string} service - Name of the service.
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @returns {Promise} A Promise that resolves to the oauth token in JSON format
 */
export async function getOauthToken(
	editorId: number,
	service: string,
	orm: Record<string, any>
): Promise<ExternalServiceTokenT> {
	const rawSql =
		`SELECT 
			  editor_id,
			  service,
			  access_token,
			  refresh_token,
			  token_expires::text,
              scopes
		 FROM bookbrainz.external_service_oauth 
		WHERE editor_id = ${editorId} 
		  AND service = '${service}'`;
	const result = await orm.bookshelf.knex.raw(rawSql);
	return result.rows[0];
}

/**
 * Deletes the Oauth token with related data from the database
 *
 * @param {number} editorId - Editor's id.
 * @param {string} service - name of the service.
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 *
 */
export async function deleteOauthToken(
	editorId: number,
	service: string,
	orm: Record<string, any>
): Promise<void> {
	const {ExternalServiceOauth} = orm;

	await ExternalServiceOauth.where(
		// eslint-disable-next-line camelcase
		{editor_id: editorId, service}
	).destroy();
}

/**
 * Saves the Oauth token with related data to the database
 *
 * @param {number} editorId - Editor's id.
 * @param {string} service - name of the service.
 * @param {string} accessToken - access token.
 * @param {string} refreshToken - refresh token.
 * @param {number} tokenExpiresTs - token expiration timestamp.
 * @param {string[]} scopes - scopes.
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @returns {Promise} A Promise that resolves to the oauth token in JSON format
 */
export async function saveOauthToken(
	editorId: number,
	service: string,
	accessToken: string,
	refreshToken: string,
	tokenExpiresTs: number,
	scopes: Array<string>,
	orm: Record<string, any>
): Promise<ExternalServiceTokenT> {
	const rawSql =
		`INSERT INTO bookbrainz.external_service_oauth
			(editor_id, service, access_token, refresh_token, token_expires, scopes)
		VALUES
			(${editorId},
			'${service}',
			'${accessToken}',
			'${refreshToken}',
			to_timestamp(${tokenExpiresTs}),
			'{${scopes}}')
		ON CONFLICT (editor_id, service)
		DO UPDATE SET
			editor_id = EXCLUDED.editor_id,
			service = EXCLUDED.service,
			access_token = EXCLUDED.access_token,
			refresh_token = EXCLUDED.refresh_token,
			token_expires = EXCLUDED.token_expires,
			scopes = EXCLUDED.scopes
  RETURNING
            editor_id,
            service,
            access_token,
            refresh_token,
            token_expires::text,
            scopes;`;

	const result = await orm.bookshelf.knex.raw(rawSql);
	return result.rows[0];
}


/**
 * Updates the Oauth token with related data in the database
 *
 * @param {number} editorId - Editor's id.
 * @param {string} service - name of the service.
 * @param {string} accessToken - access token.
 * @param {string} refreshToken - refresh token.
 * @param {number} tokenExpiresTs - token expiration timestamp.
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @returns {Promise} A Promise that resolves to the oauth token in JSON format
 */
export async function updateOauthToken(
	editorId: number,
	service: string,
	accessToken: string,
	refreshToken: string,
	tokenExpiresTs: number,
	orm: Record<string, any>
): Promise<ExternalServiceTokenT> {
	const rawSql =
		`UPDATE bookbrainz.external_service_oauth
			SET access_token = '${accessToken}',
				refresh_token = '${refreshToken}',
				token_expires = to_timestamp(${tokenExpiresTs})
		  WHERE editor_id = '${editorId}'
			AND service = '${service}'
	  RETURNING
                editor_id,
                service,
                access_token,
                refresh_token,
                token_expires::text,
                scopes;`;

	const result = await orm.bookshelf.knex.raw(rawSql);
	return result.rows[0];
}
