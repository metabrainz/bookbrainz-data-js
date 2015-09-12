var util = require('../util');

var Bookshelf = require('../bookshelf')

var EditorType = Bookshelf.Model.extend({
  tableName: 'bookbrainz.editor_type',
  idAttribute: 'id',
  parse: util.snakeToCamel,
  format: util.camelToSnake
});

module.exports = Bookshelf.model('EditorType', EditorType);
