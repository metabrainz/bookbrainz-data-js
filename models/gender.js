var Bookshelf = require('../bookshelf');
var _ = require('underscore');

var util = require('../util');

var Gender = Bookshelf.Model.extend({
  tableName: 'musicbrainz.gender',
  parse: util.snakeToCamel,
  format: util.camelToSnake
});

module.exports = Bookshelf.model('Gender', Gender);
