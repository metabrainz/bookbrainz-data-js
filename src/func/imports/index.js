/*
 * Copyright (C) 2018 Shivam Tripathi
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

import {DISCARD_LIMIT, castDiscardVote, discardVotesCast} from './discard';
import {
	getImportDetails, getOriginSourceFromId, getOriginSourceId,
	originSourceMapping
} from './misc';
import {getRecentImports, getTotalImports} from './recent-imports';
import {approveImport} from './approve-import';
import {createImport} from './create-import';
import {deleteImport} from './delete-import';


export default {
	DISCARD_LIMIT,
	approveImport,
	castDiscardVote,
	createImport,
	deleteImport,
	discardVotesCast,
	getImportDetails,
	getOriginSourceFromId,
	getOriginSourceId,
	getRecentImports,
	getTotalImports,
	originSourceMapping
};
