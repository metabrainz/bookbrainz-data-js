import * as alias from './alias';
import * as identifier from './identifier';
import * as relationship from './relationship';
import * as set from './set';


export default function init() {
	return {
		alias,
		identifier,
		relationship,
		set
	};
}
