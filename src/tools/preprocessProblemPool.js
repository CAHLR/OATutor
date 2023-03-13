const path = require("path");
const fs = require("fs");
const util = require('util');
const { CONTENT_SOURCE } = require('../../common/global-config')

const copyFile = util.promisify(fs.copyFile)
const readdir = util.promisify(fs.readdir)
const lstat = util.promisify(fs.lstat)
const writeFile = util.promisify(fs.writeFile)
const mkdir = util.promisify(fs.mkdir)
const rm = util.promisify(fs.rm)

if (+process.versions.node.split(".")[0] < 10) {
    console.debug('Please upgrade to node v10.12.X+')
    process.exit(1)
}

// the current file should be in src/tools so ../content-sources/* should be src/content-sources/*
const problemPoolPath = path.join(__dirname, '..', 'content-sources', CONTENT_SOURCE, 'content-pool')
const generatedPath = path.join(__dirname, '..', '..', 'generated', 'processed-content-pool')
const poolFilePath = path.join(generatedPath, `${CONTENT_SOURCE}.json`)
const staticFiguresPath = path.join(__dirname, '..', '..', 'public', 'static', 'images', 'figures', CONTENT_SOURCE)

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
    await rm(staticFiguresPath, { recursive: true }).catch(err => {
        console.debug(err)
        console.error('error removing existing figures (this is ok on the first run)')
        if (err.code !== 'ENOENT') {
            process.exit(1)
        }
    })

    const problems = await Promise.all(
        problemDirs
            .filter(d => d.length > 0) // only keep resolved directories
            .filter(d => !(d.toString().startsWith("_") || d.toString().startsWith("."))) // ignore directories that start with _ or .
            .map(
                async problemDir => {
                    const problemName = problemDir.toString()
                    const problemPath = path.join(problemPoolPath, problemName)

                    const problem = require(path.join(problemPath, `${problemName}.json`))

                    const stepDirs = await readdir(path.join(problemPath, 'steps'))
                    if (!stepDirs || stepDirs.length === 0) {
                        throw Error(`${problemName.toString()} has no steps.`)
                    }

                    const figurePaths = await readdir(path.join(problemPath, 'figures')).catch(err => {
                        // ignore, see below
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

                    problem.steps = await Promise.all(
                        stepDirs.map(
                            async stepDir => {
                                const stepName = stepDir.toString()
                                const stepPath = path.join(problemPath, 'steps', stepName)

                                const step = require(path.join(stepPath, `${stepDir}.json`))

                                const hintPathwaysDir = await readdir(path.join(stepPath, 'tutoring')) || []
                                if (hintPathwaysDir.length === 0) {
                                    console.warn(`${problemName} -> ${stepName} has no hints (pathways).`)
                                }

                                const hintPathways = await Promise.all(
                                    hintPathwaysDir.map(
                                        async hintPathwayFile => {
                                            const hintPathwayFullName = hintPathwayFile.toString()
                                            const hintPathwayPath = path.join(stepPath, 'tutoring', hintPathwayFullName)

                                            const hintPathway = require(hintPathwayPath)

                                            const hintPathwayName = hintPathwayFullName.includes(stepName)
                                                ? hintPathwayFullName.substr(hintPathwayFullName.indexOf(stepName) + stepName.length).replace(/\.[^/.]+$/, "")
                                                : hintPathwayFullName

                                            return new Promise((resolve, reject) => {
                                                resolve({ [hintPathwayName]: hintPathway })
                                            })
                                        }))

                                // merge down into one object
                                step.hints = Object.fromEntries(hintPathways.map(obj => [Object.keys(obj)[0], obj[Object.keys(obj)[0]]]))

                                return new Promise((resolve, reject) => {
                                    resolve(step)
                                })
                            }))

                    return new Promise((resolve, reject) => {
                        resolve(problem)
                    })
                })
    ).catch(err => {
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
