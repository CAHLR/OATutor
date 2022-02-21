import ora from "ora";
import admin from "firebase-admin";
import prompts from "prompts";
import { config } from "dotenv";
import fs from "fs";
import { to } from "await-to-js";
import ObjectsToCsv from "objects-to-csv";
import path, { dirname } from "path"
import { fileURLToPath } from 'url';

config({
    path: './.env.local'
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

;(async () => {
    let err, _spinner = {}, remoteCollections, _;
    [err, remoteCollections] = await to(initFirebase(_spinner));
    if (err) {
        _spinner.spinner.fail()
        console.debug("error log: ", err)
        console.log("Failed to connect to Firebase")
        return
    }

    const { collectionRef } = await prompts({
        type: 'autocomplete',
        name: 'collectionRef',
        message: 'Which collection to export?',
        choices: remoteCollections.map(collection => ({ title: collection.name, value: collection.ref }))
    });

    if (!collectionRef) {
        console.log("Exiting program.")
        return
    }

    const { confirmation } = await prompts({
        type: 'confirm',
        name: 'confirmation',
        message: `Confirm export of ${collectionRef.path}?`,
        initial: true,
    });

    if (!confirmation) {
        console.log("Exiting program.")
        return
    }

    [err, _] = await to(exportCollection(_spinner, collectionRef))
    if (err) {
        _spinner.spinner.fail()
        console.debug("error log: ", err)
        console.log("Failed to connect to Firebase")
        return
    }

    console.log()
})()


async function initFirebase(_spinner) {
    const spinner = ora('Initializing Firebase').start()
    _spinner.spinner = spinner

    const serviceAccount = JSON.parse(fs.readFileSync("./service-account-credentials.json"));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    const db = admin.firestore();

    let remoteCollections
    const [err, _remoteCollections] = await to(db.listCollections())
    if (err) {
        throw err
    } else {
        remoteCollections = _remoteCollections.map(ref => ({
            name: ref.id,
            ref
        }))
    }

    spinner.succeed()

    return remoteCollections
}

async function exportCollection(_spinner, collectionRef) {
    const spinner = ora('Exporting collection').start()
    _spinner.spinner = spinner

    const fileName = `export-${Date.now()}-${collectionRef.path}.csv`

    const documents = [];

    const snapshot = await collectionRef.get()

    snapshot.forEach(_doc => {
        const obj = _doc.data()
        const doc = Object.fromEntries(Object.entries(obj)
            .map(([key, val]) => {
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
            })
        )
        documents.push(doc);
    })
    const csv = new ObjectsToCsv(documents);
    await csv.toDisk(path.join(__dirname, "out", fileName), { allColumns: true });

    spinner.succeed()

    return true
}
