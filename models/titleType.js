'use strict';

const Promise = require('bluebird');

const util = require('../util');

module.exports = (bookshelf) => {
	const TitleType = bookshelf.Model.extend({
		tableName: 'bookbrainz.title_type'
		idAttribute: 'id',
		parse: util.snakeToCamel,
		format: util.camelToSnake
	});

	return bookshelf.model('TitleType', TitleType);
};
