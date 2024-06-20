/*
 * Copyright (C) 2021 Akash Gupta
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
	validateSeriesSection,
	validateSeriesSectionEntityType,
	validateSeriesSectionOrderingType
} from '../../lib/validators/series';

import {ValidationError} from '../../lib/validators/base';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {testValidatePositiveIntegerFunc} from './helpers';


chai.use(chaiAsPromised);
const {expect} = chai;


const VALID_SERIES_TYPE = 'Author';
const INVALID_SERIES_TYPE = 'XYZ';

function describeValidateSeriesSectionOrderingType() {
	testValidatePositiveIntegerFunc(validateSeriesSectionOrderingType, true);
}

function describeValidateSeriesSectionEntityType() {
	it('should return true if passed a valid series type', () => {
		expect(() => validateSeriesSectionEntityType(VALID_SERIES_TYPE)).to.not.throw();
	});
	it('should return false if passed a invalid series type', () => {
		expect(() => validateSeriesSectionEntityType(INVALID_SERIES_TYPE)).to.throw(ValidationError);
	});
}

const VALID_SERIES_SECTION = {
	orderType: 1,
	seriesType: VALID_SERIES_TYPE
};
const INVALID_SERIES_SECTION = {...VALID_SERIES_SECTION, seriesType: INVALID_SERIES_TYPE};

function describeValidateSeriesSection() {
	it('should pass a valid Object', () => {
		expect(() => validateSeriesSection(VALID_SERIES_SECTION)).to.not.throw();
	});

	it('should pass a valid Immutable.Map', () => {
		expect(() => validateSeriesSection(
			Immutable.fromJS(VALID_SERIES_SECTION)
		)).to.not.throw();
	});

	it('should reject an Object with an invalid ordering type', () => {
		expect(() => validateSeriesSection({
			...VALID_SERIES_SECTION,
			orderType: {}
		})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid series type', () => {
		expect(() => validateSeriesSection({
			...VALID_SERIES_SECTION,
			seriesType: INVALID_SERIES_TYPE
		})).to.throw(ValidationError);
	});

	it('should reject an invalid Immutable.Map', () => {
		expect(() => validateSeriesSection(
			Immutable.fromJS(INVALID_SERIES_SECTION)
		)).to.throw(ValidationError);
	});

	it('should reject any other non-null data type', () => {
		expect(() => validateSeriesSection(1)).to.throw(ValidationError);
	});

	it('should reject a null value', () => {
		expect(() => validateSeriesSection(null)).to.throw(ValidationError);
	});
}

function describeValidateForm() {
	const validForm = {
		aliasEditor: VALID_ALIASES,
		identifierEditor: VALID_IDENTIFIERS,
		nameSection: VALID_NAME_SECTION,
		seriesSection: VALID_SERIES_SECTION,
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

	it('should reject an Object with an invalid series section', () => {
		expect(() => validateForm(
			{
				...validForm,
				seriesSection: INVALID_SERIES_SECTION
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
		'validateSeriesSectionOrderingType',
		describeValidateSeriesSectionOrderingType
	);
	describe(
		'validateSeriesSectionEntityType',
		describeValidateSeriesSectionEntityType
	);
	describe(
		'validateSeriesSection',
		describeValidateSeriesSection
	);
	describe(
		'validateForm',
		describeValidateForm
	);
}

describe('validateSeriesSection* functions', tests);
