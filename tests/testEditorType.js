var Promise = require('bluebird');
var Bookshelf = require('../bookshelf');
var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;
var util = require('../util');

var EditorType = require('../models/editorType');

describe('EditorType model', function() {
  afterEach(function() {
    return Bookshelf.knex.raw('TRUNCATE bookbrainz.editor_type CASCADE');
  });

  it('should return a JSON object with correct keys when saved', function() {
    var editorTypeCreationPromise = new EditorType({label: 'test_type'})
    .save()
    .then(function(model) {
      return model.refresh().then(util.fetchJSON)
    });

    return expect(editorTypeCreationPromise).to.eventually.have.all.keys([
      'id', 'label'
    ]);
  });
});
