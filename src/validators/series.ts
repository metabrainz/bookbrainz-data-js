/*
 * Copyright (C) 2021  Akash Gupta
 *               2024  David Kellner
 *
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
	validateIdentifiers,
	validateNameSection,
	validateSubmissionSection
} from './common';

import type {EntityTypeString} from '../types/entity';
import type {IdentifierTypeWithIdT} from '../types/identifiers';


export function validateSeriesSectionOrderingType(value: any): void {
	validatePositiveInteger(value, 'seriesSection.orderType', true);
}

export function validateSeriesSectionEntityType(value: any): void {
	const itemEntityTypes = ['Author', 'Work', 'Edition', 'EditionGroup', 'Publisher'];
	if (!itemEntityTypes.includes(value)) {
		throw new ValidationError(
			'Value is not an entity type which can be part of a series',
			'seriesSection.seriesType',
			value
		);
	}
}

export function validateSeriesSection(data: any): void {
	validateSeriesSectionOrderingType(get(data, 'orderType', null));
	validateSeriesSectionEntityType(get(data, 'seriesType', null));
}

export function validateSeries(
	formData: any, identifierTypes?: Array<IdentifierTypeWithIdT> | null | undefined
): void {
	validateAliases(get(formData, 'aliasEditor', {}));
	validateIdentifiers(get(formData, 'identifierEditor', {}), identifierTypes);
	validateNameSection(get(formData, 'nameSection', {}));
	validateSeriesSection(get(formData, 'seriesSection', {}));
	validateSubmissionSection(get(formData, 'submissionSection', {}));
}

export type SeriesSection = Partial<{
	orderType: number;
	seriesType: Exclude<EntityTypeString, 'Series'>;
}>;
