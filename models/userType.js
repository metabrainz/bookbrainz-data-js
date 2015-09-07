var util = require('../util');

var Bookshelf = require('../bookshelf')

var UserType = Bookshelf.Model.extend({
  tableName: 'bookbrainz.user_type',
  idAttribute: 'user_type_id',
  parse: util.snakeToCamel,
  format: util.camelToSnake
});

module.exports = Bookshelf.model('UserType', UserType);
