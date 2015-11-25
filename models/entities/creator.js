/*
 * Copyright (C) 2015  Ben Ockmore
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

'use strict';

const validateEntityType = require('../../utils').validateEntityType;
const _ = require('lodash');

module.exports = (bookshelf) => {
	const Entity = bookshelf.model('Entity');
	const EntityRevision = bookshelf.model('EntityRevision');
	const CreatorData = bookshelf.model('CreatorData');

	const Creator = Entity.extend({
		initialize(attributes) {
			this.on('fetched', validateEntityType.bind(this));
		},
		create(data) {
			// Create Creator
			const creatorPromise = this.save({_type: 'Creator'});
			const creatorBbidPromise = creatorPromise
				.then((creatorModel) => creatorModel.get('bbid'));

			const creatorData = _.pluck(
				data,
				[
					'beginDate', 'endDate', 'ended', 'countryId', 'genderId',
					'creatorTypeId', 'annotationId', 'disambiguationId',
					'defaultAliasId'
				]
			);
			const creatorDataIdPromise = CreatorData.create(creatorData)
				.then((creatorDataModel) => creatorDataModel.get('id'));

			const revisionIdPromise = Promise.join(
				creatorBbidPromise, creatorDataIdPromise,
				(entityBbid, entityDataId) => {
					const revisionData =
						_.pluck(data, ['authorId', 'parentId']);
					revisionData.entityBbid = entityBbid;
					revisionData.entityDataId = entityDataId;
					return new EntityRevision().create(revisionData);
				})
				.then((revisionModel) => revisionModel.get('id'));

			return Promise.join(
				revisionIdPromise, creatorPromise,
				(revisionId, creatorModel) => {
					return creatorModel.save(
						{masterRevisionId: revisionId}
					);
				});
		},
		typeId: 'Creator'
	});

	return bookshelf.model('Creator', Creator);
};
