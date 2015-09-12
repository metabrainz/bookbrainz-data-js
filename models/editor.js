var _ = require('underscore');

var util = require('../util');

var Bookshelf = require('../bookshelf')
require('./gender');
require('./editorType');

var Editor = Bookshelf.Model.extend({
  tableName: 'bookbrainz.editor',
  idAttribute: 'id',
  parse: util.snakeToCamel,
  format: util.camelToSnake,
  gender: function() {
    return this.belongsTo('Gender');
  },
  editorType: function() {
    return this.belongsTo('EditorType');
  }
});

module.exports = Bookshelf.model('Editor', Editor);
