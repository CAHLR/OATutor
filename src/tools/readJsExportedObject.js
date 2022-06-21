const tempy = require("tempy-legacy");
const readFile = require("fs/promises").readFile;
const pathToFileURL = require("url").pathToFileURL;

async function readJsExportedObject(file) {
    const objectFile = await readFile(file)
    return await tempy.write.task(objectFile, async (temporaryPath) => {
        return (await import(pathToFileURL(temporaryPath))).default
    }, {
        extension: "mjs"
    })
}

module.exports = readJsExportedObject
