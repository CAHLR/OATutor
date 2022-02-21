export const parseEntry = ([_key, val]) => {
    const [key, type] = _key.split("##")
    if (type === "boolean") {
        return [key, typeof val === "string" ? val === "true" : null]
    }
    if (type === "object") {
        return [key, parseJSON(val)]
    }
    if (type === "number") {
        return [key, isNaN(+val) ? null : +val]
    }

    return [key, val]
}

const parseJSON = (str) => {
    try {
        return JSON.parse(str);
    } catch (e) {
        if(str === "n/a"){
            return str
        }
        return {};
    }
};

export const createTypedEntry = ([key, val]) => {
    if (typeof val === "boolean") {
        return [`${key}##boolean`, val.toString()]
    }
    if (val === Object(val)) {
        return [`${key}##object`, JSON.stringify(val)]
    }
    if (typeof val === "number") {
        return [`${key}##number`, val]
    }
    return [key, val]
}

export const dedupeEntries = (_entries) => {
    const duplicates = Array.from(getDuplicates(_entries.map(([key, _]) => key)))
    const _dedupe = duplicates.map(([dupeKey, indices]) => {
        return [dupeKey, indices.map(idx => _entries[idx][1]).filter(Boolean)[0]]
    })
    const dupeIndices = duplicates.reduce((acc, [_, indices]) => [...acc, ...indices], [])
    return [..._entries.filter((_, idx) => !dupeIndices.includes(idx)), ..._dedupe]
}

/**
 *
 * @param input
 * @return [string, number[]]
 */
function getDuplicates(input) {
    return input.reduce((output, element, idx) => {
        const recordedDuplicates = output.get(element);
        if (recordedDuplicates) {
            output.set(element, [...recordedDuplicates, idx]);
        } else if (input.lastIndexOf(element) !== idx) {
            output.set(element, [idx]);
        }

        return output;
    }, new Map());
}
