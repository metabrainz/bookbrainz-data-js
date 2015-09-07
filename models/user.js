var _ = require('underscore');

var util = require('../util');

var Bookshelf = require('../bookshelf')
require('./gender');
require('./userType');

var User = Bookshelf.Model.extend({
  tableName: 'bookbrainz.user',
  idAttribute: 'user_id',
  parse: util.snakeToCamel,
  format: util.camelToSnake,
  gender: function() {
    return this.belongsTo('Gender', 'genderId');
  },
  userType: function() {
    return this.belongsTo('UserType', 'user_type_id');
  }
});

module.exports = Bookshelf.model('User', User);
