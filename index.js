/*
 * Copyright (C) 2015  Ben Ockmore
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

'use strict';

module.exports = {
	init(config) {
		const bookshelf = require('bookshelf')(require('knex')(config));
		bookshelf.plugin('registry');
		bookshelf.plugin('visibility');

		this.bookshelf = bookshelf;

		const entity = require('./models/entity')(bookshelf);

		this.Alias = require('./models/alias')(bookshelf);
		this.Annotation = require('./models/annotation')(bookshelf);
		this.Disambiguation = require('./models/disambiguation')(bookshelf);
		this.Editor = require('./models/editor')(bookshelf);
		this.EditorType = require('./models/editorType')(bookshelf);
		this.Gender = require('./models/gender')(bookshelf);
		this.Language = require('./models/language')(bookshelf);
		this.Message = require('./models/message')(bookshelf);
		this.MessageReceipt = require('./models/messageReceipt')(bookshelf);
		this.Entity = entity.Entity;
		this.Creator = entity.Creator;
		this.EntityData = require('./models/entityData')(bookshelf);
		this.Revision = require('./models/revision')(bookshelf);
		this.EntityRevision = require('./models/entityRevision')(bookshelf);

		this.EntityTypeError = entity.EntityTypeError;
	}
};
