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

import {
	createNewSetWithItems, getAddedItems, getComparisonFunc, getRemovedItems,
	getUnchangedItems
} from './set';
import type {Transaction} from './types';
import _ from 'lodash';


function updateEntitySet(
	transacting: Transaction, oldSet: ?Object, newItems: Array<Object>,
	derivedSet: Object, orm: Object
): Promise<?Object> {
	const oldItems =
		oldSet ? oldSet.related(derivedSet.propName).toJSON() : [];

	const comparisonFunc = getComparisonFunc(
		[derivedSet.idField, ...derivedSet.mutableFields]
	);

	if (_.isEmpty(oldItems) && _.isEmpty(newItems)) {
		return Promise.resolve(oldSet);
	}

	const addedItems = getAddedItems(oldItems, newItems, comparisonFunc);
	const removedItems =
		getRemovedItems(oldItems, newItems, comparisonFunc);
	const unchangedItems =
		getUnchangedItems(oldItems, newItems, comparisonFunc);

	const isSetUnmodified = _.isEmpty(addedItems) && _.isEmpty(removedItems);
	if (isSetUnmodified) {
		// No action - set has not changed
		return Promise.resolve(oldSet);
	}

	return createNewSetWithItems(
		orm, transacting, derivedSet.model, [...unchangedItems, ...addedItems],
		[], derivedSet.idField
	);
}


export async function updateEntitySets(
	derivedSets: ?Array<Object>, currentEntity: ?Object, entityData: Object,
	transacting: Transaction, orm: Object
): Promise<?Object> {
	// If no entity sets, return null
	if (!derivedSets) {
		return Promise.resolve(null);
	}

	// Process each entitySet
	const newProps = await Promise.all(derivedSets.map(async (derivedSet) => {
		const newItems = entityData[derivedSet.propName];

		if (!(currentEntity && currentEntity[derivedSet.name])) {
			return Promise.resolve(null);
		}

		const oldSetRecord = await derivedSet.model.forge({
			id: currentEntity[derivedSet.name].id
		}).fetch({
			transacting,
			withRelated: [derivedSet.propName]
		});

		const newSetRecord = await updateEntitySet(
			transacting, oldSetRecord, newItems, derivedSet, orm
		);

		return {
			[derivedSet.entityIdField]:
				newSetRecord ? newSetRecord.get('id') : null
		};
	}));

	return newProps.reduce((result, value) => _.assign(result, value), {});
}
