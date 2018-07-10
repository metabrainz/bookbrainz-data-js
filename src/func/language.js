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

// @flow

import type {
	FormLanguageT as Language, Transaction
} from './types';
import {getAddedItems, getRemovedItems} from './set';
import _ from 'lodash';
import {camelToSnake} from '../util';


export async function updateLanguageSet(transacting: Transaction,
	currentEntity: ?object, newLanguageItems: Array<Language>) {
	function cmpLanguageItems(obj, other) {
		return obj.id === other.id;
	}

	const oldLanguageSetId: number =
		currentEntity && currentEntity.languageSetId;

	// All errors are expected to be handled on the usage side
	if (oldLanguageSetId) {
		// Extract old language_ids
		// The format is an array of {language_id} objects
		const oldLanguageItemSetConstruct =
			await transacting.select('language_id')
				.from('language_set__language')
				.where('set_id', oldLanguageSetId);

		// Construct an array of old items of Language type
		const oldLanguageItemSet: Array<Language> =
				oldLanguageItemSetConstruct.map(
					({language_id}) => ({id: language_id}) // eslint-disable-line camelcase, max-len
				);

		// Contruct an array of new items of Language type
		const newLanguageItemSet: Array<Language> =
			newLanguageItems.map(item => ({id: item}));

		// Use the above arrays of objects to check if there has been any change
		const addedItems = getAddedItems(
			oldLanguageItemSet, newLanguageItemSet, cmpLanguageItems
		);
		const removedItems = getRemovedItems(
			oldLanguageItemSet, newLanguageItemSet, cmpLanguageItems
		);

		const isSetUnmodified: boolean =
			_.isEmpty(removedItems) && _.isEmpty(addedItems);
		if (isSetUnmodified) {
			return oldLanguageSetId;
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
