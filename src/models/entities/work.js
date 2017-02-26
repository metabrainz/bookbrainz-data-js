/*
 * Copyright (C) 2015-2016  Ben Ockmore
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

module.exports = (bookshelf) => {
	const WorkData = bookshelf.model('WorkData');

	const Work = WorkData.extend({
		defaultAlias() {
			return this.belongsTo('Alias', 'default_alias_id');
		},
		idAttribute: 'bbid',
		initialize() {
			this.on('fetching', (model, col, options) => {
				// If no revision is specified, fetch the master revision
				if (!model.get('revisionId')) {
					options.query.where({master: true});
				}
			});

			this.on('updating', (model, attrs, options) => {
				// Always update the master revision.
				options.query.where({master: true});
			});
		},
		revision() {
			return this.belongsTo('WorkRevision', 'revision_id');
		},
		tableName: 'bookbrainz.work'
	});

	return bookshelf.model('Work', Work);
};
