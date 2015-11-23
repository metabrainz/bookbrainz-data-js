'use strict';

const _ = require('lodash');
_.str = require('underscore.string');

module.exports.snakeToCamel = (attrs) => {
	return _.reduce(attrs, (result, val, key) => {
		let newKey;

		if (key.indexOf('_') === 0) {
			newKey = `_${_.str.camelize(key.substr(1))}`;
		}
		else {
			newKey = _.str.camelize(key);
		}

		result[newKey] = val;
		return result;
	},
	{});
};

module.exports.camelToSnake = (attrs) => {
	return _.reduce(attrs, (result, val, key) => {
		let newKey;

		if (key.indexOf('_') === 0) {
			newKey = `_${_.str.underscored(key.substr(1))}`;
		}
		else {
			newKey = _.str.underscored(key);
		}

		result[newKey] = val;
		return result;
	},
	{});
};
