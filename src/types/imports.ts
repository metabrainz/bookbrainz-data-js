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

import {IdentifierT} from './identifiers';


export type ImportHeaderT = {
	bbid: string;
	dataId: number;
};

export type AdditionalImportDataT = {
	identifiers?: IdentifierT[];
	links: Array<{
		title: string;
		url: string;
	}>;
	// TODO: find correct type in OL samples
	originId?: object[];
	relationships: Array<{
		type: string;
		value: string;
	}>;
	[custom: string]: any;
};

export type ImportMetadataT = {
	pendingEntityBbid: string | null;
	externalSourceId: number;
	externalIdentifier: string;

	/** TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now()) */
	importedAt?: string;

	/** TIMESTAMP WITHOUT TIME ZONE */
	lastEdited: string;

	/** UUID */
	acceptedEntityBbid?: string | null;

	/** JSONB */
	additionalData: AdditionalImportDataT;
};

export type ImportMetadataWithSourceT = ImportMetadataT & {

	/** Name of the external source. */
	source: string;
};
