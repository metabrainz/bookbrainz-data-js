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

// @flow

import {type $Transaction} from 'knex';


export type Transaction = $Transaction<any>;

export type EntityTypeString =
	'Creator' | 'Edition' | 'Work' | 'Publisher' | 'Publication';

export type FormAliasT = {
	id: number,
	name: string,
	sortName: string,
	languageId: number,
	primary: boolean
};

export type FormAliasWithDefaultT = {
	id: number,
	name: string,
	sortName: string,
	languageId: number,
	primary: boolean,
	default: boolean
};

export type FormIdentifierT = {
	value: string,
	typeId: number
};

export type FormRelationshipT = {
	id: number,
	typeId: number,
	sourceBbid: string,
	targetBbid: string
};

export type FormLanguageT = {
	id: number
};

export type FormPublisherT = {
	bbid: string
};
