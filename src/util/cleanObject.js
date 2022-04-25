const filter = str => str
    .replace(/[ \\]/g, '')
    .replace(/[\u2018\u2019]/g, `'`) // replace fancy single quotes with apostrophe
    .replace(/[\u201C\u201D]/g, `"`) // replace fancy double quotes with quotation

export function cleanObjectKeys(obj) {
    return Object.fromEntries(
        Object.entries(obj).map(([key, val]) => ([filter(key), val]))
    )
}

export function cleanArray(arr) {
    return arr.map(filter)
}
