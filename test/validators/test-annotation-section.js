/*
 * Copyright (C) 2024  David Kellner
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

import {EMPTY_ANNOTATION_SECTION, VALID_ANNOTATION_SECTION} from './data';
import {
	validateAnnotationSection,
	validateAnnotationSectionContent
} from '../../lib/validators/common';

import {ValidationError} from '../../lib/validators/base';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {testValidateStringFunc} from './helpers';


chai.use(chaiAsPromised);
const {expect} = chai;


function describeValidateAnnotationSectionContent() {
	testValidateStringFunc(validateAnnotationSectionContent, false);
}


function describeValidateAnnotationSection() {
	it('should pass a valid Object', () => {
		expect(() => validateAnnotationSection(VALID_ANNOTATION_SECTION)).to.not.throw();
	});

	it('should pass a valid Immutable.Map', () => {
		expect(() => validateAnnotationSection(
			Immutable.fromJS(VALID_ANNOTATION_SECTION)
		)).to.not.throw();
	});

	it('should pass an Object with an empty content', () => {
		expect(() => validateAnnotationSection(
			{...VALID_ANNOTATION_SECTION, content: null}
		)).to.not.throw();
	});

	it('should pass an empty content Immutable.Map', () => {
		expect(() => validateAnnotationSection(
			Immutable.fromJS(EMPTY_ANNOTATION_SECTION)
		)).to.not.throw();
	});

	it('should reject any other non-null data type', () => {
		expect(() => validateAnnotationSection(
			{...VALID_ANNOTATION_SECTION, content: 1}
		)).to.throw(ValidationError);
	});

	it('should pass a null value', () => {
		expect(() => validateAnnotationSection(null)).to.not.throw();
	});
}


function tests() {
	describe(
		'validateAnnotationSectionContent',
		describeValidateAnnotationSectionContent
	);
	describe('validateAnnotationSection', describeValidateAnnotationSection);
}

describe('validateAnnotationSection* functions', tests);
