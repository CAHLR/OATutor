import clsx from 'clsx';

export function joinList (...args) {
    const TMP_DELIMITER = ",,,,,"

    const cleanStr = str => str.split(" ").filter(s => s.length > 0).join(TMP_DELIMITER)
    const cleanedArgs = args.map(arg => {
        if (typeof arg === "string") {
            return cleanStr(arg)
        } else if (Object.keys(arg || {}).length > 0) {
            return Object.fromEntries(Object.entries(arg).map(([key, val]) => [cleanStr(key), val]))
        } else {
            return cleanStr((arg || "").toString())
        }
    })

    const jointString = joinObjects(...cleanedArgs)
    return jointString.replace(new RegExp(TMP_DELIMITER, 'g'), " ")
}

function joinObjects (...args) {
    const parsed = clsx(...args)
    const listItems = parsed.split(" ")

    // build string
    if (listItems.length <= 2) {
        return listItems.join(" and ")
    }

    // goal is a list like a, b, c and d
    const lastTwo = listItems.splice(listItems.length - 2)
    const recombinedList = [...listItems, lastTwo.join(" and ")]
    return recombinedList.join(", ")
}
