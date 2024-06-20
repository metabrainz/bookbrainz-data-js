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
	EMPTY_SUBMISSION_SECTION,
	IDENTIFIER_TYPES,
	INVALID_ALIASES,
	INVALID_IDENTIFIERS,
	INVALID_NAME_SECTION,
	VALID_ALIASES,
	VALID_IDENTIFIERS,
	VALID_NAME_SECTION,
	VALID_SUBMISSION_SECTION
} from './data';
import {
	validateForm,
	validateWorkSection,
	validateWorkSectionLanguage,
	validateWorkSectionType
} from '../../lib/validators/work';

import {ValidationError} from '../../lib/validators/base';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {testValidatePositiveIntegerFunc} from './helpers';


chai.use(chaiAsPromised);
const {expect} = chai;


function describeValidateWorkSectionLanguage() {
	const validLanguage = {value: 1};

	it('should pass a valid Object', () => {
		expect(() => validateWorkSectionLanguage(validLanguage)).to.not.throw();
	});

	it('should pass a valid Immutable.Map', () => {
		expect(() => validateWorkSectionLanguage(
			Immutable.fromJS(validLanguage)
		)).to.not.throw();
	});

	it('should reject an Object with an invalid value', () => {
		expect(() => validateWorkSectionLanguage(
			{...validLanguage, value: 'bad'}
		)).to.throw(ValidationError);
	});

	const invalidLanguage = {value: 'bad'};

	it('should reject an invalid Immutable.Map', () => {
		expect(() => validateWorkSectionLanguage(
			Immutable.fromJS(invalidLanguage)
		)).to.throw(ValidationError);
	});

	it('should reject any other non-null data type', () => {
		expect(() => validateWorkSectionLanguage(1)).to.throw(ValidationError);
	});

	it('should pass a null value', () => {
		expect(() => validateWorkSectionLanguage(null)).to.not.throw();
	});
}

function describeValidateWorkSectionType() {
	testValidatePositiveIntegerFunc(validateWorkSectionType, false);
}

const VALID_WORK_SECTION = {
	language: {value: 1},
	type: 1
};
const INVALID_WORK_SECTION = {...VALID_WORK_SECTION, type: {}};

function describeValidateWorkSection() {
	it('should pass a valid Object', () => {
		expect(() => validateWorkSection(VALID_WORK_SECTION)).to.not.throw();
	});

	it('should pass a valid Immutable.Map', () => {
		expect(() => validateWorkSection(
			Immutable.fromJS(VALID_WORK_SECTION)
		)).to.not.throw();
	});

	it('should reject an Object with an invalid language', () => {
		expect(() => validateWorkSection({
			...VALID_WORK_SECTION,
			language: {value: 'bad'}
		})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid type', () => {
		expect(() => validateWorkSection({
			...VALID_WORK_SECTION,
			type: {}
		})).to.throw(ValidationError);
	});

	it('should reject an invalid Immutable.Map', () => {
		expect(() => validateWorkSection(
			Immutable.fromJS(INVALID_WORK_SECTION)
		)).to.throw(ValidationError);
	});

	it('should pass any other non-null data type', () => {
		expect(() => validateWorkSection(1)).to.not.throw();
	});

	it('should pass a null value', () => {
		expect(() => validateWorkSection(null)).to.not.throw();
	});
}

function describeValidateForm() {
	const validForm = {
		aliasEditor: VALID_ALIASES,
		identifierEditor: VALID_IDENTIFIERS,
		nameSection: VALID_NAME_SECTION,
		submissionSection: VALID_SUBMISSION_SECTION,
		workSection: VALID_WORK_SECTION
	};

	it('should pass a valid Object', () => {
		expect(() => validateForm(validForm, IDENTIFIER_TYPES)).to.not.throw();
	});

	it('should pass a valid Immutable.Map', () => {
		expect(() => validateForm(
			Immutable.fromJS(validForm),
			IDENTIFIER_TYPES
		)).to.not.throw();
	});

	it('should reject an Object with an invalid alias editor', () => {
		expect(() => validateForm(
			{
				...validForm,
				aliasEditor: INVALID_ALIASES
			},
			IDENTIFIER_TYPES
		)).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid identifier editor', () => {
		expect(() => validateForm(
			{
				...validForm,
				identifierEditor: INVALID_IDENTIFIERS
			}, IDENTIFIER_TYPES
		)).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid name section', () => {
		expect(() => validateForm(
			{
				...validForm,
				nameSection: INVALID_NAME_SECTION
			},
			IDENTIFIER_TYPES
		)).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid work section', () => {
		expect(() => validateForm(
			{
				...validForm,
				workSection: INVALID_WORK_SECTION
			},
			IDENTIFIER_TYPES
		)).to.throw(ValidationError);
	});

	it('should pass an Object with an empty submission section', () => {
		expect(() => validateForm(
			{
				...validForm,
				submissionSection: EMPTY_SUBMISSION_SECTION
			},
			IDENTIFIER_TYPES
		)).to.not.throw();
	});

	const invalidForm = {
		...validForm,
		nameSection: INVALID_NAME_SECTION
	};

	it('should reject an invalid Immutable.Map', () => {
		expect(() => validateForm(
			Immutable.fromJS(invalidForm),
			IDENTIFIER_TYPES
		)).to.throw(ValidationError);
	});

	it('should reject any other non-null data type', () => {
		expect(() => validateForm(1, IDENTIFIER_TYPES)).to.throw(ValidationError);
	});

	it('should reject a null value', () => {
		expect(() => validateForm(null, IDENTIFIER_TYPES)).to.throw(ValidationError);
	});
}


function tests() {
	describe(
		'validateWorkSectionLanguage',
		describeValidateWorkSectionLanguage
	);
	describe(
		'validateWorkSectionType',
		describeValidateWorkSectionType
	);
	describe(
		'validateWorkSection',
		describeValidateWorkSection
	);
	describe(
		'validateForm',
		describeValidateForm
	);
}

describe('validateWorkSection* functions', tests);
