/*
 * Copyright (C) 2016  Max Prettyjohns
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
import bookshelf from './bookshelf';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import glob from 'glob';
import path from 'path';


chai.use(chaiAsPromised);
const {expect} = chai;

describe('Module', () => {
	it('should return one model for each file in the models directory', () => {
		const modelsDirectory = path.join(__dirname, '../src/models');
		const modelFiles = glob.sync('**/*.js', {cwd: modelsDirectory});
		const modelNames = modelFiles.map(
			(file) => _.upperFirst(path.basename(file, path.extname(file)))
		);
		return expect(bookshelf).to.include.keys(modelNames);
	});

	it(
		'should have bookshelf and utils properties',
		() => expect(bookshelf).to.include.keys('bookshelf', 'util')
	);

	it(
		'should have a bookshelf property with a knex property',
		() => expect(bookshelf.bookshelf).to.have.property('knex')
	);
});
