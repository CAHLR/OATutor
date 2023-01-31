// https://stackoverflow.com/a/53758827
export function shuffleArray(array, seed) {                // <-- ADDED ARGUMENT
    const newArray = [...array]
    let m = newArray.length, t, i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(random(seed) * m--);        // <-- MODIFIED LINE

        // And swap it with the current element.
        t = newArray[m];
        newArray[m] = newArray[i];
        newArray[i] = t;
        ++seed                                     // <-- ADDED LINE
    }

    // console.debug('shuffled array according to seed', newArray, seed)

    return newArray;
}

function random(seed) {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}
