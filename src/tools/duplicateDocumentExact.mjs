import ora from "ora";
import admin from "firebase-admin";
import prompts from "prompts";
import { config } from "dotenv";
import fs from "fs";
import { to } from "await-to-js";

config({
    path: './.env.local'
});

const HARD_CODED_FILTER = ([_, document]) => {
    return !document.feedback.includes("test") && document.feedback.length > 10
    }

;(async () => {
    let err, _spinner = {}, remoteCollections, _;
    [err, remoteCollections] = await to(initFirebase(_spinner));
    if (err) {
        _spinner.spinner.fail()
        console.debug("error log: ", err)
        console.log("Failed to connect to Firebase")
        return
    }

    const { sourceCollection } = await prompts({
        type: 'autocomplete',
        name: 'sourceCollection',
        message: 'Which collection to take from?',
        choices: remoteCollections.map(collection => ({ title: collection.name, value: collection.ref }))
    });

    if (!sourceCollection) {
        console.log("Exiting program.")
        return
    }

    const { targetCollection } = await prompts({
        type: 'autocomplete',
        name: 'targetCollection',
        message: 'Which collection to put into?',
        choices: remoteCollections.map(collection => ({ title: collection.name, value: collection.ref }))
    });

    if (!targetCollection) {
        console.log("Exiting program.")
        return
    }

    [err, _] = await to(moveDocuments(_spinner, sourceCollection, targetCollection))
    if (err) {
        _spinner.spinner.fail()
        console.debug("error log: ", err)
        console.log("Failed to move documents")
        return
    }

    ora("Done moving document(s).").succeed()
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

async function moveDocuments(_spinner, sourceCollection, targetCollection) {
    const spinner = ora('Moving document(s)').start()
    _spinner.spinner = spinner

    const snapshot = await sourceCollection.get()
    const _documents = [];
    snapshot.forEach(doc => _documents.push([doc.id, doc.data()]))

    const documents = _documents.filter(HARD_CODED_FILTER)

    await Promise.all(documents.map(([id, doc]) => {
       targetCollection.doc(id).set(doc)
    }))

    spinner.succeed()

    return true
}
