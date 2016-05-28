'use strict';

const util = require('../util');

module.exports = (bookshelf) => {
	const TitleUnlock = bookshelf.Model.extend({
		tableName: 'bookbrainz.title_unlock',
		idAttribute: 'id',
		parse: util.snakeToCamel,
		format: util.camelToSnake,
		editor() {
			return this.belongsTo('Editor', 'editor_id');
		},
		title() {
			return this.belongsTo('TitleType', 'title_id');
		}
	});

	return bookshelf.model('TitleUnlock', TitleUnlock);
};
