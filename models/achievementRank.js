'use strict';

const util = require('../util');

module.exports = (bookshelf) => {
	const AchievementRank = bookshelf.Model.extend({
		tableName: 'bookbrainz.achievement_rank',
		idAttribute: 'id',
		parse: util.snakeToCamel,
		format: util.camelToSnake,
		editor() {
			return this.belongsTo('Editor', 'editor_id');
		},
		achievement() {
			return this.belongsTo('AchievementType', 'achievement_id');
		}
	});

	return bookshelf.model('AchievementRank', AchievementRank);
};
