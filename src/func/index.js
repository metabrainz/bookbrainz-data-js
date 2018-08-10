import * as alias from './alias';
import * as entity from './entity';
import * as identifier from './identifier';
import * as language from './language';
import * as relationship from './relationship';
import * as set from './set';
import {createEntity} from './create-entity';
import imports from './imports';


export default function init() {
	return {
		alias,
		createEntity,
		entity,
		identifier,
		imports,
		language,
		relationship,
		set
	};
}
