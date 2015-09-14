var _ = require('underscore');
_.str = require('underscore.string');

module.exports.snakeToCamel = function(attrs) {
  return _.reduce(attrs, function(result, val, key) {
    var newKey;
    if (key.indexOf('_') === 0) {
      newKey = '_' + _.str.camelize(key.substr(1));
    } else {
      newKey = _.str.camelize(key);
    }

    result[newKey] = val;
    return result;
  }, {});
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
  }, {});
};

module.exports.fetchJSON = function(model) {
  return model.toJSON();
};
