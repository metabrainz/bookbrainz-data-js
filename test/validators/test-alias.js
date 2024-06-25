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
	INVALID_ALIAS, INVALID_ALIASES, VALID_ALIAS, VALID_ALIASES
} from './data';
import {
	testValidateBooleanFunc, testValidatePositiveIntegerFunc,
	testValidateStringFunc
} from './helpers';
import {
	validateAlias, validateAliasDefault, validateAliasLanguage, validateAliasName,
	validateAliasPrimary, validateAliasSortName, validateAliases
} from '../../lib/validators/common';
import {ValidationError} from '../../lib/validators/base';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';


chai.use(chaiAsPromised);
const {expect} = chai;


function describeValidateAliasName() {
	testValidateStringFunc(validateAliasName);
}

function describeValidateAliasSortName() {
	testValidateStringFunc(validateAliasSortName);
}

function describeValidateAliasLanguage() {
	testValidatePositiveIntegerFunc(validateAliasLanguage);
}

function describeValidateAliasPrimary() {
	testValidateBooleanFunc(validateAliasPrimary);
}

function describeValidateAliasDefault() {
	testValidateBooleanFunc(validateAliasDefault, false);
}

function describeValidateAlias() {
	it('should pass a valid Object', () => {
		expect(() => validateAlias(VALID_ALIAS)).to.not.throw();
	});

	it('should pass a valid Object with a default flag', () => {
		expect(() => validateAlias({...VALID_ALIAS, default: true})).to.not.throw();
	});

	it('should pass a valid Immutable.Map', () => {
		expect(() => validateAlias(Immutable.fromJS(VALID_ALIAS))).to.not.throw();
	});

	it('should reject an Object with an invalid name', () => {
		expect(() => validateAlias({...VALID_ALIAS, name: null})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid sort name', () => {
		expect(() => validateAlias({...VALID_ALIAS, sortName: null})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid language', () => {
		expect(() => validateAlias({...VALID_ALIAS, language: null})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid primary', () => {
		expect(() => validateAlias({...VALID_ALIAS, primary: null})).to.throw(ValidationError);
	});

	it('should reject an invalid Immutable.Map', () => {
		expect(() => validateAlias(Immutable.fromJS(INVALID_ALIAS))).to.throw(ValidationError);
	});

	it('should reject any other non-null data type', () => {
		expect(() => validateAlias(1)).to.throw(ValidationError);
	});

	it('should reject a null value', () => {
		expect(() => validateAlias(null)).to.throw(ValidationError);
	});
}


function describeValidateAliases() {
	it('should pass an Object of two valid Objects', () => {
		expect(() => validateAliases(VALID_ALIASES)).to.not.throw();
	});

	it('should pass an Immutable.Map of valid Immutable.Maps', () => {
		expect(() => validateAliases(Immutable.fromJS(VALID_ALIASES))).to.not.throw();
	});

	it('should pass an empty Object', () => {
		expect(() => validateAliases({})).to.not.throw();
	});

	it('should pass an empty Immutable.Map', () => {
		expect(() => validateAliases(Immutable.Map())).to.not.throw();
	});

	it('should reject an Object containing one invalid Object', () => {
		expect(() => validateAliases(INVALID_ALIASES)).to.throw(ValidationError);
	});

	it('should reject an Immutable.Map containing one invalid Immutable.Map', () => {
		expect(() => validateAliases(Immutable.fromJS(INVALID_ALIASES))).to.throw(ValidationError);
	});

	it('should reject any other non-null data type', () => {
		expect(() => validateAliases(1)).to.throw(ValidationError);
	});

	it('should reject a null value', () => {
		expect(() => validateAliases(null)).to.throw(ValidationError);
	});
}

function tests() {
	describe('validateAliasName', describeValidateAliasName);
	describe('validateAliasSortName', describeValidateAliasSortName);
	describe('validateAliasLanguage', describeValidateAliasLanguage);
	describe('validateAlias', describeValidateAlias);
	describe('validateAliasPrimary', describeValidateAliasPrimary);
	describe('validateAliasDefault', describeValidateAliasDefault);
	describe('validateAliases', describeValidateAliases);
}

describe('validateAlias* functions', tests);
