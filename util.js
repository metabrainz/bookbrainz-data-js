'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const diff = require('deep-diff').diff;

module.exports.snakeToCamel = (attrs) => {
	return _.reduce(attrs, (result, val, key) => {
		let newKey;

		if (key.indexOf('_') === 0) {
			newKey = `_${_.camelCase(key.substr(1))}`;
		}
		else {
			newKey = _.camelCase(key);
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
			newKey = `_${_.snakeCase(key.substr(1))}`;
		}
		else {
			newKey = _.snakeCase(key);
		}

		result[newKey] = val;
		return result;
	},
	{});
};

class EntityTypeError extends Error {
	constructor(message) {
		super(message);
		this.name = 'EntityTypeError';
		this.message = message;
		this.stack = (new Error()).stack;
	}
}

module.exports.EntityTypeError = EntityTypeError;

module.exports.validateEntityType = (model) => {
	if (model.get('_type') !== model.typeId) {
		throw new Error(
			`Entity ${model.get('bbid')} is not a ${model.typeId}`
		);
	}
};

module.exports.truncateTables =
	(Bookshelf, tables) =>
	Promise.each(tables,
		(table) => Bookshelf.knex.raw(`TRUNCATE ${table} CASCADE`)
	);

module.exports.diffRevisions = (base, other, includes) => {
	function diffFilter(path, key) {
		return _.includes(['_pivot_set_id', '_pivot_relationship_id'], key);
	}

	const baseDataPromise = base.related('data').fetch({withRelated: includes});

	if (!other) {
		return baseDataPromise.then((baseData) =>
			diff(
				{},
				baseData ? baseData.toJSON() : {},
				diffFilter
			)
		);
	}

	const otherDataPromise =
		other.related('data').fetch({withRelated: includes});

	return Promise.join(baseDataPromise, otherDataPromise,
		(baseData, otherData) =>
		diff(
			otherData ? otherData.toJSON() : {},
			baseData ? baseData.toJSON() : {},
			diffFilter
		)
	);
};

module.exports.formatDate = function(year, month, day) {
	if (!year) {
		return null;
	}

	const yearString = _.padStart(year.toString(), 4, '0');

	if (!month) {
		return `${yearString}`;
	}

	const monthString = _.padStart(month.toString(), 2, '0');

	if (!day) {
		return `${yearString}-${monthString}`;
	}

	const dayString = _.padStart(day.toString(), 2, '0');

	return `${yearString}-${monthString}-${dayString}`;
};

module.exports.parseDate = function(date) {
	const parts = date.split('-');
	if (parts.length === 3) {
		return parts.map((part) => parseInt(part, 10));
	}

	if (parts.length === 2) {
		return parts.map((part) => parseInt(part, 10)).concat([null]);
	}

	if (parts.length === 1) {
		return parts.map((part) => parseInt(part, 10)).concat([null, null]);
	}

	return [null, null, null];
};
