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

var util = require('../util');

var MessageReceipt = null;

module.exports = function(bookshelf) {
	require('./editor')(bookshelf);
	require('./editorType')(bookshelf);
	require('./message')(bookshelf);

	if (!MessageReceipt) {
		MessageReceipt = bookshelf.Model.extend({
			tableName: 'bookbrainz.message_receipt',
			idAttribute: 'id',
			parse: util.snakeToCamel,
			format: util.camelToSnake,
			message: function() {
				return this.belongsTo('Message', 'message_id');
			},
			recipient: function() {
				return this.belongsTo('Editor', 'recipient_id');
			}
		});

		MessageReceipt = bookshelf.model('MessageReceipt', MessageReceipt);
	}
	return MessageReceipt;
};
