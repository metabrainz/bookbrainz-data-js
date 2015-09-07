var Bookshelf = require('../bookshelf');
var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;
var UserType = require('../models/userType');

describe('UserType model', function() {
  var userTypePromise = new UserType({userTypeId: 1}).fetch()
  .then(function render(userType) {
    return userType.toJSON();
  });
  it('should return a JSON object with correct keys', function() {
    return expect(userTypePromise).to.eventually.to.have.all.keys([
      'userTypeId', 'label'
    ]);
  });
});
