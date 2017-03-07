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

'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const {expect} = chai;
const _ = require('lodash');
const glob = require('glob');
const path = require('path');

const bookshelf = require('./bookshelf');

describe('Module', () => {
	it('should return one model for each file in the models directory', () => {
		const modelsDirectory = path.join(__dirname, '../src/models');
		const modelFiles = glob.sync('**/*.js', {cwd: modelsDirectory});
		const modelNames = modelFiles.map((file) =>
			_.upperFirst(path.basename(file, path.extname(file)))
		);
		return expect(bookshelf)
			.to.include.keys(modelNames)
			.and.to.include.keys('bookshelf');
	});
});
