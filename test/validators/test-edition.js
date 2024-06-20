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
	INVALID_AUTHOR_CREDIT_EDITOR,
	INVALID_IDENTIFIERS,
	INVALID_NAME_SECTION,
	VALID_ALIASES,
	VALID_AUTHOR_CREDIT_EDITOR,
	VALID_IDENTIFIERS,
	VALID_NAME_SECTION,
	VALID_SUBMISSION_SECTION
} from './data';
import {
	testValidateDateFunc,
	testValidatePositiveIntegerFunc
} from './helpers';
import {
	validateEditionSection,
	validateEditionSectionDepth,
	validateEditionSectionEditionGroup,
	validateEditionSectionFormat,
	validateEditionSectionHeight,
	validateEditionSectionLanguage,
	validateEditionSectionLanguages,
	validateEditionSectionPages,
	validateEditionSectionPublisher,
	validateEditionSectionReleaseDate,
	validateEditionSectionStatus,
	validateEditionSectionWeight,
	validateEditionSectionWidth,
	validateForm
} from '../../lib/validators/edition';

import {ValidationError} from '../../lib/validators/base';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';


chai.use(chaiAsPromised);
const {expect} = chai;


function describeValidateEditionSectionReleaseDate() {
	testValidateDateFunc(validateEditionSectionReleaseDate, false);
}

function describeValidateEditionSectionDepth() {
	testValidatePositiveIntegerFunc(validateEditionSectionDepth, false);
}

function describeValidateEditionSectionHeight() {
	testValidatePositiveIntegerFunc(validateEditionSectionHeight, false);
}

function describeValidateEditionSectionPages() {
	testValidatePositiveIntegerFunc(validateEditionSectionPages, false);
}

function describeValidateEditionSectionWeight() {
	testValidatePositiveIntegerFunc(validateEditionSectionWeight, false);
}

function describeValidateEditionSectionWidth() {
	testValidatePositiveIntegerFunc(validateEditionSectionWidth, false);
}

function describeValidateEditionSectionFormat() {
	testValidatePositiveIntegerFunc(validateEditionSectionFormat, false);
}

function describeValidateEditionSectionStatus() {
	testValidatePositiveIntegerFunc(validateEditionSectionStatus, false);
}


function describeValidateEditionSectionLanguage() {
	const validLanguage = {value: 1};

	it('should pass a valid Object', () => {
		expect(() => validateEditionSectionLanguage(validLanguage)).to.not.throw();
	});

	it('should pass a valid Immutable.Map', () => {
		expect(() => validateEditionSectionLanguage(
			Immutable.fromJS(validLanguage)
		)).to.not.throw();
	});

	it('should reject an Object with an invalid value', () => {
		expect(() => validateEditionSectionLanguage(
			{...validLanguage, value: null}
		)).to.throw(ValidationError);
	});

	const invalidLanguage = {value: null};

	it('should reject an invalid Immutable.Map', () => {
		expect(() => validateEditionSectionLanguage(
			Immutable.fromJS(invalidLanguage)
		)).to.throw(ValidationError);
	});

	it('should reject any other non-null data type', () => {
		expect(() => validateEditionSectionLanguage(1)).to.throw(ValidationError);
	});

	it('should reject a null value', () => {
		expect(() => validateEditionSectionLanguage(null)).to.throw(ValidationError);
	});
}

const VALID_LANGUAGE = {value: 1};
const VALID_LANGUAGES = [VALID_LANGUAGE, VALID_LANGUAGE];
const INVALID_LANGUAGE = {value: null};
const INVALID_LANGUAGES = [VALID_LANGUAGE, INVALID_LANGUAGE];

function describeValidateEditionSectionLanguages() {
	it('should pass an Array of two valid Objects', () => {
		expect(() => validateEditionSectionLanguages(VALID_LANGUAGES)).to.not.throw();
	});

	it('should pass an Immutable.List of valid Immutable.Maps', () => {
		expect(() => validateEditionSectionLanguages(
			Immutable.fromJS(VALID_LANGUAGES)
		)).to.not.throw();
	});

	it('should pass an empty Array', () => {
		expect(() => validateEditionSectionLanguages([])).to.not.throw();
	});

	it('should pass an empty Immutable.List', () => {
		expect(() => validateEditionSectionLanguages(Immutable.List())).to.not.throw();
	});

	it('should reject an Array containing one invalid Object', () => {
		expect(() => validateEditionSectionLanguages(INVALID_LANGUAGES)).to.throw(ValidationError);
	});

	it('should reject an Immutable.List containing one invalid Immutable.Map', () => {
		expect(() => validateEditionSectionLanguages(
			Immutable.fromJS(INVALID_LANGUAGES)
		)).to.throw(ValidationError);
	});

	it('should reject any other non-null data type', () => {
		expect(() => validateEditionSectionLanguages(1)).to.throw(ValidationError);
	});

	it('should pass a null value', () => {
		expect(() => validateEditionSectionLanguages(null)).to.not.throw();
	});
}

