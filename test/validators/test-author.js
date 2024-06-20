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
	testValidateAreaFunc,
	testValidateBooleanFunc,
	testValidateDateFunc,
	testValidateEndDateFunc,
	testValidatePositiveIntegerFunc
} from './helpers';
import {
	validateAuthorSection,
	validateAuthorSectionBeginArea,
	validateAuthorSectionBeginDate,
	validateAuthorSectionEndArea,
	validateAuthorSectionEndDate,
	validateAuthorSectionEnded,
	validateAuthorSectionGender,
	validateAuthorSectionType,
	validateForm
} from '../../lib/validators/author';

import {ValidationError} from '../../lib/validators/base';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';


chai.use(chaiAsPromised);
const {expect} = chai;


function describeValidateAuthorSectionBeginArea() {
	testValidateAreaFunc(validateAuthorSectionBeginArea, false);
}

function describeValidateAuthorSectionEndArea() {
	testValidateAreaFunc(validateAuthorSectionEndArea, false);
}

function describeValidateAuthorSectionBeginDate() {
	testValidateDateFunc(validateAuthorSectionBeginDate, false);
}

function describeValidateAuthorSectionEndDate() {
	testValidateEndDateFunc(validateAuthorSectionEndDate, false);
}

function describeValidateAuthorSectionEnded() {
	testValidateBooleanFunc(validateAuthorSectionEnded, false);
}

function describeValidateAuthorSectionType() {
	testValidatePositiveIntegerFunc(validateAuthorSectionType, false);
}

function describeValidateAuthorSectionGender() {
	testValidatePositiveIntegerFunc(validateAuthorSectionGender, false);
}

const VALID_AUTHOR_SECTION = {
	beginArea: null,
	beginDate: '',
	endArea: null,
	endDate: '',
	ended: true,
	gender: 1,
	type: 1
};
const INVALID_AUTHOR_SECTION = {...VALID_AUTHOR_SECTION, type: {}};

function describeValidateAuthorSection() {
	it('should pass a valid Object', () => {
		expect(() => validateAuthorSection(VALID_AUTHOR_SECTION)).to.not.throw();
	});

	it('should pass a valid Immutable.Map', () => {
		expect(() => validateAuthorSection(
			Immutable.fromJS(VALID_AUTHOR_SECTION)
		)).to.not.throw();
	});

	it('should reject an Object with an invalid area', () => {
		expect(() => validateAuthorSection({
			...VALID_AUTHOR_SECTION,
			beginArea: {id: null}
		})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid begin date', () => {
		expect(() => validateAuthorSection({
			...VALID_AUTHOR_SECTION,
			beginDate: {day: '100', month: '21', year: '2012'}
		})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid area', () => {
		expect(() => validateAuthorSection({
			...VALID_AUTHOR_SECTION,
			endArea: {id: null}
		})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid end date', () => {
		expect(() => validateAuthorSection({
			...VALID_AUTHOR_SECTION,
			endDate: {day: '', month: '', year: 'aaaa'}
		})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid ended flag', () => {
		expect(() => validateAuthorSection({
			...VALID_AUTHOR_SECTION,
			ended: 1
		})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid type', () => {
		expect(() => validateAuthorSection({
			...VALID_AUTHOR_SECTION,
			type: {}
		})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid gender', () => {
		expect(() => validateAuthorSection({
			...VALID_AUTHOR_SECTION,
			gender: {}
		})).to.throw(ValidationError);
	});

	it('should reject an invalid Immutable.Map', () => {
		expect(() => validateAuthorSection(
			Immutable.fromJS(INVALID_AUTHOR_SECTION)
		)).to.throw(ValidationError);
	});

	it('should pass any other non-null data type', () => {
		expect(() => validateAuthorSection(1)).to.not.throw();
	});

	it('should pass a empty value  object', () => {
		expect(() => validateAuthorSection({day: '', month: '', year: ''})).to.not.throw();
	});
}


function describeValidateForm() {
	const validForm = {
		aliasEditor: VALID_ALIASES,
		authorSection: VALID_AUTHOR_SECTION,
		identifierEditor: VALID_IDENTIFIERS,
		nameSection: VALID_NAME_SECTION,
		submissionSection: VALID_SUBMISSION_SECTION
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

	it('should reject an Object with an invalid author section', () => {
		expect(() => validateForm(
			{
				...validForm,
				authorSection: INVALID_AUTHOR_SECTION
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
		authorSection: INVALID_AUTHOR_SECTION

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
		'validateAuthorSectionBeginArea',
		describeValidateAuthorSectionBeginArea
	);
	describe(
		'validateAuthorSectionBeginDate',
		describeValidateAuthorSectionBeginDate
	);
	describe(
		'validateAuthorSectionEndArea',
		describeValidateAuthorSectionEndArea
	);
	describe(
		'validateAuthorSectionEndDate',
		describeValidateAuthorSectionEndDate
	);
	describe(
		'validateAuthorSectionEnded',
		describeValidateAuthorSectionEnded
	);
	describe(
		'validateAuthorSectionGender',
		describeValidateAuthorSectionGender
	);
	describe(
		'validateAuthorSectionType',
		describeValidateAuthorSectionType
	);
	describe(
		'validateAuthorSection',
		describeValidateAuthorSection
	);
	describe(
		'validateForm',
		describeValidateForm
	);
}

describe('validateAuthorSection* functions', tests);
