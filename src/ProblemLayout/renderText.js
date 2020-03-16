import {dynamicText} from '../config/config.js'

export default function renderText(text) {
    var result = text;
    for (var d in dynamicText) {
        var replace = dynamicText[d];
        result = result.split(d).join(replace);
    }
    return result;
}