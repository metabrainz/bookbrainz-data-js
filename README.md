# BookBrainz Node ORM

[![npm](https://img.shields.io/npm/v/bookbrainz-data.svg)](https://www.npmjs.com/package/bookbrainz-data)
![Build Status](https://github.com/metabrainz/bookbrainz-data-js/actions/workflows/ci.yml/badge.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/bookbrainz/bookbrainz-data-js/badge.svg?branch=master)](https://coveralls.io/github/bookbrainz/bookbrainz-data-js?branch=master)

bookbrainz-data-js provides a node package to allow manipulation of data in a BookBrainz database using a set
of [bookshelf.js](http://bookshelfjs.org/) models. The module is only for accessing data in an existing database - for schema creation, see the [`sql` folder in bookbrainz-site](https://github.com/metabrainz/bookbrainz-site/tree/master/sql).

Each model has its own source file in the "models" directory. These models can be accessed via index.js, which provides a function returning the models, taking an initialized bookshelf.js instance as a single parameter.

### Documentation

The auto-generated documentation is served alongside this repository on Github Pages: https://metabrainz.github.io/bookbrainz-data-js/

## Tests

A suite of simple tests is provided in the tests directory, using the Mocha and Chai libraries.

Copy the file `test/bookshelf.js.example` to `test/bookshelf.js` and modify it according to your local postgres setup. For instructions on setting up the postgres test database, refer to the [testing section of the bookbrainz-site installation docs](https://bookbrainz-dev-docs.readthedocs.io/en/latest/docs/installation.html#testing).

The command for running the tests, following dependency installation, is the standard:

    yarn test
    - or -
    npm test

This will also provide style checking and coverage information.

