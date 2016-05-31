'use strict';

const util = require('../util');

module.exports = (bookshelf) => {
	const AchievementUnlock = bookshelf.Model.extend({
		tableName: 'bookbrainz.achievement_unlock',
		idAttribute: 'id',
		parse: util.snakeToCamel,
		format: util.camelToSnake,
		editor() {
			return this.belongsTo('Editor', 'editor_id');
		},
		achievement() {
			return this.belongsTo('AchievementType', 'achievment_id');
		}
	});

	return bookshelf.model('AchievementUnlock', AchievementUnlock);
};
