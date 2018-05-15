// @flow

import * as Immutable from 'immutable';


type EntityTypeString =
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
