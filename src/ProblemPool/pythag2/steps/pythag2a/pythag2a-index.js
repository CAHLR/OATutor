import {hints as defaultPathway} from './tutoring/pythag2aDefaultPathway.js';
import {preferredPathway} from './../../../problemConfig.js';

var hints;

if (preferredPathway === "defaultPathway") {
    hints = defaultPathway;
}

export default hints;