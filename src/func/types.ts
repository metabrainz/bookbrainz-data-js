/*
 * Copyright (C) 2018  Ben Ockmore
 *               2018 Shivam Tripathi
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

import type {IdentifierT} from '../types/identifiers';
import type {Knex} from 'knex';
import type {NewOrExistingAliasT} from '../types/aliases';


export type Transaction = Knex.Transaction<any>;

export interface FormRelationshipAttributesT {
	id: number,
	attributeType: number
	value: {
		textValue: string | null
	}
}

export interface FormRelationshipT {
	attributeSetId: number,
	id: number,
	typeId: number,
	sourceBbid: string,
	targetBbid: string
}

export interface FormLanguageT {
	id: number
}

export interface FormPublisherT {
	bbid: string
}

export interface FormReleaseEventT {
	date: string,
	areaId?: any
}

// TODO: Actually all of these types would need an (optional) 'id' or 'bbid' attribute for their intended use
//  (can be missing for new items), but not all of them are defined as such above!
// TODO: Although FormRelationshipAttributesT is missing from this type, createNewRelationshipAttributeSetWithItems
//  (which requires SetItemT inputs) causes no type errors?
export type SetItemT =
	NewOrExistingAliasT | IdentifierT | FormLanguageT | FormRelationshipT |
	FormPublisherT | FormReleaseEventT;

export interface AuthorCreditNameT {
	authorBBID: string,
	name: string,
	joinPhrase: string
}

export interface ExternalServiceTokenT {
    access_token: string, // eslint-disable-line camelcase
    editor_id: number, // eslint-disable-line camelcase
    refresh_token: string, // eslint-disable-line camelcase
    token_expires: string, // eslint-disable-line camelcase
    scopes: Array<string>,
    service: string
}
