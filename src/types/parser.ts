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

/**
 * Types for parsed entities, used for imports.
 * TODO: Investigate whether these are also useful elsewhere, e.g. for form validation.
 */

import {FormLanguageT, FormReleaseEventT} from '../func/types';
import {AdditionalImportDataT} from './imports';
import {AliasWithDefaultT} from './aliases';
import {EntityTypeString} from './entity';
import {IdentifierT} from './identifiers';


type ParsedBaseEntity = {
	// TODO: rename array property to `aliases`, also for consistency with e.g. `EntityDataType`
	alias: AliasWithDefaultT[];
	annotation?: string;
	disambiguation?: string;
	identifiers: IdentifierT[];
	metadata: AdditionalImportDataT;
	source: string;
	lastEdited?: string;
	originId?: string;
};

export type ParsedAuthor = ParsedBaseEntity & {
	beginDate?: string;
	endDate?: string;
	ended: boolean;
	type?: string;
	typeId?: number;
	genderId?: number;
	beginAreaId?: number;
	endAreaId?: number;
};

export type ParsedEdition = ParsedBaseEntity & {
	editionGroupBbid: string;
	width?: number;
	height?: number;
	depth?: number;
	weight?: number;
	pages?: number;
	formatId?: number;
	statusId?: number;
	languages?: FormLanguageT[];
	releaseEvents?: FormReleaseEventT[];
};

export type ParsedEditionGroup = ParsedBaseEntity & {
	typeId?: number;
};

export type ParsedPublisher = ParsedBaseEntity & {
	typeId?: number;
	areaId?: number;
	beginDate?: string;
	endDate?: string;
	ended: boolean;
};

export type ParsedSeries = ParsedBaseEntity & {

	/** Type of the items in the series. */
	entityType: EntityTypeString;
	orderingTypeId: number;
};

export type ParsedWork = ParsedBaseEntity & {
	typeId?: number;
};

export type ParsedEntity =
	| ParsedAuthor
	| ParsedEdition
	| ParsedEditionGroup
	| ParsedPublisher
	| ParsedSeries
	| ParsedWork;

// TODO: drop redundant properties which are present in `data` and at the top level
export type QueuedEntity = {
	data: ParsedEntity;
	entityType: EntityTypeString;
	source: string;
	lastEdited?: string;
	originId?: string;
};
