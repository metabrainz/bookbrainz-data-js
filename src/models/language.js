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

'use strict';

const _ = require('lodash');

const util = require('../util');

function formatWithISOFields(attrs) {
	/* eslint-disable camelcase */
	const REPLACEMENTS = {
		iso_code_2_t: 'iso_code_2t',
		iso_code_2_b: 'iso_code_2b'
	};
	/* eslint-enable camelcase */

	return _.mapKeys(util.camelToSnake(attrs), (value, key) =>
		_.has(REPLACEMENTS, key) ?
			REPLACEMENTS[key] :
			key
	);
}

function parseWithISOFields(attrs) {
	const REPLACEMENTS = {
		isoCode2T: 'isoCode2t',
		isoCode2B: 'isoCode2b'
	};

	return _.mapKeys(util.snakeToCamel(attrs), (value, key) =>
		_.has(REPLACEMENTS, key) ?
			REPLACEMENTS[key] :
			key
	);
}

module.exports = (bookshelf) => {
	const Language = bookshelf.Model.extend({
		tableName: 'musicbrainz.language',
		idAttribute: 'id',
		parse: parseWithISOFields,
		format: formatWithISOFields
	});

	return bookshelf.model('Language', Language);
};
