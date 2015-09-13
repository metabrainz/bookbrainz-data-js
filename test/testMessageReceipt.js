var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
var expect = chai.expect;
var Promise = require('bluebird');
var util = require('../util');

var Bookshelf = require('./bookshelf').bookshelf;
var orm = require('./bookshelf').orm;
var Editor = orm.Editor;
var EditorType = orm.EditorType;
var Gender = orm.Gender;
var Message = orm.Message;
var MessageReceipt = orm.MessageReceipt;

chai.use(chaiAsPromised);

describe('MessageReceipt model', function() {
  beforeEach(function() {
    return Promise.all([
      new Gender({id: 1, name: 'test'}).save(null, {method: 'insert'}),
      new EditorType({id: 1, label: 'test_type'}).save(null, {method: 'insert'}),
      new Editor({id: 1, name: 'bob', email: 'bob@test.org', password: 'test', countryId: 1, genderId:1, editorTypeId: 1}).save(null, {method: 'insert'}),
      new Message({senderId: 1, subject: 'test', content: 'test'}).save(null, {method: 'insert'})
    ]);
  });

  afterEach(function() {
    return Promise.all([
      Bookshelf.knex.raw('TRUNCATE bookbrainz.editor CASCADE'),
      Bookshelf.knex.raw('TRUNCATE bookbrainz.editor_type CASCADE'),
      Bookshelf.knex.raw('TRUNCATE musicbrainz.gender CASCADE'),
      Bookshelf.knex.raw('TRUNCATE bookbrainz.message CASCADE'),
      Bookshelf.knex.raw('TRUNCATE bookbrainz.message_receipt CASCADE')
    ]);
  });

  it('should return a JSON object with correct keys when saved', function() {
    var messageReceiptPromise = new MessageReceipt({messageId: 1, recipientId: 1}).save()
    .then(function(model) {
      return model.refresh({withRelated: ['message', 'recipient']}).then(util.fetchJSON);
    });

    return expect(messageReceiptPromise).to.eventually.have.all.keys([
      'id', 'recipient', 'recipientId', 'message', 'messageId', 'archived'
    ]);
  });
});
