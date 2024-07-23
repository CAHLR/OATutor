const level = require('level')
const db = level('.mapping-db')
const { promises: fs } = require("fs");
const path = require('path')

const args = process.argv.slice(2);

if (!args[0] || args[0].toString().length === 0) {
    console.log("Please supply a ingest file path in the program arguments.")
    process.exit(1)
}

async function fileExists (path) {
    let flag = false
    await fs.access(path).catch(() => {
        flag = true
    })
    return !flag
}

;(async () => {
    const target = args[0]
    const targetFile = path.resolve(target)
    const exists = fileExists(targetFile)
    if (!exists) {
        console.log(`Supplied file: '${targetFile}' does not exist`)
        process.exit(1)
    }
    const buf = await fs.readFile(targetFile)
    const mapping = JSON.parse(buf)

    const oldMapping = {}
    for await (const [key, value] of db.iterator()) {
        oldMapping[key] = value
    }
    await fs.mkdir(path.join(__dirname, "out"), { recursive: true })
    await fs.writeFile(path.join(__dirname, "out", `pre-ingest-backup-${new Date().getTime()}.json`), JSON.stringify(oldMapping))

    await Promise.all(Object.keys(oldMapping).map(key => db.del(key)))

    await Promise.all(Object.keys(mapping).map(key => db.put(key, mapping[key])))
})()
