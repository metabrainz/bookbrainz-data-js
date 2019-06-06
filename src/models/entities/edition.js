/*
 * Copyright (C) 2015-2016  Ben Ockmore
 * Copyright (C) 2019  Nicolas Pelletier
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
import _ from 'lodash';
import {createEditionGroupForNewEdition} from '../../util';


export default function edition(bookshelf) {
	const EditionData = bookshelf.model('EditionData');

	const Edition = EditionData.extend({
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
				if (_.has(model, 'changed.editionGroupBbid') &&
					!model.get('editionGroupBbid')
				) {
					throw new Error('EditionGroupBbid required in Edition update');
				}
			});

			this.on('creating', async (model, attrs, options) => {
				// Automatically create a new Edition Group if there is none selected,
				// in the same transaction
				if (!model.get('editionGroupBbid')) {
					const aliasSetId = model.get('aliasSetId');
					const revisionId = model.get('revisionId');
					try {
						const newEditionGroupBBID = await createEditionGroupForNewEdition(bookshelf, options.transacting, aliasSetId, revisionId);
						model.set('editionGroupBbid', newEditionGroupBBID);
					}
					catch (error) {
						throw error;
					}
				}
			});
		},
		revision() {
			return this.belongsTo('EditionRevision', 'revision_id');
		},
		tableName: 'bookbrainz.edition'
	});

	return bookshelf.model('Edition', Edition);
}
