export const parseEntry = ([_key, val]) => {
    const [key, type] = _key.split("##")
    if(type === "boolean"){
        return [key, typeof val === "string" ? val === "true" : null]
    }
    if(type === "object"){
        return [key, parseJSON(val)]
    }
    if(type === "number"){
        return [key, isNaN(+val) ? null : +val]
    }

    return [key, val]
}

const parseJSON = (str) => {
    try {
        return JSON.parse(str);
    } catch (e) {
        console.debug("error parsing json: ", str)
        return {};
    }
};

export const createTypedEntry = ([key, val]) => {
    if(typeof val === "boolean"){
        return [`${key}##boolean`, val.toString()]
    }
    if(val === Object(val)){
        return [`${key}##object`, JSON.stringify(val)]
    }
    if(typeof val === "number"){
        return [`${key}##number`, val]
    }
    return [key, val]
}
