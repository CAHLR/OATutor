import ora from "ora";
import admin from "firebase-admin";
import prompts from "prompts";
import { config } from "dotenv";
import fs from "fs";
import { to } from "await-to-js";
import ObjectsToCsv from "objects-to-csv";
import path, { dirname } from "path"
import { fileURLToPath } from 'url';
import { createTypedEntry } from "../util/objectEntryTools.mjs";

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

    const { collectionRefs } = await prompts({
        type: 'autocompleteMultiselect',
        name: 'collectionRefs',
        message: 'Which collection to export?',
        choices: remoteCollections.map(collection => ({ title: collection.name, value: collection.ref }))
    });

    if (!Array.isArray(collectionRefs) || collectionRefs.length === 0) {
        console.log("Exiting program.")
        return
    }

    const { confirmation } = await prompts({
        type: 'confirm',
        name: 'confirmation',
        message: `Confirm export of ${collectionRefs.map(_ => _.path).join(", ")}?`,
        initial: true,
    });

    if (!confirmation) {
        console.log("Exiting program.")
        return
    }

    [err, _] = await to(exportCollection(_spinner, collectionRefs))
    if (err) {
        _spinner.spinner.fail()
        console.debug("error log: ", err)
        console.log("Failed to connect to Firebase")
        return
    }

    ora("Done exporting collection(s).").succeed()
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

async function exportCollection(_spinner, collectionRefs) {
    const spinner = ora('Exporting collection(s)').start()
    _spinner.spinner = spinner

    await Promise.all(collectionRefs.map(async collectionRef => {
        const fileName = `export-${Date.now()}-${collectionRef.path}.csv`

        const documents = [];

        const snapshot = await collectionRef.get()

        snapshot.forEach(_doc => {
            const obj = _doc.data()
            const doc = Object.fromEntries(Object.entries(obj).map(createTypedEntry))
            documents.push(doc);
        })
        const csv = new ObjectsToCsv(documents);
        await csv.toDisk(path.join(__dirname, "out", fileName), { allColumns: true });
    }))

    spinner.succeed()

    return true
}
