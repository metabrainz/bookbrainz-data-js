var util = require('../util');

var EditorType = null;

module.exports = function(bookshelf) {
  if (!EditorType) {
    EditorType = bookshelf.Model.extend({
      tableName: 'bookbrainz.editor_type',
      idAttribute: 'id',
      parse: util.snakeToCamel,
      format: util.camelToSnake
    });

    EditorType = bookshelf.model('EditorType', EditorType);
  }
  return EditorType;
};
