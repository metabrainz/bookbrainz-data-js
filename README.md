# BookBrainz Node ORM
[![Build Status](https://img.shields.io/travis/bookbrainz/bookbrainz-data-js.svg)](https://travis-ci.org/bookbrainz/bookbrainz-data-js)
[![Dependency Status](https://img.shields.io/david/bookbrainz/bookbrainz-data-js.svg)](https://david-dm.org/bookbrainz/bookbrainz-data-js)
[![devDependency Status](https://img.shields.io/david/dev/bookbrainz/bookbrainz-data-js.svg)](https://david-dm.org/bookbrainz/bookbrainz-data-js#info=devDependencies)
[![Code Climate](https://img.shields.io/codeclimate/github/bookbrainz/bookbrainz-data-js.svg)](https://codeclimate.com/github/bookbrainz/bookbrainz-data-js)
[![Code Climate](https://img.shields.io/codeclimate/coverage/github/bookbrainz/bookbrainz-data-js.svg)](https://codeclimate.com/coverage/github/bookbrainz/bookbrainz-data-js)

bookbrainz-data-js provides a node package to allow manipulation of data in a BookBrainz database using a set
of [bookshelf.js](http://bookshelfjs.org/) models. The module is only for accessing data in an existing database - for schema creation, see [bookbrainz-sql](https://github.com/bookbrainz/bookbrainz-sql).

Each model has its own source file in the "models" directory. These models can be accessed via index.js, which provides a function returning the models, taking an initialized bookshelf.js instance as a single parameter.

A suite of simple tests is provided in the tests directory - the command for running the tests, following dependency installation, is the standard:

    npm test

This will also provide style checking and coverage information.

Please note, ES6 features are used within this codebase, and it has only been tested in Node 4.x. It may also work in Node 0.12.x, but not any earlier than that.
