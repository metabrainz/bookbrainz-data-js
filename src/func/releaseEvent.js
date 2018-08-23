/*
 * Copyright (C) 2018 Shivam Tripathi
 *               2018 Ben Ockmore
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

// @flow

import type {FormReleaseEventT as ReleaseEvent, Transaction} from './types';
import {
	createNewSetWithItems, getAddedItems, getRemovedItems, getUnchangedItems
} from './set';
import _ from 'lodash';


export function updateReleaseEventSet(
	orm: any, transacting: Transaction, oldSet: any,
	newSetItems: Array<ReleaseEvent>
): Promise<any> {
	function comparisonFunc(obj, other) {
		return obj.date === other.date && obj.areaId === other.areaId;
	}

	const {ReleaseEventSet} = orm;

	const oldSetItems: Array<ReleaseEvent> =
		oldSet ? oldSet.related('releaseEvents').toJSON() : [];

	const addedItems =
		getAddedItems(oldSetItems, newSetItems, comparisonFunc);
	const removedItems =
		getRemovedItems(oldSetItems, newSetItems, comparisonFunc);
	const unchangedItems =
		getUnchangedItems(oldSetItems, newSetItems, comparisonFunc);

	const isSetUnmodified = _.isEmpty(addedItems) && _.isEmpty(removedItems);

	if (isSetUnmodified) {
		// No action - set has not changed
		return Promise.resolve(oldSet || null);
	}

	return createNewSetWithItems(
		orm, transacting, ReleaseEventSet, unchangedItems, addedItems,
		'releaseEvents'
	);
}
