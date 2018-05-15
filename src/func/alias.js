// @flow

import * as Immutable from 'immutable';
import type {AliasRecordT, EntityRecordT} from './types';
import type {Transaction} from 'knex';

/* eslint-disable no-undefined */
const AliasRecord = Immutable.Record({
	ID: null,
	languageID: undefined,
	name: undefined,
	primary: undefined,
	sortName: undefined
});
/* eslint-enable no-undefined */

function createAliasSet(): number {
	// TODO: write this function
	return 1;
}

function getOrCreateAlias(trx: Transaction, alias: AliasRecordT) {
	if (alias.get('ID') === null) {
		return trx;
	}

	/* eslint-disable camelcase */
	const insertData = {
		language_id: alias.get('languageID'),
		name: alias.get('name'),
		primary: alias.get('primary'),
		sort_name: alias.get('sortName')
	};
	/* eslint-enable camelcase */

	const selectData = {
		id: parseInt(alias.get('ID'), 10),
		...insertData
	};

	const returning = [
		{ID: 'id'},
		'name',
		{sortName: 'sort_name'},
		{languageID: 'language_id'},
		'primary'
	];

	return trx
		.select(...returning)
		.from('bookbrainz.alias')
		.where(selectData)
		.then((selectRows) => {
			if (selectRows.length > 0) {
				return new AliasRecord({
					...selectRows[0],
					ID: selectRows[0].ID.toString()
				});
			}

			return trx
				.returning(returning)
				.insert(insertData).into('bookbrainz.alias')
				.then((insertRows) => new AliasRecord({
					...insertRows[0],
					ID: insertRows[0].ID.toString()
				}));
		});
}

function linkAliases(
	trx: Transaction, setID: number, aliasesToLink: Immutable.Set<AliasRecordT>
) {
	// TODO: write this function
	return trx;
}

/**
 * Update an existing alias set, using the provided data.
 * The existing alias set is fetched and checked against the new set to
 * determine any differences. If there are no differences, the function
 * does nothing, and returns the existing set. If there are differences,
 * a new set it created, and this is returned.
 *
 * @param {Transaction} trx - active Knex transaction object
 * @param {EntityRecordT} originalEntity - the entity being edited
 * @param {Immutable.Set<AliaseRecordT>} newAliases - the new set of aliases
 *        for the entity
 * @returns {Transaction} - the active transaction with alias updates applied
 */
export function updateAliases(
	trx: Transaction,
	originalEntity: EntityRecordT,
	newAliases: Immutable.Set<AliasRecordT>
): Transaction {
	const originalAliases = originalEntity.get('aliases');
	if (newAliases === originalAliases) {
		// Nothing to do, return
		return trx;
	}

	if (newAliases.isEmpty()) {
		// This will be handled at parent level by setting the set field to
		// null.
		return trx;
	}

	// Create a new set
	const setID = createAliasSet();

	// Subtract originalAliases from newAliases to get new aliases
	const addedAliases = newAliases.subtract(originalAliases);
	const promiseA = linkAliases(trx, setID, addedAliases);

	// Intersect newAliases with originalAliases to get preserved aliases
	const preservedAliases = originalAliases.subtract(newAliases);
	const promiseB = linkAliases(trx, setID, preservedAliases);

	return promiseA.then(() => promiseB);
}


/*
type AliasProps = {
	ID: string,
	name: string,
	sortName: string,
	languageID: string,
	primary: boolean
} | {ID: null};
type AliasRecord = Immutable.Record<AliasProps>;


type EntityProps = {
	BBID: ?string,
	dataID: string,
	revisionID: string,
	master: boolean,
	type: EntityTypeString,
	annotation: string,
	disambiguation: string,
	aliases: Immutable.Set<AliasRecord>,
	identifiers: Immutable.Set<IdentifierRecord>,
	relationships: Immutable.Set<RelationshipRecord>
};

export type EntityRecord = Immutable.Record<EntityProps>;
*/
