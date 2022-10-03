export function parseTableTex(solTex) {
    const solutionTable = []

    ;(Array.isArray(solTex) ? solTex : [solTex]).forEach(sol => {
        const _start = sol.indexOf("tabular} ") + "tabular} ".length
        const _end = sol.indexOf("\\end{")
        let _solutionTable = sol
            .substring(_start, _end)
            .trim()
            .split("\\\\")
            .map(row => row.split("&").map(val => val.trim()))
        solutionTable.push(_solutionTable)
    })
    return solutionTable;
}
