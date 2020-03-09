import {hints as defaultPathway} from './tutoring/pythag1cDefaultPathway.js';
import {preferredPathway} from './../../../problemConfig.js';

var hints;

if (preferredPathway === "defaultPathway") {
    hints = defaultPathway;
}

export default hints;