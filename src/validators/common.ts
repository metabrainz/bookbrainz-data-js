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

import {
	ValidationError,
	get,
	getIn,
	validateOptionalString,
	validatePositiveInteger,
	validateRequiredString,
	validateUUID
} from './base';

import type {IdentifierTypeWithIdT} from '../types/identifiers';
import _ from 'lodash';
import {isIterable} from '../util';


export function validateMultiple(
	values: any[],
	validationFunction: (value: any, ...rest: any[]) => void,
	additionalArgs?: any,
	requiresOneOrMore?: boolean
): void {
	if (requiresOneOrMore && _.isEmpty(values)) {
		throw new ValidationError('At least one value is required');
	}

	if (!_.isObject(values)) {
		throw new ValidationError('Value is not an object');
	}

	for (const value of isIterable(values) ? values.values() : Object.values(values)) {
		validationFunction(value, additionalArgs);
	}
}

export function validateAliasName(value: any): void {
	validateRequiredString(value, 'alias.name');
}

export function validateAliasSortName(value: any): void {
	validateRequiredString(value, 'alias.name');
}

export function validateAliasLanguage(value: any): void {
	validatePositiveInteger(value, 'alias.language', true);
}

export function validateAliasPrimary(value: any): void {
	if (!_.isBoolean(value)) {
		throw new ValidationError('Value has to be a boolean', 'alias.primary', value);
	}
}

export function validateAlias(value: any): void {
	validateAliasName(get(value, 'name'));
	validateAliasSortName(get(value, 'sortName'));
	validateAliasLanguage(get(value, 'language'));
	validateAliasPrimary(get(value, 'primary'));
}

export const validateAliases = _.partial(
	validateMultiple, _.partial.placeholder, validateAlias
);


export function validateIdentifierValue(
	value: any, typeId: unknown, types?: Array<IdentifierTypeWithIdT> | null | undefined
): void {
	validateRequiredString(value, 'identifier.value');

	if (!types) {
		return;
	}

	const selectedType = types.find((type) => type.id === typeId);

	if (selectedType) {
		if (!new RegExp(selectedType.validationRegex).test(value)) {
			throw new ValidationError(`Value is not a valid ${selectedType.label}`, 'identifier.value', value);
		}
	}
}

export function validateIdentifierType(
	typeId: any, types?: Array<IdentifierTypeWithIdT> | null | undefined
): void {
	validatePositiveInteger(typeId, 'identifier.type', true);

	if (!types) {
		return;
	}

	if (!types.find((type) => type.id === typeId)) {
		throw new ValidationError('Value is not a valid identifier type ID', 'identifier.type', typeId);
	}
}

export function validateIdentifier(
	identifier: any, types?: Array<IdentifierTypeWithIdT> | null | undefined
): void {
	const value = get(identifier, 'value');
	const type = get(identifier, 'type');

	validateIdentifierValue(value, type, types);
	validateIdentifierType(type, types);
}

type ValidateIdentifiersFunc = (identifiers: any[], types?: Array<IdentifierTypeWithIdT> | null | undefined) => void;
export const validateIdentifiers: ValidateIdentifiersFunc = _.partial(
	validateMultiple, _.partial.placeholder,
	validateIdentifier, _.partial.placeholder
);

export function validateNameSectionName(value: any): void {
	validateRequiredString(value, 'nameSection.name');
}

export function validateNameSectionSortName(value: any): void {
	validateRequiredString(value, 'nameSection.sortName');
}

export function validateNameSectionLanguage(value: any): void {
	validatePositiveInteger(value, 'nameSection.language', true);
}

export function validateNameSectionDisambiguation(value: any): void {
	validateOptionalString(value, 'nameSection.disambiguation');
}

export function validateNameSection(
	values: any
): void {
	validateNameSectionName(get(values, 'name', null));
	validateNameSectionSortName(get(values, 'sortName', null));
	validateNameSectionLanguage(get(values, 'language', null));
	validateNameSectionDisambiguation(get(values, 'disambiguation', null));
}

export function validateSubmissionSectionNote(value: any): void {
	validateOptionalString(value, 'submissionSection.note');
}

export function validateSubmissionSectionAnnotation(value: any): void {
	validateOptionalString(value, 'submissionSection.annotation.content');
}

export function validateSubmissionSection(
	data: any
): void {
	validateSubmissionSectionNote(get(data, 'note', null));
	validateSubmissionSectionAnnotation(get(data, 'annotation.content', null));
}

export function validateAuthorCreditRow(row: any): void {
	validateUUID(getIn(row, ['author', 'id'], null), 'authorCredit.author.id', true);
	validateRequiredString(get(row, 'name', null), 'authorCredit.name');
	validateOptionalString(get(row, 'joinPhrase', null), 'authorCredit.joinPhrase');
}

export const validateAuthorCreditSection = _.partialRight(
	// Requires at least one Author Credit row or zero in case of optional
	validateMultiple, _.partialRight.placeholder,
	validateAuthorCreditRow, null, _.partialRight.placeholder
);

// In the merge editor we use the authorCredit directly instead of the authorCreditEditor state
export function validateAuthorCreditSectionMerge(authorCredit: any): void {
	validatePositiveInteger(get(authorCredit, 'id', null), 'authorCredit.id', true);
}
