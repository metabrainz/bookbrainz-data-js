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

import _ from 'lodash';


export const CREATOR = 'Creator';
export const EDITION = 'Edition';
export const PUBLICATION = 'Publication';
export const PUBLISHER = 'Publisher';
export const WORK = 'Work';

export const entityTypes = {
	CREATOR, EDITION, PUBLICATION, PUBLISHER, WORK
};

export function getAdditionalEntityProps(data, entityType) {
	switch (entityType) {
		case entityTypes.CREATOR:
			return _.pick(data, [
				'typeId', 'genderId', 'beginAreaId', 'beginDate', 'endDate',
				'ended', 'endAreaId'
			]);
		case entityTypes.EDITION:
			return _.pick(data, [
				'publicationBbid', 'width', 'height', 'depth', 'weight',
				'pages', 'formatId', 'statusId'
			]);
		case entityTypes.PUBLISHER:
			return _.pick(data, [
				'typeId', 'areaId', 'beginDate', 'endDate', 'ended'
			]);
		case entityTypes.PUBLICATION:
		case entityTypes.WORK:
			return _.pick(data, ['typeId']);
		default: return null;
	}
}
