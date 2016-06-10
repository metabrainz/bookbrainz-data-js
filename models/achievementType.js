'use strict';

const util = require('../util');

module.exports = (bookshelf) => {
	const AchievementType = bookshelf.Model.extend({
		tableName: 'bookbrainz.achievement_type',
		idAttribute: 'id',
		parse: util.snakeToCamel,
		format: util.camelToSnake,
		achievementUnlocks() {
			return this.hasMany('AchievementUnlock', 'achievement_id');
		}
	});

	return bookshelf.model('AchievementType', AchievementType);
};
