/*
 * Copyright (C) 2023  David Kellner
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

import {LazyLoaded, WithId} from './utils';
import {EntityTypeString} from './entity';


export type IdentifierTypeT = {
	label: string,
	description: string,
	detectionRegex: string | null,
	validationRegex: string,
	displayTemplate: string,
	entityType: EntityTypeString,
	parentId: number | null,
	childOrder: number,
	deprecated: boolean,
};

export type IdentifierTypeWithIdT = WithId<IdentifierTypeT>;

export type IdentifierT = {
	typeId: number,
	value: string,
};

export type IdentifierWithIdT = WithId<IdentifierT>;

export type LazyLoadedIdentifierT = IdentifierWithIdT & LazyLoaded<{
	type: IdentifierTypeWithIdT,
}>;

export type IdentifierSetWithIdT = {
	id: number,
};

export type LazyLoadedIdentifierSetT = IdentifierSetWithIdT & LazyLoaded<{
	identifiers: Array<LazyLoadedIdentifierT>,
}>;
