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

import {LazyLoadedAliasSetT, LazyLoadedAliasT} from './aliases';
import {LazyLoaded} from './utils';
import {LazyLoadedIdentifierSetT} from './identifiers';


export const ENTITY_TYPES = [
	'Author',
	'Edition',
	'EditionGroup',
	'Publisher',
	'Series',
	'Work'
] as const;

export type EntityTypeString = typeof ENTITY_TYPES[number];

// TODO: incomplete
export type EntityT = {
	type: EntityTypeString,
};

export type LazyLoadedEntityT = EntityT & LazyLoaded<{
	aliasSet: LazyLoadedAliasSetT,
	defaultAlias: LazyLoadedAliasT,
	identifierSet: LazyLoadedIdentifierSetT,
}>;
