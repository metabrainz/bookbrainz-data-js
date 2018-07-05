/*
 * Copyright (C) 2018  Ben Ockmore
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

import * as Immutable from 'immutable';


export type EntityTypeString =
	'Creator' | 'Edition' | 'Work' | 'Publisher' | 'Publication';

type AliasProps = {
	ID: ?string,
	name: string,
	sortName: string,
	languageID: string,
	primary: boolean
};
export type AliasRecordT = Immutable.Record<AliasProps>;

type IdentifierTypeProps = {
	ID: string,
	label: string,
	description: string,
	detectionRegex: string,
	validationRegex: string,
	displayTemplate: string,
	entityType: EntityTypeString,
	parentID: ?string,
	childOrder: number,
	deprecated: boolean
} | {ID: null};
type IdentifierTypeRecordT = Immutable.Record<IdentifierTypeProps>;

type IdentifierProps = {
	ID: string,
	type: IdentifierTypeRecordT,
	value: string
} | {ID: null};
type IdentifierRecordT = Immutable.Record<IdentifierProps>;

type RelationshipTypeProps = {
	ID: string,
	label: string,
	description: string,
	linkPhrase: string,
	reverseLinkPhrase: string,
	sourceEntityType: EntityTypeString,
	targetEntityType: EntityTypeString,
	parentID: ?string,
	childOrder: number,
	deprecated: boolean
} | {ID: null};
type RelationshipTypeRecordT = Immutable.Record<RelationshipTypeProps>;

type RelationshipProps = {
	ID: ?string,
	type: RelationshipTypeRecordT,
	sourceBBID: string,
	targetBBID: string
} | {ID: null};
type RelationshipRecordT = Immutable.Record<RelationshipProps>;

type EntityProps = {
	BBID: ?string,
	dataID: string,
	revisionID: string,
	master: boolean,
	type: EntityTypeString,
	annotation: string,
	disambiguation: string,
	aliases: Immutable.Set<AliasRecordT>,
	identifiers: Immutable.Set<IdentifierRecordT>,
	relationships: Immutable.Set<RelationshipRecordT>
};
export type EntityRecordT = Immutable.Record<EntityProps>;


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
	ID: number,
	typeID: number,
	sourceBBID: string,
	targetBBID: string
};
