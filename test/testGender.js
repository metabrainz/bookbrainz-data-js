var Promise = require('bluebird');

var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;

var util = require('../util');

var Bookshelf = require('./bookshelf').bookshelf;
var orm = require('./bookshelf').orm;
var Gender = orm.Gender;

describe('Gender model', function() {
  afterEach(function() {
    return Bookshelf.knex.raw('TRUNCATE musicbrainz.gender CASCADE');
  });

  it('should return a JSON object with correct keys when saved', function() {
    var genderPromise = new Gender({name: 'Test'}).save()
    .then(function(model) {
      return model.refresh().then(util.fetchJSON);
    });

    return expect(genderPromise).to.eventually.have.all.keys([
      'id', 'name', 'parent', 'childOrder', 'description'
    ]);
  });
});
