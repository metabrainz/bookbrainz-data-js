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

import type {Transaction} from '../types';
import _ from 'lodash';
import {snakeToCamel} from '../../util';


export async function originSourceMapping(
	transacting: Transaction, idAsKey?: boolean
) {
	const mappingRecord = await transacting.select('*')
		.from('bookbrainz.origin_source');
	return mappingRecord.reduce(
		(mapping, {id, name}) => {
			if (idAsKey) {
				return _.assign(mapping, {[id]: name});
			}
			return _.assign(mapping, {[name]: id});
		}, {}
	);
}

export async function getOriginSourceId(
	transacting: Transaction, source: string
): Promise<?number> {
	let originSourceId: ?number = null;

	try {
		const [idObj] = await transacting.select('id')
			.from('bookbrainz.origin_source')
			.where('name', '=', source);
		originSourceId = _.get(idObj, 'id');
	}
	catch (err) {
		// Should error loudly if anything goes wrong
		throw new Error(
			`Error while extracting origin source using ${source} - ${err}`
		);
	}

	// Create the data source if it does not exist
	if (!originSourceId) {
		try {
			[originSourceId] = await transacting.insert([{name: source}])
				.into('bookbrainz.origin_source')
				.returning('id');
		}
		catch (err) {
			// Should error loudly if anything goes wrong
			throw new Error(
				`Error while creating a new source ${source} - ${err}`
			);
		}
	}

	// Returning the {id} of the origin source
	return originSourceId || null;
}

export async function getOriginSourceFromId(
	transacting: Transaction, originSourceId: number
): Promise<?string> {
	// Should error loudly if anything goes wrong
	const [nameObj] = await transacting.select('name')
		.from('bookbrainz.origin_source')
		.where('id', originSourceId);

	if (!nameObj || !nameObj.name) {
		throw new Error(
			`No source found with the given source Id ${originSourceId}`
		);
	}

	return nameObj.name;
}

export async function getImportDetails(
	transacting: Transaction, importId: number
): Promise<Object> {
	// Should error loudly if anything goes wrong
	const [details] = snakeToCamel(await transacting.select('*')
		.from('bookbrainz.link_import')
		.where('import_id', importId));

	if (!details) {
		throw new Error(`Details for the import ${importId} not found`);
	}

	details.source = await getOriginSourceFromId(
		transacting, details.originSourceId
	);

	return details;
}
