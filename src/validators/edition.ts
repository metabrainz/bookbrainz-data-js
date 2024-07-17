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
	type EntityStub,
	type LanguageStub,
	validateAliases,
	validateAnnotationSection,
	validateAuthorCreditSection,
	validateAuthorCreditSectionMerge,
	validateIdentifiers,
	validateMultiple,
	validateNameSection,
	validateSubmissionSection
} from './common';
import {ValidationError, get, validateDate, validatePositiveInteger, validateUUID} from './base';
import {convertMapToObject, isIterable} from '../util';

import {IdentifierTypeWithIdT} from '../types/identifiers';
import {Iterable} from 'immutable';
import _ from 'lodash';


export function validateEditionSectionDepth(value: any): void {
	validatePositiveInteger(value, 'editionSection.depth');
}

export function validateEditionSectionFormat(value: any): void {
	validatePositiveInteger(value, 'editionSection.format');
}

export function validateEditionSectionHeight(value: any): void {
	validatePositiveInteger(value, 'editionSection.height');
}

export function validateEditionSectionLanguage(value: any): void {
	validatePositiveInteger(get(value, 'value', null), 'editionSection.language', true);
}

export function validateEditionSectionLanguages(values: any): void {
	// TODO: Passing for nil values is inconsistent with aliases and identifiers?
	if (values) {
		validateMultiple(values, validateEditionSectionLanguage);
	}
}

export function validateEditionSectionPages(value: any): void {
	validatePositiveInteger(value, 'editionSection.pages');
}

export function validateEditionSectionEditionGroup(
	value: any,
	editionGroupRequired: boolean | null | undefined
): void {
	validateUUID(get(value, 'id', null), 'editionSection.editionGroup.id', editionGroupRequired);
}

export function validateEditionSectionPublisher(value: any): void {
	if (!value) {
		return;
	}
	const publishers = convertMapToObject(value);
	if (!_.isPlainObject(publishers)) {
		throw new ValidationError('Value is no plain object', 'editionSection.publisher', publishers);
	}
	for (const pubId in publishers) {
		if (Object.prototype.hasOwnProperty.call(publishers, pubId)) {
			const publisher = publishers[pubId];
			validateUUID(get(publisher, 'id', null), 'editionSection.publisher.id', true);
		}
	}
}

export function validateEditionSectionReleaseDate(value: any): void {
	validateDate(value, 'editionSection.releaseDate');
}

export function validateEditionSectionStatus(value: any): void {
	validatePositiveInteger(value, 'editionSection.status');
}

export function validateEditionSectionWeight(value: any): void {
	validatePositiveInteger(value, 'editionSection.weight');
}

export function validateEditionSectionWidth(value: any): void {
	validatePositiveInteger(value, 'editionSection.width');
}

export function validateEditionSection(data: any): void {
	validateEditionSectionDepth(get(data, 'depth', null));
	validateEditionSectionFormat(get(data, 'format', null));
	validateEditionSectionHeight(get(data, 'height', null));
	validateEditionSectionLanguages(get(data, 'languages', null));
	validateEditionSectionPages(get(data, 'pages', null));
	validateEditionSectionEditionGroup(get(data, 'editionGroup', null), get(data, 'editionGroupRequired', null));
	validateEditionSectionPublisher(get(data, 'publisher', null));
	validateEditionSectionReleaseDate(get(data, 'releaseDate', null));
	validateEditionSectionStatus(get(data, 'status', null));
	validateEditionSectionWeight(get(data, 'weight', null));
	validateEditionSectionWidth(get(data, 'width', null));
}

export function validateEdition(
	formData: any, identifierTypes?: Array<IdentifierTypeWithIdT> | null | undefined,
	isMerge?: boolean
): void {
	const authorCreditEnable = isIterable(formData) ?
		formData.getIn(['editionSection', 'authorCreditEnable'], true) :
		get(formData, 'editionSection.authorCreditEnable', true);
	if (isMerge) {
		validateAuthorCreditSectionMerge(get(formData, 'authorCredit', {}));
	}
	else if (!authorCreditEnable) {
		let emptyAuthorCredit:boolean;
		if (isIterable(formData)) {
			emptyAuthorCredit = (formData.get('authorCreditEditor') as Iterable<unknown, unknown>)?.size === 0;
		}
		else {
			emptyAuthorCredit = _.size(get(formData, 'authorCreditEditor', {})) === 0;
		}
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
	validateEditionSection(get(formData, 'editionSection', {}));
	validateAnnotationSection(get(formData, 'annotationSection', {}));
	validateSubmissionSection(get(formData, 'submissionSection', {}));
}

export type EditionSection = {
	authorCreditEnable?: boolean;
	depth?: number;
	format?: number;
	height?: number;
	languages?: LanguageStub[];
	pages?: number;
	editionGroup: EntityStub;
	publisher?: Record<string, EntityStub>;
	releaseDate?: string;
	status?: number;
	weight?: number;
	width?: number;
};
