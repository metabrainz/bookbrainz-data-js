import type Bookshelf from '@metabrainz/bookshelf';
import type {ORM} from '..';
import type {QueryResult} from 'pg';

/**
 * Recursively fetches an area's parents (with "has part" link)
 * Adapted from https://github.com/metabrainz/musicbrainz-server/blob/f79b6d0d2d4bd67254cc34426f17cf8eb21ec5bb/lib/MusicBrainz/Server/Data/Utils.pm#L255-L273
 * @param {object} orm - the BookBrainz ORM, initialized during app setup, or a Bookshelf instance
 * @param {string} areaId - The BBID (= MBID) of the area
 * @param {boolean} checkAllLevels - By default limits to the area types Country, Subdivision and City
 * @returns {Promise} The returned Promise returns the entity's
 * 					   parent default alias
 */
export async function recursivelyGetAreaParentsWithNames(orm: ORM | Bookshelf, areaId: string, checkAllLevels = false) {
	const levelsCondition = checkAllLevels ? '' :
		'WHERE area.type IN (1, 2, 3)';
	const rawSql = `
		WITH RECURSIVE area_descendants AS (
			SELECT entity0 AS parent, entity1 AS descendant, 1 AS depth
			FROM musicbrainz.l_area_area laa
			where entity1 = ${areaId}
				UNION
			SELECT entity0 AS parent, descendant, (depth + 1) AS depth
			FROM musicbrainz.l_area_area laa
			JOIN area_descendants ON area_descendants.parent = laa.entity1
			where entity0 != descendant
		)
		SELECT ad.descendant, ad.parent, ad.depth, area.name
		FROM area_descendants ad
		JOIN musicbrainz.area area on area.id  = ad.parent
		${levelsCondition}
		ORDER BY ad.descendant, ad.depth ASC
	`;

	// Query the database to get the area parents recursively
	const knex = 'bookshelf' in orm ? orm.bookshelf.knex : orm.knex;
	const queryResult = await knex.raw<QueryResult<AreaDescendantRow>>(rawSql);
	if (!Array.isArray(queryResult.rows)) {
		return [];
	}
	return queryResult.rows;
}

type AreaDescendantRow = {
	descendant: string;
	parent: string;
	depth: number;
	name: string;
};
