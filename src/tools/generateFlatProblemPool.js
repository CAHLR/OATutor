const path = require("path");
const fs = require("fs");
const util = require('util');
const fromEntries = require("object.fromentries");

const copyFile = util.promisify(fs.copyFile)
const readFile = util.promisify(fs.readFile)
const readdir = util.promisify(fs.readdir)
const lstat = util.promisify(fs.lstat)
const writeFile = util.promisify(fs.writeFile)
const mkdir = util.promisify(fs.mkdir)
const rmdir = util.promisify(fs.rmdir)

if (+process.versions.node.split(".")[0] < 10) {
    console.debug('Please upgrade to node v10.12.X+')
    process.exit(1)
}

// the current file should be in src/tools so ../ProblemPool should be src/ProblemPool
const problemPoolPath = path.join(__dirname, '..', 'ProblemPool')
const generatedPath = path.join(__dirname, '..', 'generated')
const poolFilePath = path.join(generatedPath, 'poolFile.json')
const staticFiguresPath = path.join(__dirname, '..', '..', 'public', 'static', 'images', 'figures')

if (!Object.fromEntries) {
    fromEntries.shim();
}

;(async () => {
    // let hasPrevPool = true, config = {};
    // await access(poolFilePath).catch(err => {
    //   hasPrevPool = false
    // })
    //
    // if (hasPrevPool) {
    //   await readFile(poolFilePath, "utf8").then(data => {
    //     config = JSON.parse(data.toString())
    //   }).catch(err => {
    //     console.debug('error reading pool file: ', err)
    //     hasPrevPool = false
    //   })
    // }
    //
    // console.debug('has previous pool file? ', hasPrevPool)
    // const { meta = {}, pool = [] } = config
    // if (hasPrevPool && (!meta || !pool || !meta.timestamp)) {
    //   console.debug('previous pool file is invalid, regenerating pool file...')
    // }
    //
    // const { updatedTime = -1 } = meta
    // if (hasPrevPool && updatedTime > -1) {
    //   console.debug(`last update time was ${new Date(updatedTime)}`)
    // }

    const updatedTime = -1; // optimizing file reads based on last updated time makes negligible difference right now.
    // let modifiedProblems = 0
    const directoryItems = await readdir(problemPoolPath)
    const problemDirs = await Promise.all(directoryItems.map(async item => {
        const stat = await lstat(path.join(problemPoolPath, item))
        let directory = ""
        if (stat.isDirectory()) {
            if (fs.lstatSync(path.join(problemPoolPath, item)).mtime > updatedTime) {
                // modifiedProblems++
                directory = item
            }
        }
        return new Promise((resolve, reject) => {
            resolve(directory)
        })
    })).catch(err => {
        console.debug(err)
        console.error('error reading problem directories')
        process.exit(1)
    })

    // remove existing static figures
    await rmdir(staticFiguresPath, { recursive: true }).catch(err => {
        console.debug(err)
        console.error('error removing existing figures')
        process.exit(1)
    })

    const problems = await Promise.all(problemDirs.filter(d => d.length > 0).map(async problemDir => {
        const problemPath = path.join(problemPoolPath, problemDir.toString())

        const rawProblem = await readFile(path.join(problemPath, `${problemDir}.js`))
        const problem = getProblemJSON(rawProblem)

        const stepDirs = await readdir(path.join(problemPath, 'steps'))
        if (!stepDirs || stepDirs.length === 0) {
            throw Error(`${problemDir.toString()} has no steps.`)
        }

        const figurePaths = await readdir(path.join(problemPath, 'figures')).catch(err => {
        })
        if (!figurePaths || figurePaths.length === 0) {
            // it is okay if a problem doesn't have figures
        } else {
            await Promise.all(figurePaths.map(async figure => {
                await mkdir(path.join(staticFiguresPath, problemDir.toString()), {
                    recursive: true
                })
                await copyFile(path.join(problemPath, 'figures', figure), path.join(staticFiguresPath, problemDir.toString(), figure))
                return new Promise((resolve, reject) => {
                    resolve(true)
                })
            }))
        }

        const steps = await Promise.all(stepDirs.map(async stepDir => {
            const stepPath = path.join(problemPath, 'steps', stepDir)

            const rawStep = await readFile(path.join(stepPath, `${stepDir}.js`))
            const step = getStepJSON(rawStep)

            const hintDirs = await readdir(path.join(stepPath, 'tutoring'))
            if (!hintDirs || hintDirs.length === 0) {
                throw Error(`${problemDir.toString()} -> ${stepDir.toString()} has no hints.`)
            }

            const _hints = await Promise.all(hintDirs.map(async hintFile => {
                const hintPath = path.join(stepPath, 'tutoring', hintFile)

                const rawHint = await readFile(hintPath)
                const hint = getHintJSON(rawHint)

                const pathwayName = hintFile.includes(stepDir)
                    ? hintFile.substr(hintFile.indexOf(stepDir) + stepDir.length).replace(/\.[^/.]+$/, "")
                    : hintFile

                return new Promise((resolve, reject) => {
                    resolve({ [pathwayName]: hint })
                })
            }))

            const hints = Object.fromEntries(_hints.map(obj => [Object.keys(obj)[0], obj[Object.keys(obj)[0]]]))

            step.hints = hints

            return new Promise((resolve, reject) => {
                resolve(step)
            })
        }))

        problem.steps = steps

        return new Promise((resolve, reject) => {
            resolve(problem)
        })
    })).catch(err => {
        console.debug(err)
        console.error('error reading individual problem directory')
        process.exit(1)
    })

    // console.debug(`${modifiedProblems} problems have been modified.`)

    console.debug(`writing to pool file...`)

    const config = problems

    await mkdir(generatedPath, {
        recursive: true
    })

    await writeFile(poolFilePath, JSON.stringify(config))
})()

