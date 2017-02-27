/*
 * Copyright (C) 2016  Ben Ockmore
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

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const _ = require('lodash');
const Promise = require('bluebird');

const util = require('../lib/util');
const Bookshelf = require('./bookshelf');
const AliasSet = require('../lib/index').AliasSet;
const Alias = require('../lib/index').Alias;
const Language = require('../lib/index').Language;

const aliasAttribs = {
	id: 1,
	languageId: 1,
	name: 'Bob Marley',
	primary: true,
	sortName: 'Marley, Bob'
};

function createAliasSet(defaultAlias, aliases) {
	return new AliasSet({
		defaultAliasId: defaultAlias.get('id'),
		id: 1
	})
		.save(null, {method: 'insert'})
		.then((model) =>
			model.aliases().attach(aliases)
			.then(() => model)
		);
}

describe('AliasSet model', () => {
	const languageAttribs = {
		frequency: 1,
		id: 1,
		isoCode1: 'en',
		isoCode2b: 'eng',
		isoCode2t: 'eng',
		isoCode3: 'eng',
		name: 'English'
	};

	beforeEach(() =>
		new Language(languageAttribs).save(null, {method: 'insert'})
	);

	afterEach(function truncate() {
		this.timeout(0);

		return util.truncateTables(Bookshelf, [
			'bookbrainz.alias_set',
			'bookbrainz.alias',
			'musicbrainz.language'
		]);
	});

	it('should return a JSON object with correct keys when saved', () => {
		const jsonPromise = new AliasSet({id: 1})
			.save(null, {method: 'insert'})
			.then((model) =>
				model.refresh({withRelated: ['aliases', 'defaultAlias']})
			)
			.then((model) => model.toJSON());

		return expect(jsonPromise).to.eventually.have.all.keys([
			'id', 'defaultAliasId', 'aliases'
		]);
	});

	it('should have an empty list of aliases when none are attached', () => {
		const jsonPromise = new AliasSet({id: 1})
			.save(null, {method: 'insert'})
			.then((model) =>
				model.refresh({withRelated: ['aliases', 'defaultAlias']})
			)
			.then((model) => model.toJSON().aliases);

		return expect(jsonPromise).to.eventually.be.empty;
	});

	it('should have have an alias when one is set', () => {
		const aliasPromise = new Alias(aliasAttribs)
			.save(null, {method: 'insert'});

		const jsonPromise = aliasPromise.then((alias) =>
			createAliasSet(alias, [alias])
		)
			.then((model) =>
				model.refresh({withRelated: ['aliases', 'defaultAlias']})
			)
			.then((model) => model.toJSON());

		return Promise.all([
			expect(jsonPromise).to.eventually
				.have.deep.property('aliases[0].id', 1),
			expect(jsonPromise).to.eventually
				.have.deep.property('defaultAlias.id', 1)
		]);
	});

	it('should have have two aliases when two are set', () => {
		const alias1Promise = new Alias(aliasAttribs)
			.save(null, {method: 'insert'});

		const alias2Promise = new Alias(_.assign(aliasAttribs, {id: 2}))
			.save(null, {method: 'insert'});

		const jsonPromise = Promise.join(
			alias1Promise, alias2Promise, (alias1, alias2) =>
				createAliasSet(alias1, [alias1, alias2])
		)
			.then((model) =>
				model.refresh({withRelated: ['aliases', 'defaultAlias']})
			)
			.then((model) => model.toJSON());

		return Promise.all([
			expect(jsonPromise).to.eventually
				.have.deep.property('aliases.length', 2),
			expect(jsonPromise).to.eventually
				.have.deep.property('defaultAlias.id', 1)
		]);
	});
});
