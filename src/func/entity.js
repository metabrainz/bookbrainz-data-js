/*
 * Copyright (C) 2018  Shivam Tripathi
 * Some parts adapted from bookbrainz-site
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

import _ from 'lodash';
import {parseDate} from '../util';


export const CREATOR: string = 'Creator';
export const EDITION: string = 'Edition';
export const PUBLICATION: string = 'Publication';
export const PUBLISHER: string = 'Publisher';
export const WORK: string = 'Work';

export const entityTypes: Object = {
	CREATOR, EDITION, PUBLICATION, PUBLISHER, WORK
};

/**
 * @param  {Object} entityData - Object holding all data related to an entity
 * @param  {string} entityType - The type of the entity
 * @returns {Object} - Returns all the additional entity specific data
 */
export function getAdditionalEntityProps(
	entityData: Object, entityType: string
) {
	if (entityType === entityTypes.CREATOR) {
		const {typeId, genderId, beginAreaId, beginDate, endDate,
			ended, endAreaId} = entityData;

		const [beginYear, beginMonth, beginDay] = parseDate(beginDate);
		const [endYear, endMonth, endDay] = parseDate(endDate);
		return {
			beginAreaId, beginDate, beginDay, beginMonth, beginYear,
			endAreaId, endDate, endDay, endMonth, endYear,
			ended, genderId, typeId
		};
	}

	if (entityType === entityTypes.EDITION) {
		return _.pick(entityData, [
			'publicationBbid', 'width', 'height', 'depth', 'weight',
			'pages', 'formatId', 'statusId'
		]);
	}

	if (entityType === entityTypes.PUBLISHER) {
		const {typeId, areaId, beginDate, endDate, ended} = entityData;

		const [beginYear, beginMonth, beginDay] = parseDate(beginDate);
		const [endYear, endMonth, endDay] = parseDate(endDate);

		return {areaId, beginDate, beginDay, beginMonth, beginYear,
			endDate, endDay, endMonth, endYear, ended, typeId};
	}

	if (entityType === entityTypes.PUBLICATION ||
		entityType === entityTypes.WORK) {
		return _.pick(entityData, ['typeId']);
	}

	return null;
}

/**
 * @param  {string} entityType - Entity type string
 * @returns {Object} - Returns entitySetMetadata (derivedSets)
 */
export function getEntitySetMetadataByType(entityType: string): Array<Object> {
	if (entityType === EDITION) {
		return [
			{
				entityIdField: 'languageSetId',
				idField: 'id',
				name: 'languageSet',
				propName: 'languages'
			},
			{
				entityIdField: 'publisherSetId',
				idField: 'bbid',
				name: 'publisherSet',
				propName: 'publishers'
			},
			{
				entityIdField: 'releaseEventSetId',
				idField: 'id',
				mutableFields: [
					'date',
					'areaId'
				],
				name: 'releaseEventSet',
				propName: 'releaseEvents'
			}
		];
	}
	else if (entityType === WORK) {
		return [
			{
				entityIdField: 'languageSetId',
				idField: 'id',
				name: 'languageSet',
				propName: 'languages'
			}
		];
	}

	return [];
}

/**
 * Returns all entity models defined in bookbrainz-data-js
 *
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @returns {object} - Object mapping model name to the entity model
 */
export function getEntityModels(orm: Object): Object {
	const {Creator, Edition, Publication, Publisher, Work} = orm;
	return {
		Creator,
		Edition,
		Publication,
		Publisher,
		Work
	};
}

/**
 * Retrieves the Bookshelf entity model with the given the model name
 *
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {string} type - Name or type of model
 * @throws {Error} Throws a custom error if the param 'type' does not
 * map to a model
 * @returns {object} - Bookshelf model object with the type specified in the
 * single param
 */
export function getEntityModelByType(orm: Object, type: string): Object {
	const entityModels = getEntityModels(orm);

	if (!entityModels[type]) {
		throw new Error('Unrecognized entity type');
	}

	return entityModels[type];
}

export function getEntity(
	orm: Object, modelType: string, bbid: string, relations: Array<String> = []
): Object {
	const model = getEntityModelByType(orm, modelType);
	return model.forge({bbid})
		.fetch({
			require: true,
			withRelated: relations
		})
		.then((entity) => entity.toJSON());
}
