var _ = require('underscore');
var util = require('../util');

var MessageReceipt = null;

module.exports = function(bookshelf) {
  require('./editor')(bookshelf);
  require('./editorType')(bookshelf);
  require('./message')(bookshelf);

  if (!MessageReceipt) {
    MessageReceipt = bookshelf.Model.extend({
      tableName: 'bookbrainz.message_receipt',
      idAttribute: 'id',
      parse: util.snakeToCamel,
      format: util.camelToSnake,
      message: function() {
        return this.belongsTo('Message');
      },
      recipient: function() {
        return this.belongsTo('Editor');
      }
    });

    MessageReceipt = bookshelf.model('MessageReceipt', MessageReceipt);
  }
  return MessageReceipt;
};
