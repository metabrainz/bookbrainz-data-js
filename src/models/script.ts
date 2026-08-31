import {camelToSnake, snakeToCamel} from '../util';
import type Bookshelf from '@metabrainz/bookshelf';


export default function script(bookshelf: Bookshelf) {
	const Script = bookshelf.Model.extend({
		format: camelToSnake,
		idAttribute: 'id',
		parse: snakeToCamel,
		tableName: 'musicbrainz.script'
	});
	return bookshelf.model('Script', Script);
}
