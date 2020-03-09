import {hints as defaultPathway} from './tutoring/pythag1dDefaultPathway.js';
import {preferredPathway} from './../../../problemConfig.js';

var hints;

if (preferredPathway === "defaultPathway") {
    hints = defaultPathway;
}

export default hints;