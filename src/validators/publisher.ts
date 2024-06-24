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

import {ValidationError, dateIsBefore, get, validateDate, validatePositiveInteger} from './base';
import {
	validateAliases, validateIdentifiers, validateNameSection,
	validateSubmissionSection
} from './common';
import type {IdentifierTypeWithIdT} from '../types/identifiers';
import _ from 'lodash';


export function validatePublisherSectionArea(value: any): void {
	if (!value) {
		return;
	}

	validatePositiveInteger(get(value, 'id', null), 'publisherSection.area', true);
}

export function validatePublisherSectionBeginDate(value: any) {
	validateDate(value, 'publisherSection.beginDate');
}

export function validatePublisherSectionEndDate(
	beginValue: any, endValue: any, ended: boolean
): void {
	if (ended === false) {
		return;
	}
	validateDate(endValue, 'publisherSection.endDate');
	try {
		validateDate(beginValue, 'beginDate');
	}
	catch (error) {
		// Ignore invalid begin date during end date validation.
		// TODO: It probably makes more sense to drop these silly test cases?
		return;
	}

	if (!dateIsBefore(beginValue, endValue)) {
		throw new ValidationError('Dissolved Date must be greater than Founded Date');
	}
}

export function validatePublisherSectionEnded(value: any): void {
	if (!(_.isNull(value) || _.isBoolean(value))) {
		throw new ValidationError('Value has to be a boolean or `null`', 'publisherSection.ended');
	}
}

export function validatePublisherSectionType(value: any): void {
	validatePositiveInteger(value, 'publisherSection.type');
}


export function validatePublisherSection(data: any): void {
	validatePublisherSectionArea(get(data, 'area', null));
	validatePublisherSectionBeginDate(get(data, 'beginDate', ''));
	validatePublisherSectionEndDate(get(data, 'beginDate', ''), get(data, 'endDate', ''), get(data, 'ended', null));
	validatePublisherSectionEnded(get(data, 'ended', null));
	validatePublisherSectionType(get(data, 'type', null));
}

export function validatePublisher(
	formData: any, identifierTypes?: Array<IdentifierTypeWithIdT> | null | undefined
): void {
	validateAliases(get(formData, 'aliasEditor', {}));
	validateIdentifiers(get(formData, 'identifierEditor', {}), identifierTypes);
	validateNameSection(get(formData, 'nameSection', {}));
	validatePublisherSection(get(formData, 'publisherSection', {}));
	validateSubmissionSection(get(formData, 'submissionSection', {}));
}
