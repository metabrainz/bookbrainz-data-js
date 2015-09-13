

module.exports = function(bookshelf) {
  return {
    Editor: require('./models/editor')(bookshelf),
    EditorType: require('./models/editorType')(bookshelf),
    Gender: require('./models/gender')(bookshelf),
    Message: require('./models/message')(bookshelf),
    MessageReceipt: require('./models/messageReceipt')(bookshelf)
  };
};
