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

const util = require('../util');

let Message = null;

module.exports = (bookshelf) => {
	require('./editor')(bookshelf);
	require('./editorType')(bookshelf);

	if (!Message) {
		Message = bookshelf.Model.extend({
			tableName: 'bookbrainz.message',
			idAttribute: 'id',
			parse: util.snakeToCamel,
			format: util.camelToSnake,
			sender() {
				return this.belongsTo('Editor', 'sender_id');
			},
			receipts() {
				return this.hasMany('MessageReceipt', 'message_id');
			}
		});

		Message = bookshelf.model('Message', Message);
	}
	return Message;
};
