/*
 * Copyright (C) 2015  Ben Ockmore
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

import {camelToSnake, snakeToCamel} from '../util';
import _ from 'lodash';


function formatWithISOFields(attrs) {
	/* eslint-disable camelcase */
	const REPLACEMENTS = {
		iso_code_2_b: 'iso_code_2b',
		iso_code_2_t: 'iso_code_2t'
	};
	/* eslint-enable camelcase */

	return _.mapKeys(camelToSnake(attrs), (value, key) => ( // eslint-disable-line no-extra-parens,max-len
		_.has(REPLACEMENTS, key) ? REPLACEMENTS[key] : key
	));
}

function parseWithISOFields(attrs) {
	const REPLACEMENTS = {
		isoCode2B: 'isoCode2b',
		isoCode2T: 'isoCode2t'
	};

	return _.mapKeys(snakeToCamel(attrs), (value, key) => ( // eslint-disable-line no-extra-parens,max-len
		_.has(REPLACEMENTS, key) ? REPLACEMENTS[key] : key
	));
}

export default function language(bookshelf) {
	const Language = bookshelf.Model.extend({
		format: formatWithISOFields,
		idAttribute: 'id',
		parse: parseWithISOFields,
		tableName: 'musicbrainz.language'
	});

	return bookshelf.model('Language', Language);
}
