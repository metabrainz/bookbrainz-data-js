var _ = require('underscore');
_.str = require('underscore.string');

module.exports.snakeToCamel = function(attrs) {
  return _.reduce(attrs, function(result, val, key) {
    result[_.str.camelize(key)] = val;
    return result;
  }, {});
};

module.exports.camelToSnake = function(attrs) {
  return _.reduce(attrs, function(result, val, key) {
    result[_.str.underscored(key)] = val;
    return result;
  }, {});
};