const VALID_PUBLISHERS = {0: {
	id: '21675f5b-e9f8-4a6b-9aac-d3c965aa7d83'
},
1: {
	id: '21675f5b-e9f8-4a6b-9aac-d3c965aa7d84'
}};

const INVALID_PUBLISHERS = {0: {
	id: '21675f5b-e9f8-4a6b-9aac-d3c965aa7d83'
},
1: {
	id: '2'
}};

const VALID_ENTITY = {
	id: '21675f5b-e9f8-4a6b-9aac-d3c965aa7d83'
};
const INVALID_ENTITY = {
	id: '2'
};

function describeValidateEditionSectionEditionGroup() {
	it('should pass a valid Object', () => {
		expect(() => validateEditionSectionEditionGroup(VALID_ENTITY)).to.not.throw();
	});

	it('should pass a valid Immutable.Map', () => {
		expect(() => validateEditionSectionEditionGroup(
			Immutable.fromJS(VALID_ENTITY)
		)).to.not.throw();
	});

	it('should pass a null value', () => {
		expect(() => validateEditionSectionEditionGroup(null)).to.not.throw();
	});

	it('should pass any other non-null data type with no ID', () => {
		expect(() => validateEditionSectionEditionGroup(1)).to.not.throw();
	});

	it('should reject an Object with an invalid ID', () => {
		expect(() => validateEditionSectionEditionGroup(
			{...VALID_ENTITY, id: '2'}
		)).to.throw(ValidationError);
	});

	it('should reject an invalid Immutable.Map', () => {
		expect(() => validateEditionSectionEditionGroup(
			Immutable.fromJS(INVALID_ENTITY)
		)).to.throw(ValidationError);
	});
}

function describeValidateEditionSectionPublisher() {
	it('should pass a valid Object', () => {
		expect(() => validateEditionSectionPublisher(VALID_PUBLISHERS)).to.not.throw();
	});

	it('should pass a valid Immutable.Map', () => {
		expect(() => validateEditionSectionPublisher(
			Immutable.fromJS(VALID_PUBLISHERS)
		)).to.not.throw();
	});

	it('should reject an Object with an invalid ID', () => {
		expect(() => validateEditionSectionPublisher(
			{INVALID_PUBLISHERS}
		)).to.throw(ValidationError);
	});

	it('should reject an invalid Immutable.Map', () => {
		expect(() => validateEditionSectionPublisher(
			Immutable.fromJS(INVALID_ENTITY)
		)).to.throw(ValidationError);
	});

	it('should reject any other non-null data type', () => {
		expect(() => validateEditionSectionPublisher(1)).to.throw(ValidationError);
	});

	it('should pass a null value', () => {
		expect(() => validateEditionSectionPublisher(null)).to.not.throw();
	});
}

const VALID_EDITION_SECTION = {
	depth: 26,
	editionGroup: VALID_ENTITY,
	format: 2,
	height: 24,
	languages: VALID_LANGUAGES,
	pages: 25,
	publisher: VALID_PUBLISHERS,
	releaseDate: {day: '22', month: '12', year: '2017'},
	status: 2,
	weight: 23,
	width: 22
};
const INVALID_EDITION_SECTION = {...VALID_EDITION_SECTION, format: {}};

