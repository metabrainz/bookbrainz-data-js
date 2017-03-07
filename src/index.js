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

const achievementType = require('./models/achievementType');
const achievementUnlock = require('./models/achievementUnlock');
const alias = require('./models/alias');
const aliasSet = require('./models/aliasSet');
const annotation = require('./models/annotation');
const area = require('./models/area');
const creator = require('./models/entities/creator');
const creatorData = require('./models/data/creatorData');
const creatorHeader = require('./models/headers/creatorHeader');
const creatorRevision = require('./models/revisions/creatorRevision');
const edition = require('./models/entities/edition');
const editionData = require('./models/data/editionData');
const editionFormat = require('./models/editionFormat');
const editionHeader = require('./models/headers/editionHeader');
const editionRevision = require('./models/revisions/editionRevision');
const editionStatus = require('./models/editionStatus');
const editor = require('./models/editor');
const editorEntityVisits = require('./models/editorEntityVisits');
const editorType = require('./models/editorType');
const entity = require('./models/entity');
const gender = require('./models/gender');
const disambiguation = require('./models/disambiguation');
const creatorType = require('./models/creatorType');
const identifier = require('./models/identifier');
const identifierSet = require('./models/identifierSet');
const identifierType = require('./models/identifierType');
const language = require('./models/language');
const languageSet = require('./models/languageSet');
const note = require('./models/note');
const publication = require('./models/entities/publication');
const publicationData = require('./models/data/publicationData');
const publicationHeader = require('./models/headers/publicationHeader');
const publicationRevision = require('./models/revisions/publicationRevision');
const publicationType = require('./models/publicationType');
const publisher = require('./models/entities/publisher');
const publisherData = require('./models/data/publisherData');
const publisherHeader = require('./models/headers/publisherHeader');
const publisherRevision = require('./models/revisions/publisherRevision');
const publisherSet = require('./models/publisherSet');
const publisherType = require('./models/publisherType');
const relationship = require('./models/relationship');
const relationshipSet = require('./models/relationshipSet');
const relationshipType = require('./models/relationshipType');
const releaseEvent = require('./models/releaseEvent');
const releaseEventSet = require('./models/releaseEventSet');
const revision = require('./models/revision');
const titleType = require('./models/titleType');
const titleUnlock = require('./models/titleUnlock');
const work = require('./models/entities/work');
const workData = require('./models/data/workData');
const workHeader = require('./models/headers/workHeader');
const workRevision = require('./models/revisions/workRevision');
const workType = require('./models/workType');

const Bookshelf = require('bookshelf');
const knex = require('knex');

module.exports = function init(config) {
	const bookshelf = Bookshelf(knex(config));
	bookshelf.plugin('registry');
	bookshelf.plugin('visibility');
	bookshelf.plugin('virtuals');

	// Initialize these here to set up dependencies
	const CreatorData = creatorData(bookshelf);
	const EditionData = editionData(bookshelf);
	const PublicationData = publicationData(bookshelf);
	const PublisherData = publisherData(bookshelf);
	const WorkData = workData(bookshelf);

	return {
		AchievementType: achievementType(bookshelf),
		AchievementUnlock: achievementUnlock(bookshelf),
		Alias: alias(bookshelf),
		AliasSet: aliasSet(bookshelf),
		Annotation: annotation(bookshelf),
		Area: area(bookshelf),
		Creator: creator(bookshelf),
		CreatorData,
		CreatorHeader: creatorHeader(bookshelf),
		CreatorRevision: creatorRevision(bookshelf),
		CreatorType: creatorType(bookshelf),
		Disambiguation: disambiguation(bookshelf),
		Edition: edition(bookshelf),
		EditionData,
		EditionFormat: editionFormat(bookshelf),
		EditionHeader: editionHeader(bookshelf),
		EditionRevision: editionRevision(bookshelf),
		EditionStatus: editionStatus(bookshelf),
		Editor: editor(bookshelf),
		EditorEntityVisits: editorEntityVisits(bookshelf),
		EditorType: editorType(bookshelf),
		Entity: entity(bookshelf),
		Gender: gender(bookshelf),
		Identifier: identifier(bookshelf),
		IdentifierSet: identifierSet(bookshelf),
		IdentifierType: identifierType(bookshelf),
		Language: language(bookshelf),
		LanguageSet: languageSet(bookshelf),
		Note: note(bookshelf),
		Publication: publication(bookshelf),
		PublicationData,
		PublicationHeader: publicationHeader(bookshelf),
		PublicationRevision: publicationRevision(bookshelf),
		PublicationType: publicationType(bookshelf),
		Publisher: publisher(bookshelf),
		PublisherData,
		PublisherHeader: publisherHeader(bookshelf),
		PublisherRevision: publisherRevision(bookshelf),
		PublisherSet: publisherSet(bookshelf),
		PublisherType: publisherType(bookshelf),
		Relationship: relationship(bookshelf),
		RelationshipSet: relationshipSet(bookshelf),
		RelationshipType: relationshipType(bookshelf),
		ReleaseEvent: releaseEvent(bookshelf),
		ReleaseEventSet: releaseEventSet(bookshelf),
		Revision: revision(bookshelf),
		TitleType: titleType(bookshelf),
		TitleUnlock: titleUnlock(bookshelf),
		Work: work(bookshelf),
		WorkData,
		WorkHeader: workHeader(bookshelf),
		WorkRevision: workRevision(bookshelf),
		WorkType: workType(bookshelf),
		bookshelf
	};
};
