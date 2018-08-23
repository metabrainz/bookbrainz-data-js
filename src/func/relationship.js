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
	EntityTypeString, FormRelationshipT as Relationship, Transaction
} from './types';
import {
	createNewSetWithItems, getAddedItems, getRemovedItems, removeItemsFromSet
} from './set';
import Promise from 'bluebird';
import _ from 'lodash';


type RelationshipComparisonFunc =
	(obj: Relationship, other: Relationship) => boolean;

function getAffectedBBIDs(
	addedItems: Array<Relationship>, removedItems: Array<Relationship>
) {
	const affectedSourceBBIDs = [...addedItems, ...removedItems].map(
		(relationship) => relationship.sourceBbid
	);
	const affectedTargetBBIDs = [...addedItems, ...removedItems].map(
		(relationship) => relationship.targetBbid
	);
	return _.uniq([...affectedSourceBBIDs, ...affectedTargetBBIDs]);
}

async function getMasterRelationshipSetForEntity(
	orm, transacting: Transaction, bbid: string
) {
	const {
		Entity, Creator, Edition, Publication, Publisher, RelationshipSet, Work
	} = orm;
	const entityHeader = await Entity.forge({bbid})
		.fetch({require: true}, {transacting});

	const typeModelMap = {Creator, Edition, Publication, Publisher, Work};

	// Extract entity type
	const type: EntityTypeString = entityHeader.get('type');

	// Fetch master revision of entity
	const entity = await typeModelMap[type].forge({bbid})
		.fetch({require: true}, {transacting});

	const relationshipSetId = entity.get('relationshipSetId');
	if (!relationshipSetId) {
		return null;
	}

	// Return relationship set
	return RelationshipSet.forge({id: relationshipSetId})
		.fetch({
			require: true,
			withRelated: ['items']
		}, {transacting});
}

async function updateRelationshipSetForEntity(
	orm: any,
	transacting: Transaction,
	bbid: string,
	allAddedItems: Array<Relationship>,
	allRemovedItems: Array<Relationship>,
	comparisonFunc: RelationshipComparisonFunc
) {
	const {RelationshipSet} = orm;

	const oldSet =
		await getMasterRelationshipSetForEntity(orm, transacting, bbid);

	const oldSetItems: Array<Relationship> =
		oldSet ? oldSet.related('relationships').toJSON() : [];

	const addedItems = allAddedItems.filter(
		(relationship) =>
			relationship.sourceBbid === bbid ||
			relationship.targetBbid === bbid
	);
	const unchangedItems =
		removeItemsFromSet(oldSetItems, allRemovedItems, comparisonFunc);

	return createNewSetWithItems(
		orm, transacting, RelationshipSet, unchangedItems, addedItems,
		'relationships'
	);
}


/**
 * Takes an array of relationships that should be set for the entity, and
 * compares it to the currently set list of relationships to determine the
 * difference. Compiles a list of affected entity BBIDs from this difference,
 * and then updates the relationship sets for all affected entities, and returns
 * these. If no entities are affected (there are no changes), an empty object
 * is returned.
 *
 * @param {any} orm - an initialized instance of bookbrainz-data-js
 * @param {Transaction} transacting - the current transaction
 * @param {any} oldSet - the RelationshipSet object for the old entity data
 * @param {Array<Relationship>} newSetItems - the edited RelationshipSet for the
 *        entity
 *
 * @returns {Promise<any>} a promise which resolves to a {BBID: RelationshipSet}
 *          map
 */
export function updateRelationshipSets(
	orm: any, transacting: Transaction, oldSet: any,
	newSetItems: Array<Relationship>
): Promise<any> {
	function comparisonFunc(obj: Relationship, other: Relationship) {
		return obj.typeId === other.typeId &&
			obj.sourceBbid === other.sourceBbid &&
			obj.targetBbid === other.targetBbid;
	}

	const oldSetItems =
		oldSet ? oldSet.related('relationships').toJSON() : [];

	const allAddedItems =
		getAddedItems(oldSetItems, newSetItems, comparisonFunc);
	const allRemovedItems =
		getRemovedItems(oldSetItems, newSetItems, comparisonFunc);


	if (_.isEmpty(allAddedItems) && _.isEmpty(allRemovedItems)) {
		// No action - set has not changed
		return Promise.resolve({});
	}

	const affectedBBIDs = getAffectedBBIDs(allAddedItems, allRemovedItems);

	// For each BBID, get the entity and the old relationship set, then apply
	// the relevant changes to create a new set.

	const newSetPromises = affectedBBIDs.reduce((result, bbid) => ({
		...result,
		[bbid]: updateRelationshipSetForEntity(
			orm, transacting, bbid, allAddedItems, allRemovedItems,
			comparisonFunc
		)
	}), {});

	return Promise.props(newSetPromises);
}
