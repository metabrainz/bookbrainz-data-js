/*
 * Copyright (C) 2017  Ben Ockmore
 *               2024  David Kellner
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


import {
	type AreaStub,
	validateAliases,
	validateIdentifiers,
	validateNameSection,
	validateSubmissionSection
} from './common';
import {ValidationError, dateIsBefore, get, validateDate, validatePositiveInteger} from './base';

import type {IdentifierTypeWithIdT} from '../types/identifiers';
import _ from 'lodash';
import {labelsForAuthor} from '../func/author';


export function validateAuthorSectionBeginArea(value: any): void {
	if (!value) {
		return;
	}

	validatePositiveInteger(get(value, 'id', null), 'authorSection.beginArea.id', true);
}

export function validateAuthorSectionBeginDate(value: any) {
	validateDate(value, 'authorSection.beginDate');
}

export function validateAuthorSectionEndArea(value: any): void {
	if (!value) {
		return;
	}

	validatePositiveInteger(get(value, 'id', null), 'authorSection.endArea.id', true);
}

export function validateAuthorSectionEndDate(
	beginValue: any, endValue: any, authorType?: string
): void {
	validateDate(endValue, 'authorSection.endDate');
	try {
		validateDate(beginValue, 'beginDate');
	}
	catch (error) {
		// Ignore invalid begin date during end date validation.
		// TODO: It probably makes more sense to drop these silly test cases?
		return;
	}

	const isGroup = authorType === 'Group';
	const {beginDateLabel, endDateLabel} = labelsForAuthor(isGroup);
	if (!dateIsBefore(beginValue, endValue)) {
		throw new ValidationError(`${endDateLabel} must be greater than ${beginDateLabel}`);
	}
}

export function validateAuthorSectionEnded(value: any): void {
	if (!(_.isNull(value) || _.isBoolean(value))) {
		throw new ValidationError('Value has to be a boolean or `null`', 'authorSection.ended');
	}
}

export function validateAuthorSectionType(value: any): void {
	validatePositiveInteger(value, 'authorSection.type');
}

export function validateAuthorSectionGender(value: any): void {
	validatePositiveInteger(value, 'authorSection.gender');
}

export function validateAuthorSection(data: any): void {
	validateAuthorSectionBeginArea(get(data, 'beginArea', null));
	validateAuthorSectionBeginDate(get(data, 'beginDate', ''));
	validateAuthorSectionEndArea(get(data, 'endArea', null));
	validateAuthorSectionEndDate(get(data, 'beginDate', ''), get(data, 'endDate', ''));
	validateAuthorSectionEnded(get(data, 'ended', null));
	validateAuthorSectionType(get(data, 'gender', null));
	validateAuthorSectionType(get(data, 'type', null));
}

export function validateAuthor(
	formData: any, identifierTypes?: Array<IdentifierTypeWithIdT> | null | undefined
): void {
	validateAliases(get(formData, 'aliasEditor', {}));
	validateIdentifiers(get(formData, 'identifierEditor', {}), identifierTypes);
	validateNameSection(get(formData, 'nameSection', {}));
	validateAuthorSection(get(formData, 'authorSection', {}));
	validateSubmissionSection(get(formData, 'submissionSection', {}));
}

export type AuthorSection = Partial<{
	beginArea: AreaStub;
	beginDate: string;
	endArea: AreaStub;
	endDate: string;
	ended: boolean;
	gender: number;
	type: number;
}>;
