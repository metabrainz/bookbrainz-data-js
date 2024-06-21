/*
 * Copyright (C) 2017  Ben Ockmore
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

import {type DateObject, ISODateStringToObject, isNullDate} from '../func/date';
import _ from 'lodash';
import {dateValidator} from './date';
import {isIterable} from '../util';
import validator from 'validator';


export class ValidationError extends Error {
	constructor(message: string, public field?: string, public value?: any) {
		super(message);
		Object.defineProperty(this, 'name', {
			enumerable: false,
			value: 'ValidationError'
		});
	}
}

export function get(
	object: any,
	path: string,
	defaultValue: unknown | null | undefined = null
): any {
	if (isIterable(object)) {
		return object.get(path, defaultValue);
	}
	return _.get(object, path, defaultValue);
}

export function getIn(
	object: any,
	paths: string[],
	defaultValue: unknown | null | undefined = null
): any {
	if (isIterable(object)) {
		return object.getIn(paths, defaultValue);
	}
	return _.get(object, paths, defaultValue);
}

export function validateOptionalString(value: any, field: string): void {
	if (!(_.isNil(value) || _.isString(value))) {
		throw new ValidationError('Value has to be a string, `null` or `undefined`', field, value);
	}
}

export function validateRequiredString(value: any, field: string): void {
	if (!_.isString(value) || value === '') {
		throw new ValidationError('Value has to be a non-empty string', field, value);
	}
}

export function validatePositiveInteger(
	value: any, field: string, required = false
): void {
	if (_.isNil(value)) {
		if (required) {
			throw new ValidationError('Required value is missing', field);
		}
		return;
	}

	if (!(_.isInteger(value) && value > 0)) {
		throw new ValidationError('Value has to be a positive integer', field, value);
	}
}

export function validateDate(value: string | DateObject, field: string): void {
	let dateObject: DateObject;
	// We expect a string but accept both ISO date strings and {year,month,date} objects
	if (_.isString(value)) {
		dateObject = ISODateStringToObject(value);
	}
	else {
		dateObject = value;
	}
	const year = _.get(dateObject, 'year', null);
	const month = _.get(dateObject, 'month', null);
	const day = _.get(dateObject, 'day', null);
	try {
		dateValidator(day, month, year);
	}
	catch (error) {
		if (error instanceof ValidationError) {
			error.field = field;
			error.value = value;
		}
		throw error;
	}
}

/* Checks whether the given dates form a valid range. Only to be used with valid dates. */
export function dateIsBefore(beginValue: string | DateObject, endValue: string | DateObject): boolean {
	const beginDateObject = ISODateStringToObject(beginValue);
	const endDateObject = ISODateStringToObject(endValue);
	if (isNullDate(beginDateObject) || isNullDate(endDateObject)) {
		return true;
	}

	const beginYear = _.toInteger(beginDateObject.year);
	const beginMonth = _.toInteger(beginDateObject.month);
	const beginDay = _.toInteger(beginDateObject.day);

	const endYear = _.toInteger(endDateObject.year);
	const endMonth = _.toInteger(endDateObject.month);
	const endDay = _.toInteger(endDateObject.day);

	if (beginYear < endYear) {
		return true;
	}
	else if (beginYear > endYear) {
		return false;
	}
	else if (beginMonth > endMonth) {
		return false;
	}
	else if (beginMonth < endMonth) {
		return true;
	}
	else if (beginDay > endDay) {
		return false;
	}
	else if (beginDay < endDay) {
		return true;
	}

	return false;
}

export function validateUUID(
	value: unknown, field: string, required = false
): void {
	if (_.isNil(value)) {
		if (required) {
			throw new ValidationError('Required value is missing', field);
		}
		return;
	}

	if (!validator.isUUID(value)) {
		throw new ValidationError('Value is not a valid UUID', field, value);
	}
}