function getHintJSON(rawHints) {
    const _hintStr = rawHints.toString()

    const _idxStart = regexIndexOf(_hintStr, /(var|const|let)\s+hints\s*=\s*\[/m)
    const idxStart = _hintStr.indexOf("[", _idxStart)

    const _idxEnd = regexLastIndexOf(_hintStr, /];?\s*export/m)
    const idxEnd = _idxEnd + 1

    const hintStr = _hintStr
        .substring(idxStart, idxEnd)

    return jsToJSON(hintStr)
}

function getProblemJSON(rawProblem) {
    const _problemStr = rawProblem.toString()
    const _idxStart = regexIndexOf(_problemStr, /(var|const|let)\s+problem\s*=\s*{/m)
    const idxStart = _problemStr.indexOf("{", _idxStart)

    const _idxEnd = regexLastIndexOf(_problemStr, /};?\s*export/m)
    const idxEnd = _idxEnd + 1

    const problemStr = _problemStr
        .substring(idxStart, idxEnd)
        .replace(/steps:\s+steps/, "steps: {}")

    return jsToJSON(problemStr)
}

function getStepJSON(rawStep) {
    const _stepStr = rawStep.toString()

    const _idxStart = regexIndexOf(_stepStr, /(var|const|let)\s+step\s*=\s*{/m)
    const idxStart = _stepStr.indexOf("{", _idxStart)

    const _idxEnd = regexLastIndexOf(_stepStr, /};?\s*export/m)
    const idxEnd = _idxEnd + 1

    const stepStr = _stepStr
        .substring(idxStart, idxEnd)
        .replace(/hints: ?hints/, "hints: {}")

    return jsToJSON(stepStr)
}

// https://stackoverflow.com/a/39050609
function jsToJSON(rawJS) {
    const filtered = rawJS
        // remove control characters: https://stackoverflow.com/a/51602415
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
        // escape most back slashes
        .replace(/[^\\]\\[^\\"]/g, function (match) {
            return match[0] + "\\" + match.substring(1)
        })
        // remove trailing commas
        .replace(/,\s*[\]}]/g, function (match) {
            return match.substring(1)
        })
        // Replace ":" with "@colon@" if it's between double quotes
        .replace(/"([^"]*)"/g, function (match, p1) {
            return '"' + p1.replace(/:/g, '@colon@') + '"';
        })
        // Add double-quotes around any tokens before the remaining ":"
        .replace(/(['"])?([a-z0-9A-Z_]+)(['"])?\s*:/g, '"$2": ')
        // Turn "@colon@" back into ":"
        .replace(/@colon@/g, ':')
    try {
        return JSON.parse(filtered)
    } catch (er) {
        console.debug(rawJS)
        console.debug()
        console.debug(filtered)
        console.debug()
        throw Error(er)
    }
}

// https://stackoverflow.com/a/274094
function regexIndexOf(string, regex, startpos) {
    const indexOf = string.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

// https://stackoverflow.com/a/274094
function regexLastIndexOf(string, regex, startpos) {
    regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
    if (typeof (startpos) == "undefined") {
        startpos = string.length;
    } else if (startpos < 0) {
        startpos = 0;
    }
    const stringToWorkWith = string.substring(0, startpos + 1);
    let lastIndexOf = -1;
    let nextStop = 0;
    let result = regex.exec(stringToWorkWith)
    while ((result) != null) {
        lastIndexOf = result.index;
        regex.lastIndex = ++nextStop;
        result = regex.exec(stringToWorkWith)
    }
    return lastIndexOf;
}
