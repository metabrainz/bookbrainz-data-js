# BookBrainz Node ORM

[![npm](https://img.shields.io/npm/v/bookbrainz-data.svg)](https://www.npmjs.com/package/bookbrainz-data)
[![Known Vulnerabilities](https://snyk.io/test/github/bookbrainz/bookbrainz-data-js/badge.svg)](https://snyk.io/test/github/bookbrainz/bookbrainz-data-js)
[![Build Status](https://travis-ci.org/bookbrainz/bookbrainz-data-js.svg?branch=master)](https://travis-ci.org/bookbrainz/bookbrainz-data-js)
[![dependencies Status](https://david-dm.org/bookbrainz/bookbrainz-data-js/status.svg)](https://david-dm.org/bookbrainz/bookbrainz-data-js)
[![Coverage Status](https://coveralls.io/repos/github/bookbrainz/bookbrainz-data-js/badge.svg?branch=master)](https://coveralls.io/github/bookbrainz/bookbrainz-data-js?branch=master)

bookbrainz-data-js provides a node package to allow manipulation of data in a BookBrainz database using a set
of [bookshelf.js](http://bookshelfjs.org/) models. The module is only for accessing data in an existing database - for schema creation, see the [`sql` folder in bookbrainz-site](https://github.com/metabrainz/bookbrainz-site/tree/master/sql).

Each model has its own source file in the "models" directory. These models can be accessed via index.js, which provides a function returning the models, taking an initialized bookshelf.js instance as a single parameter.

### Documentation
The auto-generated documentation is served alongisde this repository on Github Pages: https://metabrainz.github.io/bookbrainz-data-js/

## Tests

A suite of simple tests is provided in the tests directory, using the Mocha and Chai libraries.

Copy the file `test/bookshelf.js.example` to `test/bookshelf.js` and modify it according to your local postgres setup. For instructions on setting up the postgres test database, refer to the [bookbrainz-site repo](https://github.com/metabrainz/bookbrainz-site/blob/master/README.md#testing).

The command for running the tests, following dependency installation, is the standard:

    yarn test
    - or -
    npm test

This will also provide style checking and coverage information.

Please note, ES6 features are used within this codebase, and it has only been tested in Node 4.x. It may also work in Node 0.12.x, but not any earlier than that.
