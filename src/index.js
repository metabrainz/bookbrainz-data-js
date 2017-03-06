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

const _ = require('lodash');
const glob = require('glob');
const path = require('path');

module.exports = function init(config) {
	/* eslint-disable global-require */
	const bookshelf = require('bookshelf')(require('knex')(config));
	bookshelf.plugin('registry');
	bookshelf.plugin('visibility');
	bookshelf.plugin('virtuals');

	const modelsDirectory = path.join(__dirname, 'models');
	const modelFiles = glob.sync('**/*.js', {cwd: modelsDirectory});

	const output = {
		bookshelf
	};

	modelFiles.forEach((file) => {
		const modelName =
			_.upperFirst(path.basename(file, path.extname(file)));
		const modelFile = `./${path.join('models/', file)}`;
		output[modelName] = require(modelFile)(bookshelf);
	});

	return output;

	/* eslint-enable global-require */
};
