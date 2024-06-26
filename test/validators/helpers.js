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

import * as Immutable from 'immutable';
import {
	INVALID_AREA, INVALID_BEGIN_DATE_PAIR, INVALID_DATES, INVALID_DATE_PAIR,
	INVALID_END_DATE_PAIR, VALID_AREA, VALID_DATE_PAIR
} from './data';
import {ValidationError} from '../../lib/validators/base';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';


chai.use(chaiAsPromised);
const {expect} = chai;

export function testValidatePositiveIntegerFunc(
	validationFunc, required = true
) {
	it('should pass any positive integer value', () => {
		expect(() => validationFunc(1)).to.not.throw();
	});

	it('should reject zero', () => {
		expect(() => validationFunc(0)).to.throw(ValidationError);
	});

	it('should reject an negative number', () => {
		expect(() => validationFunc(-1)).to.throw(ValidationError);
	});

	it('should reject NaN', () => {
		expect(() => validationFunc(NaN)).to.throw(ValidationError);
	});

	it('should reject any non-number value', () => {
		expect(() => validationFunc({})).to.throw(ValidationError);
	});

	it(`should ${required ? 'reject' : 'pass'} a null value`, () => {
		const expectedTo = expect(() => validationFunc(null)).to;
		required ? expectedTo.throw(ValidationError) : expectedTo.not.throw();
	});
}

export function testValidateStringFunc(
	validationFunc, required = true
) {
	it('should pass any non-empty string value', () => {
		expect(() => validationFunc('test')).to.not.throw();
	});

	it(`should ${required ? 'reject' : 'pass'} an empty string`, () => {
		const expectedTo = expect(() => validationFunc('')).to;
		required ? expectedTo.throw(ValidationError) : expectedTo.not.throw();
	});

	it('should reject any non-string value', () => {
		expect(() => validationFunc({})).to.throw(ValidationError);
	});

	it(`should ${required ? 'reject' : 'pass'} a null value`, () => {
		const expectedTo = expect(() => validationFunc(null)).to;
		required ? expectedTo.throw(ValidationError) : expectedTo.not.throw();
	});
}

export function testValidateBooleanFunc(validationFunc, required = true) {
	it('should pass any boolean value', () => {
		expect(() => validationFunc(true)).to.not.throw();
	});

	it('should reject any non-boolean value', () => {
		expect(() => validationFunc({})).to.throw(ValidationError);
	});

	it(`should ${required ? 'reject' : 'pass'} a null value`, () => {
		const expectedTo = expect(() => validationFunc(null)).to;
		required ? expectedTo.throw(ValidationError) : expectedTo.not.throw();
	});
}

export function testValidateDateFunc(validationFunc, required = true) {
	it('should pass an object containing a valid year value', () => {
		expect(() => validationFunc({day: '', month: '', year: '2017'})).to.not.throw();
	});

	it('should pass an object containing a valid year and month value', () => {
		expect(() => validationFunc({day: '', month: '11', year: '2017'})).to.not.throw();
	});

	it('should pass an object containing a valid year, month and day value', () => {
		expect(() => validationFunc({day: '21', month: '11', year: '2017'})).to.not.throw();
	});

	it('should reject all other forms of invalid dates', () => {
		for (const date of INVALID_DATES) {
			expect(
				() => validationFunc(date),
				`year '${date.year}', month '${date.month}', day '${date.day}'`
			).to.throw(ValidationError);
		}
	});

	it(`should ${required ? 'reject' : 'pass'} an empty value object`,
		() => {
			const expectedTo = expect(() => validationFunc({})).to;
			required ? expectedTo.throw(ValidationError) : expectedTo.not.throw();
		});
}

export function testValidateEndDateFunc(
	endDateValidationFunc
) {
	it('should pass if the begin date occurs before the end one',
		() => {
			expect(() => {
				for (const datePair of VALID_DATE_PAIR) {
					endDateValidationFunc(datePair.first, datePair.second);
				}
			}).to.not.throw();
		});

	it('should reject if the begin date occurs after the end one',
		() => {
			for (const datePair of INVALID_DATE_PAIR) {
				expect(() => endDateValidationFunc(datePair.first, datePair.second)).to.throw(ValidationError);
			}
		});

	it('should pass if the begin date is empty/undefined/invalid',
		() => {
			expect(() => {
				for (const datePair of INVALID_BEGIN_DATE_PAIR) {
					endDateValidationFunc(datePair.first, datePair.second);
				}
			}).to.not.throw();
		});

	it('should reject if the end date is invalid',
		() => {
			for (const datePair of INVALID_END_DATE_PAIR) {
				expect(() => endDateValidationFunc(datePair.first, datePair.second)).to.throw(ValidationError);
			}
		});
}


export function testValidateAreaFunc(validationFunc, required = true) {
	it('should pass a valid Object', () => {
		expect(() => validationFunc(VALID_AREA)).to.not.throw();
	});

	it('should pass a valid Immutable.Map', () => {
		expect(() => validationFunc(
			Immutable.fromJS(VALID_AREA)
		)).to.not.throw();
	});

	it('should reject an Object with an invalid ID', () => {
		expect(() => validationFunc(
			{...VALID_AREA, id: null}
		)).to.throw(ValidationError);
	});

	it('should reject an invalid Immutable.Map', () => {
		expect(() => validationFunc(
			Immutable.fromJS(INVALID_AREA)
		)).to.throw(ValidationError);
	});

	it('should reject any other non-null data type', () => {
		expect(() => validationFunc(1)).to.throw(ValidationError);
	});

	it(`should ${required ? 'reject' : 'pass'} a null value`, () => {
		const expectedTo = expect(() => validationFunc(null)).to;
		required ? expectedTo.throw(ValidationError) : expectedTo.not.throw();
	});
}
