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

const util = require('../util');

let Language = null;
const _ = require('lodash');

function formatWithISOFields(attrs) {
	const REPLACEMENTS = {
		isoCode1: 'iso_code_1',
		isoCode2t: 'iso_code_2t',
		isoCode2b: 'iso_code_2b',
		isoCode3: 'iso_code_3'
	};

	return util.camelToSnake(
		_.reduce(attrs, (result, val, key) => {
			const newKey = _.has(REPLACEMENTS, key) ?
				REPLACEMENTS[key] : key;
			result[newKey] = val;
			return result;
		}, {})
	);
}

module.exports = function(bookshelf) {
	if (!Language) {
		Language = bookshelf.Model.extend({
			tableName: 'musicbrainz.language',
			idAttribute: 'id',
			parse: util.snakeToCamel,
			format: formatWithISOFields
		});

		Language = bookshelf.model('Language', Language);
	}
	return Language;
};
