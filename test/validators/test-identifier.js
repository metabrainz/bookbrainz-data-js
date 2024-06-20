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
	IDENTIFIER_TYPES, INVALID_IDENTIFIER, INVALID_IDENTIFIERS, VALID_IDENTIFIER,
	VALID_IDENTIFIERS
} from './data';
import {
	testValidatePositiveIntegerFunc, testValidateStringFunc
} from './helpers';
import {
	validateIdentifier, validateIdentifierType, validateIdentifierValue,
	validateIdentifiers
} from '../../lib/validators/common';
import {ValidationError} from '../../lib/validators/base';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';


chai.use(chaiAsPromised);
const {expect} = chai;


function describeValidateIdentifierValueNoIdentifierTypes() {
	testValidateStringFunc(validateIdentifierValue);
}

function describeValidateIdentifierValueWithIdentifierTypes() {
	it('should pass a non-empty string value that matches the validation regular expression', () => {
		expect(() => validateIdentifierValue(
			'B076KQRJV1', 1, IDENTIFIER_TYPES
		)).to.not.throw();
	});

	it('should reject a non-empty string value that doesn\'t match the validation regular expression', () => {
		expect(() => validateIdentifierValue('B076K1', 1, IDENTIFIER_TYPES)).to.throw(ValidationError);
	});

	it('should reject an empty string', () => {
		expect(() => validateIdentifierValue('', 1, IDENTIFIER_TYPES)).to.throw(ValidationError);
	});

	it('should reject any non-string value', () => {
		expect(() => validateIdentifierValue({}, 1, IDENTIFIER_TYPES)).to.throw(ValidationError);
	});

	it('should reject a null value', () => {
		expect(() => validateIdentifierValue(null, 1, IDENTIFIER_TYPES)).to.throw(ValidationError);
	});
}

function describeValidateIdentifierTypeNoIdentifierTypes() {
	testValidatePositiveIntegerFunc(validateIdentifierType);
}

function describeValidateIdentifierTypeWithIdentifierTypes() {
	it('should pass any positive integer value which is a type ID', () => {
		expect(() => validateIdentifierType(1, IDENTIFIER_TYPES)).to.not.throw();
	});

	it('should reject any positive integer value which isn\'t a type ID', () => {
		expect(() => validateIdentifierType(1000, IDENTIFIER_TYPES)).to.throw(ValidationError);
	});

	it('should reject zero', () => {
		expect(() => validateIdentifierType(0, IDENTIFIER_TYPES)).to.throw(ValidationError);
	});

	it('should reject an negative number', () => {
		expect(() => validateIdentifierType(-1, IDENTIFIER_TYPES)).to.throw(ValidationError);
	});

	it('should reject any non-number value', () => {
		expect(() => validateIdentifierType({}, IDENTIFIER_TYPES)).to.throw(ValidationError);
	});

	it('should reject a null value', () => {
		expect(() => validateIdentifierType(null, IDENTIFIER_TYPES)).to.throw(ValidationError);
	});
}

function describeValidateIdentifier() {
	it('should pass a valid Object', () => {
		expect(() => validateIdentifier(VALID_IDENTIFIER, IDENTIFIER_TYPES)).to.not.throw();
	});

	it('should pass a valid Immutable.Map', () => {
		expect(() => validateIdentifier(
			Immutable.fromJS(VALID_IDENTIFIER), IDENTIFIER_TYPES
		)).to.not.throw();
	});

	it('should reject an Object with an invalid value', () => {
		expect(() => validateIdentifier(
			{...VALID_IDENTIFIER, value: 'B076QRJV1'}, IDENTIFIER_TYPES
		)).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid type', () => {
		expect(() => validateIdentifier(
			{...VALID_IDENTIFIER, type: 5},
			IDENTIFIER_TYPES
		)).to.throw(ValidationError);
	});

	it('should reject an invalid Immutable.Map', () => {
		expect(() => validateIdentifier(
			Immutable.fromJS(INVALID_IDENTIFIER),
			IDENTIFIER_TYPES
		)).to.throw(ValidationError);
	});

	it('should reject any other non-null data type', () => {
		expect(() => validateIdentifier(1, IDENTIFIER_TYPES)).to.throw(ValidationError);
	});

	it('should reject a null value', () => {
		expect(() => validateIdentifier(null, IDENTIFIER_TYPES)).to.throw(ValidationError);
	});
}


function describeValidateIdentifiers() {
	it('should pass an Object of two valid Objects', () => {
		expect(() => validateIdentifiers(VALID_IDENTIFIERS, IDENTIFIER_TYPES)).to.not.throw();
	});

	it('should pass an Immutable.Map of valid Immutable.Maps', () => {
		expect(() => validateIdentifiers(
			Immutable.fromJS(VALID_IDENTIFIERS),
			IDENTIFIER_TYPES
		)).to.not.throw();
	});

	it('should pass an empty Object', () => {
		expect(() => validateIdentifiers({}, IDENTIFIER_TYPES)).to.not.throw();
	});

	it('should pass an empty Immutable.Map', () => {
		expect(() => validateIdentifiers(Immutable.Map(), IDENTIFIER_TYPES)).to.not.throw();
	});

	it('should reject an Object containing one invalid Object', () => {
		expect(() => validateIdentifiers(
			INVALID_IDENTIFIERS,
			IDENTIFIER_TYPES
		)).to.throw(ValidationError);
	});

	it('should reject an Immutable.Map containing one invalid Immutable.Map', () => {
		expect(() => validateIdentifiers(
			Immutable.fromJS(INVALID_IDENTIFIERS),
			IDENTIFIER_TYPES
		)).to.throw(ValidationError);
	});

	it('should reject any other non-null data type', () => {
		expect(() => validateIdentifiers(1, IDENTIFIER_TYPES)).to.throw(ValidationError);
	});

	it('should reject a null value', () => {
		expect(() => validateIdentifiers(null, IDENTIFIER_TYPES)).to.throw(ValidationError);
	});
}


function tests() {
	describe(
		'validateIdentifierValue with no type set',
		describeValidateIdentifierValueNoIdentifierTypes
	);
	describe(
		'validateIdentifierValue with type set',
		describeValidateIdentifierValueWithIdentifierTypes
	);
	describe(
		'validateIdentifierType with no type set',
		describeValidateIdentifierTypeNoIdentifierTypes
	);
	describe(
		'validateIdentifierType with type set',
		describeValidateIdentifierTypeWithIdentifierTypes
	);
	describe('validateIdentifier', describeValidateIdentifier);
	describe('validateIdentifiers', describeValidateIdentifiers);
}

describe('validateIdentifier* functions', tests);
