
// @flow

import type {
	FormAliasT, FormIdentifierT, FormRelationshipT, Transaction
} from './types';
import _ from 'lodash';


type SetItemT = FormAliasT | FormIdentifierT | FormRelationshipT;

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
	return _.intersectionWith(
		oldSet, newSet,
		(objValue, otherValue) =>
			_.isEqualWith(objValue, otherValue, comparisonFunc)
	);
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
	return _.differenceWith(
		newSet, oldSet,
		(objValue, otherValue) =>
			_.isEqualWith(objValue, otherValue, comparisonFunc)
	);
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
	return _.differenceWith(
		oldSet, newSet,
		(objValue, otherValue) =>
			_.isEqualWith(objValue, otherValue, comparisonFunc)
	);
}

export const removeItemsFromSet = getRemovedItems;

export async function createNewSetWithItems<Item: SetItemT>(
	orm: any, transacting: Transaction, SetModel: any,
	unchangedItems: Array<Item>, addedItems: Array<Item>
): Promise<any> {
	if (_.isEmpty(unchangedItems) && _.isEmpty(addedItems)) {
		return null;
	}

	const newSet = await new SetModel().save(null, {transacting});
	let newSetItemsCollection =
		await newSet.related('items').fetch({transacting});

	newSetItemsCollection = await newSetItemsCollection.attach(
		_.map(unchangedItems, 'id'), {transacting}
	);

	await Promise.all(
		_.map(addedItems, (ident) => newSetItemsCollection.create(
			_.omit(ident, 'id'), {transacting}
		))
	);

	return newSet;
}
