var _ = require('underscore');

var util = require('../util');

var Gender = null;

module.exports = function(bookshelf) {
  if (!Gender) {
    Gender = bookshelf.Model.extend({
      tableName: 'musicbrainz.gender',
      parse: util.snakeToCamel,
      format: util.camelToSnake
    });

    Gender = bookshelf.model('Gender', Gender);
  }
  return Gender;
}
