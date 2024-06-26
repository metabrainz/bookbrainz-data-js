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
import {INVALID_NAME_SECTION, VALID_NAME_SECTION} from './data';
import {
	testValidatePositiveIntegerFunc, testValidateStringFunc
} from './helpers';
import {
	validateNameSection, validateNameSectionDisambiguation,
	validateNameSectionLanguage, validateNameSectionName,
	validateNameSectionSortName
} from '../../lib/validators/common';
import {ValidationError} from '../../lib/validators/base';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';


chai.use(chaiAsPromised);
const {expect} = chai;


function describeValidateNameSectionName() {
	testValidateStringFunc(validateNameSectionName);
}

function describeValidateNameSectionSortName() {
	testValidateStringFunc(validateNameSectionSortName);
}

function describeValidateNameSectionLanguage() {
	testValidatePositiveIntegerFunc(validateNameSectionLanguage);
}

function describeValidateNameSectionDisambiguation() {
	testValidateStringFunc(validateNameSectionDisambiguation, false);
}


function describeValidateNameSection() {
	it('should pass a valid Object', () => {
		expect(() => validateNameSection(VALID_NAME_SECTION)).to.not.throw();
	});

	it('should pass a valid Immutable.Map', () => {
		expect(() => validateNameSection(
			Immutable.fromJS(VALID_NAME_SECTION)
		)).to.not.throw();
	});

	it('should reject an Object with an invalid name', () => {
		expect(() => validateNameSection({...VALID_NAME_SECTION, name: null})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid sort name', () => {
		expect(() => validateNameSection(
			{...VALID_NAME_SECTION, sortName: null}
		)).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid language', () => {
		expect(() => validateNameSection(
			{...VALID_NAME_SECTION, language: null}
		)).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid disambiguation', () => {
		expect(() => validateNameSection(
			{...VALID_NAME_SECTION, disambiguation: 2}
		)).to.throw(ValidationError);
	});

	it('should reject an invalid Immutable.Map', () => {
		expect(() => validateNameSection(
			Immutable.fromJS(INVALID_NAME_SECTION)
		)).to.throw(ValidationError);
	});

	it('should reject any other non-null data type', () => {
		expect(() => validateNameSection(1)).to.throw(ValidationError);
	});

	it('should reject a null value', () => {
		expect(() => validateNameSection(null)).to.throw(ValidationError);
	});
}


function tests() {
	describe('validateNameSectionName', describeValidateNameSectionName);
	describe(
		'validateNameSectionSortName',
		describeValidateNameSectionSortName
	);
	describe(
		'validateNameSectionLanguage',
		describeValidateNameSectionLanguage
	);
	describe(
		'validateNameSectionDisambiguation',
		describeValidateNameSectionDisambiguation
	);
	describe('validateNameSection', describeValidateNameSection);
}

describe('validateNameSection* functions', tests);
