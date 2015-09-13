var _ = require('underscore');
var util = require('../util');

var Message = null;

module.exports = function(bookshelf) {
  require('./editor')(bookshelf);
  require('./editorType')(bookshelf);

  if (!Message) {
    Message = bookshelf.Model.extend({
      tableName: 'bookbrainz.message',
      idAttribute: 'id',
      parse: util.snakeToCamel,
      format: util.camelToSnake,
      sender: function() {
        return this.belongsTo('Editor', 'sender_id');
      }
    });

    Message = bookshelf.model('Message', Message);
  }
  return Message;
};
