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

import {
	getAdditionalEntityProps, getEntityModelByType, getEntitySetMetadataByType
} from '../entity';
import type {Transaction} from '../types';
import _ from 'lodash';
import {createNote} from '../note';
import {deleteImport} from './delete-import';
import {incrementEditorEditCountById} from '../editor';


type approveEntityPropsType = {
	orm: Object,
	transacting: Transaction,
	importEntity: Object,
	editorId: string
};

export async function approveImport(
	{orm, transacting, importEntity, editorId}: approveEntityPropsType
): Object {
	const {source, importId, type: entityType, disambiguationId, aliasSet,
		identifierSetId} = importEntity;
	const {id: aliasSetId} = aliasSet;

	const {Revision} = orm;

	// Increase user edit count
	const editorUpdatePromise =
		incrementEditorEditCountById(orm, editorId, transacting);

	// Create a new revision record
	const revisionPromise = new Revision({
		authorId: editorId
	}).save(null, {transacting});

	const note = `Approved from automatically imported record of ${source}`;
	// Create a new note promise
	const notePromise = revisionPromise
		.then((revision) => createNote(
			orm, note, editorId, revision, transacting
		));

	// Get additional props
	const additionalProps = getAdditionalEntityProps(importEntity, entityType);

	// Collect the entity sets from the importEntity
	const entitySetMetadata: Array<Object> =
		getEntitySetMetadataByType(entityType);
	const entitySets = entitySetMetadata.reduce(
		(set, {entityIdField}) =>
			_.assign(set, {[entityIdField]: importEntity[entityIdField]})
		, {}
	);

	const [revisionRecord] = await Promise.all([
		revisionPromise, notePromise, editorUpdatePromise
	]);

	const propsToSet = _.extend({
		aliasSetId,
		disambiguationId,
		identifierSetId,
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

	await deleteImport(transacting, importId);

	return entity.toJSON();
}
