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
	validatePublisher,
	validatePublisherSection,
	validatePublisherSectionArea,
	validatePublisherSectionBeginDate,
	validatePublisherSectionEndDate,
	validatePublisherSectionEnded,
	validatePublisherSectionType
} from '../../lib/validators/publisher';

import {ValidationError} from '../../lib/validators/base';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';


chai.use(chaiAsPromised);
const {expect} = chai;


function describeValidatePublisherSectionArea() {
	testValidateAreaFunc(validatePublisherSectionArea, false);
}

function describeValidatePublisherSectionBeginDate() {
	testValidateDateFunc(validatePublisherSectionBeginDate, false);
}

function describeValidatePublisherSectionEndDate() {
	testValidateEndDateFunc(validatePublisherSectionEndDate, false);
}

function describeValidatePublisherSectionEnded() {
	testValidateBooleanFunc(validatePublisherSectionEnded, false);
}

function describeValidatePublisherSectionType() {
	testValidatePositiveIntegerFunc(validatePublisherSectionType, false);
}

const VALID_PUBLISHER_SECTION = {
	area: null,
	beginDate: '',
	endDate: '',
	ended: true,
	type: 1
};
const INVALID_PUBLISHER_SECTION = {...VALID_PUBLISHER_SECTION, type: {}};

function describeValidatePublisherSection() {
	it('should pass a valid Object', () => {
		expect(() => validatePublisherSection(VALID_PUBLISHER_SECTION)).to.not.throw();
	});

	it('should pass a valid Immutable.Map', () => {
		expect(() => validatePublisherSection(
			Immutable.fromJS(VALID_PUBLISHER_SECTION)
		)).to.not.throw();
	});

	it('should reject an Object with an invalid area', () => {
		expect(() => validatePublisherSection({
			...VALID_PUBLISHER_SECTION,
			area: {id: null}
		})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid begin date', () => {
		expect(() => validatePublisherSection({
			...VALID_PUBLISHER_SECTION,
			beginDate: {day: '', month: '19', year: '2019'}
		})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid end date', () => {
		expect(() => validatePublisherSection({
			...VALID_PUBLISHER_SECTION,
			endDate: {day: '', month: '19', year: '2019'}
		})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid ended flag', () => {
		expect(() => validatePublisherSection({
			...VALID_PUBLISHER_SECTION,
			ended: 1
		})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid type', () => {
		expect(() => validatePublisherSection({
			...VALID_PUBLISHER_SECTION,
			type: {}
		})).to.throw(ValidationError);
	});

	it('should reject an invalid Immutable.Map', () => {
		expect(() => validatePublisherSection(
			Immutable.fromJS(INVALID_PUBLISHER_SECTION)
		)).to.throw(ValidationError);
	});

	it('should pass any other non-null data type', () => {
		expect(() => validatePublisherSection(1)).to.not.throw();
	});

	it('should pass a null value', () => {
		expect(() => validatePublisherSection({})).to.not.throw();
	});
}


function describeValidateForm() {
	const validForm = {
		aliasEditor: VALID_ALIASES,
		identifierEditor: VALID_IDENTIFIERS,
		nameSection: VALID_NAME_SECTION,
		publisherSection: VALID_PUBLISHER_SECTION,
		submissionSection: VALID_SUBMISSION_SECTION
	};

	it('should pass a valid Object', () => {
		expect(() => validatePublisher(validForm, IDENTIFIER_TYPES)).to.not.throw();
	});

	it('should pass a valid Immutable.Map', () => {
		expect(() => validatePublisher(
			Immutable.fromJS(validForm),
			IDENTIFIER_TYPES
		)).to.not.throw();
	});

	it('should reject an Object with an invalid alias editor', () => {
		expect(() => validatePublisher(
			{
				...validForm,
				aliasEditor: INVALID_ALIASES
			},
			IDENTIFIER_TYPES
		)).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid identifier editor', () => {
		expect(() => validatePublisher(
			{
				...validForm,
				identifierEditor: INVALID_IDENTIFIERS
			}, IDENTIFIER_TYPES
		)).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid name section', () => {
		expect(() => validatePublisher(
			{
				...validForm,
				nameSection: INVALID_NAME_SECTION
			},
			IDENTIFIER_TYPES
		)).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid publisher section', () => {
		expect(() => validatePublisher(
			{
				...validForm,
				publisherSection: INVALID_PUBLISHER_SECTION
			},
			IDENTIFIER_TYPES
		)).to.throw(ValidationError);
	});

	it('should pass an Object with an empty submission section', () => {
		expect(() => validatePublisher(
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
		expect(() => validatePublisher(
			Immutable.fromJS(invalidForm),
			IDENTIFIER_TYPES
		)).to.throw(ValidationError);
	});

	it('should reject any other non-null data type', () => {
		expect(() => validatePublisher(1, IDENTIFIER_TYPES)).to.throw(ValidationError);
	});

	it('should reject a null value', () => {
		expect(() => validatePublisher(null, IDENTIFIER_TYPES)).to.throw(ValidationError);
	});
}


function tests() {
	describe(
		'validatePublisherSectionArea',
		describeValidatePublisherSectionArea
	);
	describe(
		'validatePublisherSectionBeginDate',
		describeValidatePublisherSectionBeginDate
	);
	describe(
		'validatePublisherSectionEndDate',
		describeValidatePublisherSectionEndDate
	);
	describe(
		'validatePublisherSectionEnded',
		describeValidatePublisherSectionEnded
	);
	describe(
		'validatePublisherSectionType',
		describeValidatePublisherSectionType
	);
	describe(
		'validatePublisherSection',
		describeValidatePublisherSection
	);
	describe(
		'validateForm',
		describeValidateForm
	);
}

describe('validatePublisherSection* functions', tests);
