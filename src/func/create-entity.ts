/*
 * Adapted from bookbrainz-site
 * Copyright (C) 2016  Sean Burke
 *               2016  Ben Ockmore
 *               2018  Shivam Tripathi
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

import * as _ from 'lodash';
import {
	getAdditionalEntityProps, getEntityModelByType, getEntitySetMetadataByType
} from './entity';
import type {AliasWithDefaultT} from '../types/aliases';
import type {EntityTypeString} from '../types/entity';
import type {IdentifierT} from '../types/identifiers';
import type {ORM} from '..';
import type {Transaction} from './types';
import {createNote} from './note';
import {incrementEditorEditCountById} from './editor';
import {updateAliasSet} from './alias';
import {updateAnnotation} from './annotation';
import {updateDisambiguation} from './disambiguation';
import {updateEntitySets} from './entity-sets';
import {updateIdentifierSet} from './identifier';


interface EntityDataType {
	aliases: Array<AliasWithDefaultT>,
	annotation: string,
	disambiguation: string,
	identifiers: Array<IdentifierT>,
	note: string,
	type: EntityTypeString
}

interface ExtraEntityDataType extends EntityDataType {
	[propName: string]: any;
}

interface CreateEntityPropsType {
	orm: ORM,
	transacting: Transaction,
	editorId: string,
	entityData: ExtraEntityDataType,
	entityType: EntityTypeString
}

// TODO: function seems to be unused across all BB repos, ignore its errors (and delete it?)
export async function createEntity({
	editorId, entityData, orm, transacting
}: CreateEntityPropsType) {
	const {Revision} = orm;

	const {aliases, annotation, disambiguation, identifiers, note,
		type: entityType, ...entitySetData} = entityData;

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
	// @ts-expect-error Not sure why we have this error but this whole function is unused across our repos
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

	const Model = getEntityModelByType(orm, entityType);

	const entityModel = await new Model(propsToSet)
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
