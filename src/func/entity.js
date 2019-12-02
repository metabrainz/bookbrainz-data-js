/*
 * Copyright (C) 2018  Shivam Tripathi
 * Copyright (C) 2019  Nicolas Pelletier
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


export const AUTHOR: string = 'Author';
export const EDITION: string = 'Edition';
export const EDITION_GROUP: string = 'EditionGroup';
export const PUBLISHER: string = 'Publisher';
export const WORK: string = 'Work';

export const entityTypes: Object = {
	AUTHOR, EDITION, EDITION_GROUP, PUBLISHER, WORK
};

/**
 * @param  {Object} entityData - Object holding all data related to an entity
 * @param  {string} entityType - The type of the entity
 * @returns {Object} - Returns all the additional entity specific data
*/
export function getAdditionalEntityProps(
	entityData: Object, entityType: string
) {
	if (entityType === entityTypes.AUTHOR) {
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
			'editionGroupBbid', 'width', 'height', 'depth', 'weight',
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

	if (entityType === entityTypes.EDITION_GROUP ||
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
	const {Author, Edition, EditionGroup, Publisher, Work} = orm;
	return {
		Author,
		Edition,
		EditionGroup,
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

/**
 * Finds the bbid an entity redirects to, if any.
 * Do a recursive search in case the redirected bbid also redirects, etc.
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {string} bbid - The target entity's bbid.
 * @param {any} transacting - Optional ORM transaction object
 * @returns {string} The final bbid to redirect to
 */
export async function recursivelyGetRedirectBBID(orm: Object, bbid: string, transacting?) {
	const redirectSQLQuery = `SELECT target_bbid FROM bookbrainz.entity_redirect WHERE source_bbid = '${bbid}'`;
	const redirectQueryResults = await (transacting || orm.bookshelf.knex).raw(redirectSQLQuery);
	if (redirectQueryResults.rows && redirectQueryResults.rows.length) {
		const redirectedBBID = redirectQueryResults.rows[0].target_bbid;
		return recursivelyGetRedirectBBID(orm, redirectedBBID);
	}
	return bbid;
}

/**
 * Fetches an entity with related data
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {string} entityType - The entity model name.
 * @param {string} bbid - The target entity's bbid.
 * @param {string[]} relations - Extra model relationships to fetch along with the entity
 * @returns {Promise} A Promise that resolves to the entity in JSON format
 */
export async function getEntity(
	orm: Object, entityType: string, bbid: string, relations: Array<String> = []
): Object {
	// if bbid appears in entity_redirect table, use that bbid instead
	// Do a recursive search in case the redirected bbid also redirects, etc.
	const finalBBID = await recursivelyGetRedirectBBID(orm, bbid);
	const model = getEntityModelByType(orm, entityType);
	const entity = await model.forge({bbid: finalBBID})
		.fetch({
			require: true,
			withRelated: relations
		});
	return entity.toJSON();
}

/**
 * Fetches an entity's last known default alias from its revision parent.
 * This is necessary to display the name of a 'deleted' entity
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {string} entityType - The entity model name.
 * @param {string} bbid - The target entity's bbid.
 * @returns {Promise} The returned Promise returns the entity's
 * 					   parent default alias
 */
export async function getEntityParentAlias(orm, entityType, bbid) {
	const rawSql = `
		SELECT alias.name,
			alias.sort_name,
			alias.id,
			alias.language_id,
			alias.primary
		FROM bookbrainz.${_.snakeCase(entityType)}
		LEFT JOIN bookbrainz.alias ON alias.id = default_alias_id
		WHERE bbid = '${bbid}' AND master = FALSE
		ORDER BY revision_id DESC
		LIMIT 1;
	`;

	// Query the database to get the parent revision default alias
	const queryResult = await orm.bookshelf.knex.raw(rawSql);
	if (!Array.isArray(queryResult.rows)) {
		return null;
	}
	const rows = queryResult.rows.map((rawQueryResult) => {
		// Convert query keys to camelCase
		const queriedResult = _.mapKeys(
			rawQueryResult,
			(value, key) => _.camelCase(key)
		);
		return queriedResult;
	});
	return rows[0];
}
