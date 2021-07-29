/* Adapted from bookbrainz-site
 * Copyright (C) 2016  Sean Burke
 *               2016  Ben Ockmore
 *               2018  Shivam Tripathi
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

import * as _ from 'lodash';
import type {SetItemT, Transaction} from './types';
import {
	createNewSetWithItems, getAddedItems, getComparisonFunc, getRemovedItems,
	getUnchangedItems
} from './set';


function updateEntitySet<Item extends SetItemT>(
	transacting: Transaction, oldSet: any, newItems: Array<Item>,
	derivedSet: any, orm: Record<string, unknown>
): Promise<any> {
	const oldItems =
		oldSet ? oldSet.related(derivedSet.propName).toJSON() : [];

	const comparisonFunc = getComparisonFunc(
		[derivedSet.idField, ...derivedSet.mutableFields || []]
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
		[], derivedSet.propName, derivedSet.idField
	);
}


export async function updateEntitySets(
	derivedSets: Array<any> | null | undefined, currentEntity: any,
	entityData: any, transacting: Transaction, orm: Record<string, unknown>
): Promise<Record<string, unknown> | null | undefined> {
	// If no entity sets, return null
	if (!derivedSets) {
		return null;
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
			require: false,
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