function describeValidateEditionSection() {
	it('should pass a valid Object', () => {
		expect(() => validateEditionSection(VALID_EDITION_SECTION)).to.not.throw();
	});

	it('should pass a valid Immutable.Map', () => {
		expect(() => validateEditionSection(
			Immutable.fromJS(VALID_EDITION_SECTION)
		)).to.not.throw();
	});

	it('should pass a null value', () => {
		expect(() => validateEditionSection(null)).to.not.throw();
	});

	it('should ignore any other non-null data type', () => {
		expect(() => validateEditionSection(1)).to.not.throw();
	});

	it('should reject an Object with an invalid depth', () => {
		expect(() => validateEditionSection({
			...VALID_EDITION_SECTION,
			depth: 'ashes'
		})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid format', () => {
		expect(() => validateEditionSection({
			...VALID_EDITION_SECTION,
			format: 'to'
		})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid height', () => {
		expect(() => validateEditionSection({
			...VALID_EDITION_SECTION,
			height: 'ashes'
		})).to.throw(ValidationError);
	});

	it('should reject an Object with invalid languages', () => {
		expect(() => validateEditionSection({
			...VALID_EDITION_SECTION,
			languages: INVALID_LANGUAGES
		})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid pages', () => {
		expect(() => validateEditionSection({
			...VALID_EDITION_SECTION,
			pages: 'is'
		})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid edition group', () => {
		expect(() => validateEditionSection({
			...VALID_EDITION_SECTION,
			editionGroup: INVALID_ENTITY
		})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid publisher', () => {
		expect(() => validateEditionSection({
			...VALID_EDITION_SECTION,
			publisher: INVALID_ENTITY
		})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid release date', () => {
		expect(() => validateEditionSection({
			...VALID_EDITION_SECTION,
			releaseDate: {day: '', month: '', year: 'abcd'}
		})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid status', () => {
		expect(() => validateEditionSection({
			...VALID_EDITION_SECTION,
			status: 'life'
		})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid weight', () => {
		expect(() => validateEditionSection({
			...VALID_EDITION_SECTION,
			weight: 'on'
		})).to.throw(ValidationError);
	});

	it('should reject an Object with an invalid width', () => {
		expect(() => validateEditionSection({
			...VALID_EDITION_SECTION,
			width: 'mars?'
		})).to.throw(ValidationError);
	});

	it('should reject an invalid Immutable.Map', () => {
		expect(() => validateEditionSection(
			Immutable.fromJS(INVALID_EDITION_SECTION)
		)).to.throw(ValidationError);
	});
}


function describeValidateForm() {
	const validForm = {
		aliasEditor: VALID_ALIASES,
		authorCreditEditor: VALID_AUTHOR_CREDIT_EDITOR,
		editionSection: VALID_EDITION_SECTION,
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

	it('should pass an Object with an empty author credit editor and AC disabled', () => {
		expect(() => validateForm(
			{
				...validForm,
				authorCreditEditor: {},
				editionSection: {
					...validForm.editionSection,
					authorCreditEnable: false
				}
			},
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

	it('should reject an Object with an invalid author credit editor', () => {
		expect(() => validateForm(
			{
				...validForm,
				authorCreditEditor: INVALID_AUTHOR_CREDIT_EDITOR
			},
			IDENTIFIER_TYPES
		)).to.throw(ValidationError);
	});

	it('should reject an Object with an empty author credit editor', () => {
		expect(() => validateForm(
			{
				...validForm,
				authorCreditEditor: {}
			},
			IDENTIFIER_TYPES
		)).to.throw(ValidationError);
	});

	it('should reject an Object with a non empty author credit editor and AC disabled', () => {
		expect(() => validateForm(
			{
				...validForm,
				authorCreditEditor: VALID_AUTHOR_CREDIT_EDITOR,
				editionSection: {
					...validForm.editionSection,
					authorCreditEnable: false
				}
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

	it('should reject an Object with an invalid edition section', () => {
		expect(() => validateForm(
			{
				...validForm,
				editionSection: INVALID_EDITION_SECTION
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
		'validateEditionSectionReleaseDate',
		describeValidateEditionSectionReleaseDate
	);
	describe(
		'validateEditionSectionDepth',
		describeValidateEditionSectionDepth
	);
	describe(
		'validateEditionSectionHeight',
		describeValidateEditionSectionHeight
	);
	describe(
		'validateEditionSectionPages',
		describeValidateEditionSectionPages
	);
	describe(
		'validateEditionSectionWeight',
		describeValidateEditionSectionWeight
	);
	describe(
		'validateEditionSectionWidth',
		describeValidateEditionSectionWidth
	);
	describe(
		'validateEditionSectionFormat',
		describeValidateEditionSectionFormat
	);
	describe(
		'validateEditionSectionStatus',
		describeValidateEditionSectionStatus
	);
	describe(
		'validateEditionSectionLanguage',
		describeValidateEditionSectionLanguage
	);
	describe(
		'validateEditionSectionLanguages',
		describeValidateEditionSectionLanguages
	);
	describe(
		'validateEditionSectionEditionGroup',
		describeValidateEditionSectionEditionGroup
	);
	describe(
		'validateEditionSectionPublisher',
		describeValidateEditionSectionPublisher
	);
	describe(
		'validateEditionSection',
		describeValidateEditionSection
	);
	describe(
		'validateForm',
		describeValidateForm
	);
}

describe('validateEditionSection* functions', tests);
