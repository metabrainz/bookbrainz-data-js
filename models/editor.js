var _ = require('underscore');
var util = require('../util');

var Editor = null;

module.exports = function(bookshelf) {
  require('./gender')(bookshelf);
  require('./editorType')(bookshelf);

  if (!Editor) {
    Editor = bookshelf.Model.extend({
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

    Editor = bookshelf.model('Editor', Editor);
  }
  return Editor;
};
