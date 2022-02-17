/*
 * Copyright (C) 2022  Shivam Awasthi
 * Some parts adapted from bookbrainz-site
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


/**
 * @param  {object} orm - the BookBrainz ORM, initialized during app setup
 * @param  {object} relationship - the relationship object, with typeId=10 (Edition contains Work)
 * @returns {Object} - Returns the relationship object after loading the author of the Work
*/
export async function loadAuthorNames(orm: any, relationship: any) {
	const {RelationshipSet} = orm;
	// const {entity} = res.locals;

	async function getEntityWithAlias(relEntity) {
		const redirectBbid = await orm.func.entity.recursivelyGetRedirectBBID(orm, relEntity.bbid, null);

		return orm.Author.forge({bbid: redirectBbid})
			.fetch({require: false, withRelated: ['defaultAlias']});
	}

	// Loading the relationshipSet of the Work
	const relationshipSet = await RelationshipSet.forge({id: relationship.target.relationshipSetId})
		.fetch({
			require: false,
			withRelated: [
				'relationships.source'
			]
		});
	const relationships = relationshipSet ? relationshipSet.related('relationships').toJSON() : [];

	// Now trying to load the Author using the relationship with typeId=8, i.e, "Author Wrote Work"
	relationship.target.author = relationships.filter(rel => rel.typeId === 8)[0];
	if (relationship.target.author) {
		const source = await getEntityWithAlias(relationship.target.author.source);
		relationship.target.author = source.toJSON();
	}

	return relationship;
}
