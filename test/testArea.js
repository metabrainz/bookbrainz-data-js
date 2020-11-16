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

import bookbrainzData from './bookshelf';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {truncateTables} from '../lib/util';
import uuid from 'node-uuid';


chai.use(chaiAsPromised);
const {expect} = chai;
const {Area, AreaType, bookshelf} = bookbrainzData;

function createArea(name) {
	const areaAttribs = {
		gid: uuid.v4(),
		name,
		type: 1
	};

	return new Area(areaAttribs)
		.save(null, {method: 'insert'})
		.then((model) => model.refresh())
		.then((area) => area.toJSON());
}

describe('Area model', () => {
	afterEach(() => truncateTables(bookshelf, ['musicbrainz.area']));

	it('should return a JSON object with correct keys when saved', () => {
		const areaPromise = createArea('Mars');

		return expect(areaPromise).to.eventually.have.all.keys([
			'bbid', 'id', 'gid', 'name', 'type', 'editsPending', 'lastUpdated',
			'beginDateYear', 'beginDateMonth', 'beginDateDay', 'endDateYear',
			'endDateMonth', 'endDateDay', 'ended', 'comment'
		]);
	});
});

describe('AreaType model', () => {
	afterEach(() => truncateTables(bookshelf, ['musicbrainz.area', 'musicbrainz.area_type']));

	it('should return a JSON object with correct keys when saved', async () => {
		const areaType = await new AreaType({id: 1, name: 'Planet'})
			.save(null, {method: 'insert'})
			.then((model) => model.refresh())
			.then((areaTypeModel) => areaTypeModel.toJSON());

		expect(areaType).to.have.all.keys([
			'id', 'name', 'parent', 'childOrder', 'description'
		]);
	});

	it('should be fetched as relationship when fetching Area', async () => {
		const areaType = await new AreaType({description: 'Fnord', id: 1, name: 'Planet'})
			.save(null, {method: 'insert'})
			.then((model) => model.refresh())
			.then((areaTypeModel) => areaTypeModel.toJSON());
		const createdArea = await createArea('Mars');

		const fetchedArea = await Area.forge({id: createdArea.id})
			.fetch({withRelated: 'areaType'});

		expect(fetchedArea.related('areaType')?.toJSON()).to.deep.equal(areaType);
	});
});
