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
import {parseDate} from '../util';


export const CREATOR = 'Creator';
export const EDITION = 'Edition';
export const PUBLICATION = 'Publication';
export const PUBLISHER = 'Publisher';
export const WORK = 'Work';

export const entityTypes = {
	CREATOR, EDITION, PUBLICATION, PUBLISHER, WORK
};

export function getAdditionalEntityProps(data, entityType) {
	if (entityType === entityTypes.CREATOR) {
		const {typeId, genderId, beginAreaId, beginDate, endDate,
			ended, endAreaId} = data;

		const [beginYear, beginMonth, beginDay] = parseDate(beginDate);
		const [endYear, endMonth, endDay] = parseDate(endDate);
		return {
			beginAreaId, beginDay, beginMonth, beginYear, endAreaId, endDay,
			endMonth, endYear, ended, genderId, typeId
		};
	}

	if (entityType === entityTypes.EDITION) {
		return _.pick(data, [
			'publicationBbid', 'width', 'height', 'depth', 'weight',
			'pages', 'formatId', 'statusId'
		]);
	}

	if (entityType === entityTypes.PUBLISHER) {
		const {typeId, areaId, beginDate, endDate, ended} = data;

		const [beginYear, beginMonth, beginDay] = parseDate(beginDate);
		const [endYear, endMonth, endDay] = parseDate(endDate);

		return {areaId, beginDay, beginMonth, beginYear, endDay, endMonth,
			endYear, ended, typeId};
	}

	if (entityType === entityTypes.PUBLICATION ||
		entityType === entityTypes.WORK) {
		return _.pick(data, ['typeId']);
	}

	return null;
}
