var _ = require('lodash');
_.str = require('underscore.string');

module.exports.snakeToCamel = function(attrs) {
	return _.reduce(attrs, function(result, val, key) {
		var newKey;
		if (key.indexOf('_') === 0) {
			newKey = '_' + _.str.camelize(key.substr(1));
		}
		else {
			newKey = _.str.camelize(key);
		}

		result[newKey] = val;
		return result;
	},
	{});
};

module.exports.camelToSnake = function(attrs) {
	return _.reduce(attrs, function(result, val, key) {
		var newKey;
		if (key.indexOf('_') === 0) {
			newKey = '_' + _.str.underscored(key.substr(1));
		} else {
			newKey = _.str.underscored(key);
		}

		result[newKey] = val;
		return result;
	},
	{});
};

module.exports.parseData = function(partialDate) {
	const parts = partialDate.split('-');

	switch(parts.length) {
		case 3:
			return {
				fullDate: new Date(
					parseInt(parts[0], 10), parseInt(parts[1], 10),
					parseInt(parts[2], 10)
				),
				precision: 'DAY'
			};
		case 2:
			return {
				fullDate: new Date(
					parseInt(parts[0], 10), parseInt(parts[1], 10), 1
				),
				precision: 'MONTH'
			};
		case 1:
			return {
				fullDate: new Date(parseInt(parts[0], 10), 1, 1),
				precision: 'YEAR'
			};
		default:
			return null;
	}
}

module.exports.formatDate = function(fullDate, precision) {
	const year = `0000${fullDate.year}`.slice(-4);
	const month = `00${fullDate.month}`.slice(-2);
	const day = `00${fullDate.day}`.slice(-2);
	switch (precision) {
		case 'MONTH':
			return `${year}-${month}`;
		case 'DAY':
			return `${year}-${month}-${day}`;
		case 'YEAR':
		default:
			return `${year}`;
	}
};
