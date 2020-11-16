import bookbrainzData from '../bookshelf';
import chai from 'chai';
import {recursivelyGetAreaParentsWithNames} from '../../src/func/area';
import {truncateTables} from '../../lib/util';
import uuid from 'node-uuid';


const {expect} = chai;
const {Area, AreaType, bookshelf} = bookbrainzData;


function createArea(name, type) {
	const areaAttribs = {
		gid: uuid.v4(),
		name,
		type: type || 1
	};

	return new Area(areaAttribs)
		.save(null, {method: 'insert'})
		.then((model) => model.refresh());
}

describe('recursivelyGetAreaParentsWithNames', () => {
	let area1; let area2; let area3; let area4;
	before(
		async () => {
			await new AreaType({id: 1, name: 'Country'}).save(null, {method: 'insert'});
			await new AreaType({id: 2, name: 'Subdivision'}).save(null, {method: 'insert'});
			await new AreaType({id: 3, name: 'City'}).save(null, {method: 'insert'});
			await new AreaType({id: 4, name: 'Other'}).save(null, {method: 'insert'});


			area1 = await createArea('France', 1);
			area2 = await createArea('Ile-de-France', 2);
			area3 = await createArea('OtherSubdivision', 4);
			area4 = await createArea('Paris', 3);

			// Creating links between areas
			await bookshelf.knex('musicbrainz.l_area_area').insert([
				{entity0: area1.id, entity1: area2.id, link: 118734},
				{entity0: area2.id, entity1: area3.id, link: 118734},
				{entity0: area3.id, entity1: area4.id, link: 118734}
			]);
		}
	);
	after(function truncate() {
		this.timeout(0); // eslint-disable-line babel/no-invalid-this
		return truncateTables(bookshelf, [
			'musicbrainz.area',
			'musicbrainz.area_type',
			'musicbrainz.l_area_area'
		]);
	});

	it('should return an array of areas with their names, sorted by type', async function () {
		const parents = await recursivelyGetAreaParentsWithNames(bookbrainzData, area4.id);
		expect(parents).to.be.an('array').that.is.not.empty;
		expect(parents.length).to.equal(2);
		expect(parents[0].name).to.equal('Ile-de-France');
		expect(parents[1].name).to.equal('France');
	});
	it('should work when calling parents() on an Area model', async function () {
		const parents = await area4.parents();
		expect(parents).to.be.an('array').that.is.not.empty;
		expect(parents.length).to.equal(2);
		expect(parents[0].name).to.equal('Ile-de-France');
		expect(parents[1].name).to.equal('France');
	});

	it('should return all levels when checkAllLevels is true', async function () {
		const parents = await recursivelyGetAreaParentsWithNames(bookbrainzData, area4.id, true);
		expect(parents).to.be.an('array').that.is.not.empty;
		expect(parents.length).to.equal(3);
		expect(parents[0].name).to.equal('OtherSubdivision');
		expect(parents[1].name).to.equal('Ile-de-France');
		expect(parents[2].name).to.equal('France');
	});
});
