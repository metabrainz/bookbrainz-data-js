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

import {
	createNewSetWithItems, getAddedItems, getRemovedItems,
	getUnchangedItems
} from './set';
import _ from 'lodash';
import {camelToSnake} from '../util';


export async function updateLanguageSet(transacting, currentEntity,
	newLanguageItems) {
	function cmpLanguageItems(obj, other) {
		return obj === other;
	}

	const oldLangaugeSetId = currentEntity && currentEntity.languageSetId;

	// All errors are expected to be handled on the usage side
	if (oldLangaugeSetId) {
		// Extract old language_ids
		const oldLanguageItemsMap = await transacting.select('language_id')
			.from('language_set__language')
			.where('set_id', oldLangaugeSetId);

		const oldLanguageItems = _.map(oldLanguageItemsMap, 'language_id');

		// Check if there has been any change
		const addedItems = getAddedItems(
			oldLanguageItems, newLanguageItems, cmpLanguageItems);
		const removedItems = getRemovedItems(
			oldLanguageItems, newLanguageItems, cmpLanguageItems);

		const isSetUnmodified =
			_.isEmpty(removedItems) && _.isEmpty(addedItems);
		if (isSetUnmodified) {
			return oldLangaugeSetId;
		}
	}

	const [setId] = await transacting.insert({})
		.into('language_set')
		.returning('id');

	const queryArgs = newLanguageItems.map(item =>
		camelToSnake({languageId: item, setId})
	);

	await transacting.insert(queryArgs)
		.into('language_set__language');

	return setId;
}

export async function updateReleaseEventSet(orm, transacting, oldSet,
	newSetItems) {
	function cmpFunc(obj, other) {
		return obj.date === other.date && obj.area_id === other.area_id;
	}

	const {ReleaseEventSet} = orm;

	const oldSetItems =
		oldSet ? await oldSet.related('releaseEvents').toJSON() : [];

	if (_.isEmpty(oldSetItems) && _.isEmpty(newSetItems)) {
		return oldSet;
	}

	const addedItems = getAddedItems(oldSetItems, newSetItems, cmpFunc);
	const removedItems = getRemovedItems(oldSetItems, newSetItems, cmpFunc);
	const unchangedItems = getUnchangedItems(oldSetItems, newSetItems, cmpFunc);

	const isSetUnmodified = _.isEmpty(addedItems) && _.isEmpty(removedItems);

	if (isSetUnmodified) {
		// No action - set has not changed
		return oldSet;
	}

	const newSet = await createNewSetWithItems(
		orm, transacting, ReleaseEventSet, unchangedItems, addedItems
	);

	return newSet.save(null, {transacting});
}
