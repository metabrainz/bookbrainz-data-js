var knex = require('knex')({
  client: 'postgresql',
  connection: {
    host     : '127.0.0.1',
    user     : 'bookbrainz',
    password : 'bookbrainz',
    database : 'bookbrainz'
  }
});

var Bookshelf = require('bookshelf')(knex);
Bookshelf.plugin('registry');
Bookshelf.plugin('visibility');

module.exports = Bookshelf;
