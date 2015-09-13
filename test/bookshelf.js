var knex = require('knex')({
  client: 'postgresql',
  connection: {
    host     : '127.0.0.1',
    user     : 'bookbrainz',
    password : 'bookbrainz',
    database : 'bookbrainz_test'
  }
});

var Bookshelf = require('bookshelf')(knex);
Bookshelf.plugin('registry');
Bookshelf.plugin('visibility');

var orm = require('../index')(Bookshelf);

module.exports = {
  bookshelf: Bookshelf,
  orm: orm
};
