import * as alias from './alias';
import * as identifier from './identifier';
import * as language from './language';
import * as relationship from './relationship';
import * as set from './set';
import imports from './imports';


export default function init() {
	return {
		alias,
		identifier,
		imports,
		language,
		relationship,
		set
	};
}
