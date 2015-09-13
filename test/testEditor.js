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

chai.use(chaiAsPromised);

describe('Editor model', function() {
  beforeEach(function() {
    return Promise.all([
      new Gender({id: 1, name: 'test'}).save(null, {method: 'insert'}),
      new EditorType({id: 1, label: 'test_type'}).save(null, {method: 'insert'})
    ]);
  });

  afterEach(function() {
    return Promise.all([
      Bookshelf.knex.raw('TRUNCATE bookbrainz.editor CASCADE'),
      Bookshelf.knex.raw('TRUNCATE bookbrainz.editor_type CASCADE'),
      Bookshelf.knex.raw('TRUNCATE musicbrainz.gender CASCADE')
    ]);
  });

  it('should return a JSON object with correct keys when saved', function() {
    var editorPromise = new Editor({name: 'bob', email: 'bob@test.org', password: 'test', countryId: 1, genderId:1, editorTypeId: 1}).save()
    .then(function(model) {
      return model.refresh({withRelated: ['editorType', 'gender']}).then(util.fetchJSON);
    });

    return expect(editorPromise).to.eventually.have.all.keys([
      'id', 'name', 'email', 'reputation', 'bio', 'birthDate', 'createdAt',
      'activeAt', 'editorTypeId', 'gender', 'genderId', 'countryId', 'password',
      'revisionsApplied', 'revisionsReverted', 'totalRevisions', 'editorType'
    ]);
  });
});
