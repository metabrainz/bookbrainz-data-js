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
import type {ImportMetadataWithSourceT} from '../../types/imports';
import type {Transaction} from '../types';
import {snakeToCamel} from '../../util';


export async function getExternalSourceMapping(
	transacting: Transaction, idAsKey?: boolean
) {
	const externalSources = await transacting.select('*')
		.from('bookbrainz.external_source');
	return externalSources.reduce(
		(mapping, {id, name}) => {
			if (idAsKey) {
				return _.assign(mapping, {[id]: name});
			}
			return _.assign(mapping, {[name]: id});
		}, {}
	);
}

export async function getExternalSourceId(
	transacting: Transaction, sourceName: string
): Promise<number | null | undefined> {
	let externalSourceId: number | null | undefined = null;

	try {
		const [idObj] = await transacting.select('id')
			.from('bookbrainz.external_source')
			.where('name', '=', sourceName);
		externalSourceId = _.get(idObj, 'id');
	}
	catch (err) {
		// Should error loudly if anything goes wrong
		throw new Error(
			`Error while extracting external source using ${sourceName} - ${err}`
		);
	}

	// Create the data source if it does not exist
	if (!externalSourceId) {
		try {
			const [idObj] = await transacting.insert([{name: sourceName}])
				.into('bookbrainz.external_source')
				.returning('id');
			externalSourceId = _.get(idObj, 'id');
		}
		catch (err) {
			// Should error loudly if anything goes wrong
			throw new Error(
				`Error while creating a new source ${sourceName} - ${err}`
			);
		}
	}

	// Returning the {id} of the origin source
	return externalSourceId || null;
}

export async function getExternalSourceFromId(
	transacting: Transaction, externalSourceId: number
): Promise<string | null | undefined> {
	// Should error loudly if anything goes wrong
	const [nameObj] = await transacting.select('name')
		.from('bookbrainz.external_source')
		.where('id', externalSourceId);

	if (!nameObj || !nameObj.name) {
		throw new Error(
			`No source found with the given source ID ${externalSourceId}`
		);
	}

	return nameObj.name;
}

export async function getImportMetadata(
	transacting: Transaction, importId: string
): Promise<ImportMetadataWithSourceT> {
	// Should error loudly if anything goes wrong
	const [details] = await transacting.select('*')
		.from('bookbrainz.import_metadata')
		.where('pending_entity_bbid', importId);

	if (!details) {
		throw new Error(`Details for the import ${importId} not found`);
	}

	details.source = await getExternalSourceFromId(
		transacting, details.external_source_id
	);

	return snakeToCamel(details);
}
