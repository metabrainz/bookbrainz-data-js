/*
 * Copyright (C) 2018  Ben Ockmore
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

import type {
	FormAliasT, FormIdentifierT, FormLanguageT, FormPublisherT,
	FormRelationshipT, Transaction
} from './types';
import _ from 'lodash';


type SetItemT =
	FormAliasT | FormIdentifierT | FormLanguageT | FormRelationshipT |
	FormPublisherT;

/**
 * Get the intersection of two arrays of objects using a custom comparison
 * function. The two arrays represent two versions of a single set - one array
 * is the set before a particular change and the other is the same set after
 * that change.
 *
 * @param {Array<{}>} oldSet - The old array to compare
 * @param {Array<{}>} newSet - The new array to compare
 * @param {Function} comparisonFunc - Function to compare items from the two
 * arrays
 *
 * @returns {Array<{}>} - An array representing the intersection of the two
 * arrays
 */
export function getUnchangedItems<Item: SetItemT>(
	oldSet: Array<Item>, newSet: Array<Item>,
	comparisonFunc: (obj: Item, other: Item) => boolean
): Array<Item> {
	return _.uniqWith(_.intersectionWith(
		oldSet, newSet, comparisonFunc
	), comparisonFunc);
}

/**
 * Get any items in the new version of the set that aren't present in the old
 * version using a custom comparison function. The two arrays represent two
 * versions of a single set - one array is the set before a particular change
 * and the other is the same set after that change.
 *
 * @param {Array<{}>} oldSet - The old array to compare
 * @param {Array<{}>} newSet - The new array to compare
 * @param {Function} comparisonFunc - Function to compare items from the two
 * arrays
 *
 * @returns {Array<{}>} - An array representing the difference of the two
 * arrays
 */
export function getAddedItems<Item: SetItemT>(
	oldSet: Array<Item>, newSet: Array<Item>,
	comparisonFunc: (obj: Item, other: Item) => boolean
): Array<Item> {
	return _.uniqWith(_.differenceWith(
		newSet, oldSet, comparisonFunc
	), comparisonFunc);
}

/**
* Get any items in the old version of the set that aren't present in the new
* version using a custom comparison function. The two arrays represent two
* versions of a single set - one array is the set before a particular change
* and the other is the same set after that change.
 *
 * @param {Array<{}>} oldSet - The old array to compare
 * @param {Array<{}>} newSet - The new array to compare
 * @param {Function} comparisonFunc - Function to compare items from the two
 * arrays
 *
 * @returns {Array<{}>} - An array representing the difference of the two
 * arrays
 */
export function getRemovedItems<Item: SetItemT>(
	oldSet: Array<Item>, newSet: Array<Item>,
	comparisonFunc: (obj: Item, other: Item) => boolean
): Array<Item> {
	return _.uniqWith(_.differenceWith(
		oldSet, newSet, comparisonFunc
	), comparisonFunc);
}

export const removeItemsFromSet = getRemovedItems;

export async function createNewSetWithItems<Item: SetItemT>(
	orm: any, transacting: Transaction, SetModel: any,
	unchangedItems: Array<Item>, addedItems: Array<Item>,
	idAttribute: string = 'id'
): Promise<any> {
	if (_.isEmpty(unchangedItems) && _.isEmpty(addedItems)) {
		return null;
	}

	const newSet = await new SetModel().save(null, {transacting});
	let newSetItemsCollection =
		await newSet.related('items').fetch({transacting});

	newSetItemsCollection = await newSetItemsCollection.attach(
		_.map(unchangedItems, idAttribute), {transacting}
	);

	await Promise.all(
		_.map(addedItems, (ident) => newSetItemsCollection.create(
			_.omit(ident, idAttribute), {transacting}
		))
	);

	return newSet;
}
