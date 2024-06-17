/*
 * Copyright (C) 2019  Nicolas Pelletier
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


export interface DateObject {
	day: string | null;
	month: string | null;
	year: string | null;
}

/**
 * Parse an ISO 8601-2004 string and return an object with separate day, month and year, if they exist.
 * If any of the values don't exist, the default is an empty string.
 * @function ISODateStringToObject
 * @param {string} value - relationshipId number for initaial relationship
 * @returns {object} a {day, month, year} object
 */
export function ISODateStringToObject(value: string | DateObject): DateObject {
	if (!_.isString(value)) {
		if (_.isPlainObject(value) && _.has(value, 'year')) {
			return value;
		}
		return {day: '', month: '', year: ''};
	}
	const date = value ? value.split('-') : [];
	// A leading minus sign denotes a BC date
	// This creates an empty first array item that needs to be removed,
	// and requires us to add the negative sign back for the year
	if (date.length && date[0] === '') {
		date.shift();
		date[0] = (-parseInt(date[0], 10)).toString();
	}
	return {
		day: date.length > 2 ? date[2] : '',
		month: date.length > 1 ? date[1] : '',
		year: date.length > 0 ? date[0] : ''
	};
}

/**
 * Determines wether a given date is empty or null, meaning no year month or day has been specified.
 * Accepts a {day, month, year} object or an ISO 8601-2004 string (±YYYYYY-MM-DD)
 * @function isNullDate
 * @param {object|string} date - a {day, month, year} object or ISO 8601-2004 string (±YYYYYY-MM-DD)
 * @returns {boolean} true if the date is empty/null
 */
export function isNullDate(date: string | DateObject): boolean {
	const dateObject = ISODateStringToObject(date);
	const isNullYear = _.isNil(dateObject.year) || dateObject.year === '';
	const isNullMonth = _.isNil(dateObject.month) || dateObject.month === '';
	const isNullDay = _.isNil(dateObject.day) || dateObject.day === '';
	return isNullYear && isNullMonth && isNullDay;
}
