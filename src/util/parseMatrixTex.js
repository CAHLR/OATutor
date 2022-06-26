export function parseMatrixTex(solTex) {
    const solutionMatrices = []

    ;(Array.isArray(solTex) ? solTex : [solTex]).forEach(sol => {
        const _start = sol.indexOf("matrix} ") + "matrix} ".length
        const _end = sol.indexOf("\\end{")
        let _solutionMatrix = sol
            .substring(_start, _end)
            .trim()
            .split("\\\\")
            .map(row => row.split("&").map(val => val.trim()))
        solutionMatrices.push(_solutionMatrix)
    })
    return solutionMatrices;
}
