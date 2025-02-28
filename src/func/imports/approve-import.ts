/*
 * Copyright (C) 2024  David Kellner
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

import type {EntityType} from '../../types/schema';
import type {ImportMetadataWithSourceT} from '../../types/imports';
import type {ORM} from '../..';
import {uncapitalize} from '../../util';


export async function approveImport({editorId, importEntity, orm}: {
	editorId: number,
	importEntity: any,
	orm: ORM,
}) {
	const {bbid, type, annotationId} = importEntity;
	const metadata: ImportMetadataWithSourceT = importEntity.importMetadata;
	const entityType = uncapitalize(type as EntityType);

	await orm.kysely.transaction().execute(async (trx) => {
		const pendingUpdates = [
			// Mark the pending entity as accepted
			trx.updateTable('entity')
				.set('isImport', false)
				.where((eb) => eb.and({bbid, isImport: true}))
				.executeTakeFirst(),
			// Indicate approval of the entity by setting the accepted BBID
			trx.updateTable('importMetadata')
				.set('acceptedEntityBbid', bbid)
				.where('pendingEntityBbid', '=', bbid)
				.executeTakeFirst(),
			// Increment revision count of the active editor
			trx.updateTable('editor')
				.set((eb) => ({
					revisionsApplied: eb('revisionsApplied', '+', 1),
					totalRevisions: eb('totalRevisions', '+', 1),
				}))
				.where('id', '=', editorId)
				.executeTakeFirst(),
		];

		// Create a new revision and an entity header
		const revision = await trx.insertInto('revision')
			.values({authorId: editorId})
			.returning('id')
			.executeTakeFirstOrThrow();
		await trx.insertInto(`${entityType}Header`)
			.values({bbid})
			.executeTakeFirstOrThrow();

		// Create initial entity revision using the entity data from the import
		await trx.insertInto(`${entityType}Revision`)
			.values((eb) => ({
				bbid,
				dataId: eb.selectFrom(`${entityType}ImportHeader`)
					.select('dataId')
					.where('bbid', '=', bbid),
				id: revision.id
			}))
			.executeTakeFirstOrThrow();

		// Update the entity header with the revision, doing this earlier causes a FK constraint violation
		pendingUpdates.push(trx.updateTable(`${entityType}Header`)
			.set('masterRevisionId', revision.id)
			.where('bbid', '=', bbid)
			.executeTakeFirst());

		if (annotationId) {
			// Set revision of our annotation which is NULL for pending imports
			pendingUpdates.push(trx.updateTable('annotation')
				.set('lastRevisionId', revision.id)
				.where('id', '=', annotationId)
				.executeTakeFirst());
		}

		// Create edit note
		await trx.insertInto('note')
			.values({
				authorId: editorId,
				content: `Approved automatically imported record ${metadata.externalIdentifier} from ${metadata.source}`,
				revisionId: revision.id,
			})
			.executeTakeFirstOrThrow();

		return Promise.all(pendingUpdates.map(async (update) => {
			const {numUpdatedRows} = await update;
			if (Number(numUpdatedRows) !== 1) {
				throw new Error(`Failed to approve import of ${bbid}`);
			}
		}));
	});
}
