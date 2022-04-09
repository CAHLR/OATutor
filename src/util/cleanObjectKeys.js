function cleanObjectKeys(obj){
    return Object.fromEntries(
        Object.entries(obj).map(([_key, val]) => {
            const key = _key
                .replace(/[ \\]/g, '')
                .replace(/[\u2018\u2019]/g, `'`) // replace fancy single quotes with apostrophe
                .replace(/[\u201C\u201D]/g, `"`) // replace fancy double quotes with quotation
            return [key, val]
        })
    )
}

export default cleanObjectKeys
