var Bookshelf = require('../bookshelf');
var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;
var Gender = require('../models/gender');

describe('Gender model', function() {
  var genderPromise = new Gender({id: 1}).fetch()
  .then(function render(gender) {
    return gender.toJSON();
  });
  it('should return a JSON object with correct keys', function() {
    return expect(genderPromise).to.eventually.to.have.all.keys([
      'id', 'name', 'parent', 'childOrder', 'description'
    ]);
  });
});
