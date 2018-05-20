import Promise from 'bluebird';

/* eslint-disable camelcase */
function getEditorIDByMetaBrainzID(trx, metabrainzUserID) {
	return trx('bookbrainz.editor')
		.select('id')
		.where({metabrainz_user_id: metabrainzUserID})
		.then((rows) => {
			if (rows.length > 0) {
				return rows[0].id;
			}
			return null;
		});
}

function clearEditorByID(trx, editorID) {
	return trx('bookbrainz.editor')
		.where({editor_id: editorID})
		.update({
			area_id: null,
			bio: '',
			birth_date: null,
			cached_metabrainz_name: '<deleted>',
			gender_id: null,
			name: `Deleted Editor #${editorID}`
		});
}

function clearEditorLanguagesByEditorID(trx, editorID) {
	return trx('bookbrainz.editor__language')
		.where({editor_id: editorID})
		.del();
}
/* eslint-enable camelcase */

export function deleteEditorByMetaBrainzID(knex) {
	return (metabrainzUserID) => knex.transaction((trx) => {
		// Fetch user by MetaBrainz ID
		const editorIDPromise =
			getEditorIDByMetaBrainzID(trx, metabrainzUserID);

		return editorIDPromise.then((editorID) => {
			if (editorID === null) {
				return false;
			}

			// Set the editor name to "Deleted Editor #ID"
			// Set cached MetaBrainz name to "<deleted>"
			// Also clear bio, birth_date, gender, area
			const clearEditorPromise =
				clearEditorByID(trx, editorID);

			// ... and languages
			const clearEditorLanguagesPromise =
				clearEditorLanguagesByEditorID(trx, editorID);

			return Promise.join(
				clearEditorPromise,
				clearEditorLanguagesPromise,
				() => true
			);
		});
	});
}
