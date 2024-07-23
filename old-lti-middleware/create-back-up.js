const level = require('level')
const db = level('.mapping-db')
const { promises: fs } = require("fs");
const path = require("path")

;(async () => {
    const mapping = {}
    for await (const [key, value] of db.iterator()) {
        mapping[key] = value
    }
    await fs.mkdir(path.join(__dirname, "out"), { recursive: true })
    await fs.writeFile(path.join(__dirname, "out", `mapping-backup-${new Date().getTime()}.json`), JSON.stringify(mapping))
})()
