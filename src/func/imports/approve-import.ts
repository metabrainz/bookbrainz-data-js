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

import * as _ from 'lodash';
import {
	getAdditionalEntityProps, getEntityModelByType, getEntitySetMetadataByType
} from '../entity';
import type {ImportMetadataWithSourceT} from '../../types/imports';
import type {ORM} from '../..';
import type {Transaction} from '../types';
import {createNote} from '../note';
import {deleteImport} from './delete-import';
import {incrementEditorEditCountById} from '../editor';


interface approveEntityPropsType {
	orm: ORM,
	transacting: Transaction,
	importEntity: any,
	editorId: string
}

export async function approveImport(
	{orm, transacting, importEntity, editorId}: approveEntityPropsType
): Promise<Record<string, unknown>> {
	const {bbid: pendingEntityBbid, type: entityType, disambiguationId, aliasSet,
		identifierSetId, annotationId} = importEntity;
	const metadata: ImportMetadataWithSourceT = importEntity.importMetadata;
	const {id: aliasSetId} = aliasSet;

	const {Annotation, Entity, Revision} = orm;

	// Increase user edit count
	const editorUpdatePromise =
		incrementEditorEditCountById(orm, editorId, transacting);

	// Create a new revision record
	const revision = await new Revision({
		authorId: editorId
	}).save(null, {transacting});
	const revisionId = revision.get('id');

	if (annotationId) {
		// Set revision of our annotation which is NULL for imports
		await new Annotation({id: annotationId})
			.save({lastRevisionId: revisionId}, {transacting});
	}

	const note = `Approved from automatically imported record of ${metadata.source}`;
	// Create a new note promise
	const notePromise = createNote(orm, note, editorId, revision, transacting);

	// Get additional props
	const additionalProps = getAdditionalEntityProps(importEntity, entityType);

	// Collect the entity sets from the importEntity
	const entitySetMetadata = getEntitySetMetadataByType(entityType);
	const entitySets = entitySetMetadata.reduce(
		(set, {entityIdField}) =>
			_.assign(set, {[entityIdField]: importEntity[entityIdField]})
		, {}
	);

	await Promise.all([notePromise, editorUpdatePromise]);

	const newEntity = await new Entity({type: entityType})
		.save(null, {transacting});
	const acceptedEntityBbid = newEntity.get('bbid');
	const propsToSet = _.extend({
		aliasSetId,
		annotationId,
		bbid: acceptedEntityBbid,
		disambiguationId,
		identifierSetId,
		revisionId
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

	await deleteImport(transacting, pendingEntityBbid, acceptedEntityBbid);

	return entity;
}
