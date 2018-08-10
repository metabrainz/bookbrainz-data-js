/*
 * Copyright (C) 2018 Shivam Tripathi
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

import type {
	FormAliasWithDefaultT as AliasWithDefault, FormIdentifierT as Identifier,
	Transaction
} from './types';
import {
	getAdditionalEntityProps, getEntityModelByType, getEntitySetMetadataByType
} from './entity';
import Promise from 'bluebird';
import _ from 'lodash';
import {createNote} from './note';
import {incrementEditorEditCountById} from './editor';
import {updateAliasSet} from './alias';
import {updateAnnotation} from './annotation';
import {updateDisambiguation} from './disambiguation';
import {updateEntitySets} from './entity-sets';
import {updateIdentifierSet} from './identifier';


type createEntityPropsType = {
	orm: Object,
	transacting: Transaction,
	editorId: string,
	entityData: Object,
	entityType: string
};

type entityDataType = {
	aliases: Array<AliasWithDefault>,
	annotation: string,
	disambiguation: string,
	identifiers: Array<Identifier>,
	note: string,
	type: string
};

export async function createEntity({
	editorId, entityData, orm, transacting
}: createEntityPropsType) {
	const {Revision} = orm;

	const {aliases, annotation, disambiguation, identifiers, note,
		type: entityType, ...entitySetData}: entityDataType = entityData;

	// Increase user edit count
	const editorUpdatePromise =
		incrementEditorEditCountById(orm, editorId, transacting);

	// Create a new revision record
	const revisionPromise = new Revision({
		authorId: editorId
	}).save(null, {transacting});

	// Create a new note promise
	const notePromise = revisionPromise
		.then((revision) => createNote(
			orm, note, editorId, revision, transacting
		));

	// Create a new aliasSet with aliases obtained
	const aliasSetPromise = updateAliasSet(
		orm, transacting, null, null, aliases || []
	);

	// Create identifier set using the identifiers obtained
	const identSetPromise = updateIdentifierSet(
		orm, transacting, null, identifiers || []
	);

	// Create a new annotation using the revision
	const annotationPromise = revisionPromise.then(
		(revision) => updateAnnotation(
			orm, transacting, null, annotation, revision
		)
	);

	// Create a new disambiguation for the entity
	const disambiguationPromise = updateDisambiguation(
		orm, transacting, null, disambiguation
	);

	// Get additional props
	const additionalProps = getAdditionalEntityProps(entityData, entityType);

	// Create entitySets
	const entitySetMetadata = getEntitySetMetadataByType(entityType);
	const entitySetsPromise = updateEntitySets(
		entitySetMetadata, null, entitySetData, transacting, orm
	);

	const [
		revisionRecord, aliasSetRecord, identSetRecord, annotationRecord,
		disambiguationRecord, entitySets
	] = await Promise.all([
		revisionPromise, aliasSetPromise, identSetPromise,
		annotationPromise, disambiguationPromise, entitySetsPromise,
		editorUpdatePromise, notePromise
	]);

	const propsToSet = _.extend({
		aliasSetId: aliasSetRecord && aliasSetRecord.get('id'),
		annotationId: annotationRecord && annotationRecord.get('id'),
		disambiguationId:
			disambiguationRecord && disambiguationRecord.get('id'),
		identifierSetId: identSetRecord && identSetRecord.get('id'),
		revisionId: revisionRecord && revisionRecord.get('id')
	}, entitySets, additionalProps);

	const model = getEntityModelByType(orm, entityType);

	const entityModel = await model.forge(propsToSet)
		.save(null, {
			method: 'insert',
			transacting
		});

	const entity = await entityModel.refresh({
		transacting,
		withRelated: ['defaultAlias']
	});

	return entity.toJSON();
}
