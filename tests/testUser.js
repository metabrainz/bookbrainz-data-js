var Bookshelf = require('../bookshelf');
var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;
var User = require('../models/user');

describe('User model', function() {
  var userPromise = new User({userId: 1}).fetch({withRelated: ['userType']})
  .then(function render(user) {
    return user.toJSON();
  });
  it('should return a JSON object with correct keys', function() {
    return expect(userPromise).to.eventually.to.have.all.keys([
      'userId', 'name', 'email', 'reputation', 'bio', 'birthDate', 'createdAt',
      'activeAt', 'userTypeId', 'genderId', 'countryId', 'password',
      'revisionsApplied', 'revisionsReverted', 'totalRevisions', 'userType'
    ]);
  });
});
