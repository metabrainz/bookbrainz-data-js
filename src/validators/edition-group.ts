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


import {ValidationError, get, validatePositiveInteger} from './base';
import {
	validateAliases,
	validateAuthorCreditSection,
	validateAuthorCreditSectionMerge,
	validateIdentifiers,
	validateNameSection,
	validateSubmissionSection
} from './common';

import type {IdentifierTypeWithIdT} from '../types/identifiers';
import _ from 'lodash';
import {isIterable} from '../util';


export function validateEditionGroupSectionType(value: any): void {
	validatePositiveInteger(value, 'editionGroupSection.type');
}

export function validateEditionGroupSection(data: any): void {
	validateEditionGroupSectionType(get(data, 'type', null));
}

export function validateEditionGroup(
	formData: any, identifierTypes?: Array<IdentifierTypeWithIdT> | null | undefined,
	isMerge?: boolean
): void {
	const authorCreditEnable = isIterable(formData) ?
		formData.getIn(['editionGroupSection', 'authorCreditEnable'], true) :
		get(formData, 'editionGroupSection.authorCreditEnable', true);
	if (isMerge) {
		validateAuthorCreditSectionMerge(get(formData, 'authorCredit', {}));
	}
	else if (!authorCreditEnable) {
		const emptyAuthorCredit = isIterable(formData) ? formData.get('authorCreditEditor')?.size === 0 :
			_.size(get(formData, 'authorCreditEditor', {})) === 0;
		if (!emptyAuthorCredit) {
			throw new ValidationError('Disabled author credit has to be empty', 'authorCreditEditor');
		}
	}
	else {
		validateAuthorCreditSection(get(formData, 'authorCreditEditor', {}), authorCreditEnable);
	}

	validateAliases(get(formData, 'aliasEditor', {}));
	validateIdentifiers(get(formData, 'identifierEditor', {}), identifierTypes);
	validateNameSection(get(formData, 'nameSection', {}));
	validateEditionGroupSection(get(formData, 'editionGroupSection', {}));
	validateSubmissionSection(get(formData, 'submissionSection', {}));
}

export type EditionGroupSection = {
	authorCreditEnable?: boolean;
	type?: number;
};
