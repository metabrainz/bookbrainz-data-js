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

import _ from 'lodash';
import {snakeToCamel} from '../../util';


export async function originSourceMapping(transacting, idAsKey) {
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

export async function getOriginSourceId(transacting, source) {
	let idArr = null;

	try {
		[idArr] = await transacting.select('id')
			.from('bookbrainz.origin_source')
			.where('name', '=', source);
	}
	catch (err) {
		return null;
	}

	// Create the data source if it does not exist
	if (!idArr) {
		try {
			const [id] = await transacting.insert([{name: source}])
				.into('bookbrainz.origin_source')
				.returning('id');

			idArr = {id};
		}
		catch (err) {
			return null;
		}
	}

	// Returning the {id} of the origin source
	return idArr;
}

export async function getOriginSourceFromId(transacting, originSourceId) {
	const [{name}] = await transacting.select('name')
		.from('bookbrainz.origin_source')
		.where('id', originSourceId);

	return name;
}

export async function getImportDetails(transacting, importId) {
	const [details] = await transacting.select('*')
		.from('bookbrainz.link_import')
		.where('import_id', importId);

	details.source = await getOriginSourceFromId(
		transacting, details.origin_source_id
	);
	return snakeToCamel(details);
}
