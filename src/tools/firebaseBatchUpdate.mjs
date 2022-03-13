import ora from "ora";
import admin from "firebase-admin";
import prompts from "prompts";
import { config } from "dotenv";
import fs from "fs";
import { to } from "await-to-js";
import { EOL } from "os";
import chalk from "chalk";

config({
    path: './.env.local'
});

const selector = (collectionRef) => {
    return collectionRef.where("hintIsCorrect", "==", false)
};

const filter = (document) => {
    return document.eventType !== "hintScaffoldLog"
    // return true
}

const update = () => ({
    hintIsCorrect: null
});

;(async () => {
    let err, _spinner = {}, remoteCollections, _, documentRefs;
    [err, remoteCollections] = await to(initFirebase(_spinner));
    if (err) {
        _spinner.spinner.fail()
        console.debug("error log: ", err)
        console.log("Failed to connect to Firebase")
        return
    }

    console.log(`Selector:${EOL}${chalk.gray(selector.toString())}`)
    console.log(`Additional Filter:${EOL}${chalk.gray(filter.toString())}`)
    console.log(`Update Object:${EOL}${chalk.gray(update.toString())}`)

    const { collectionRefs } = await prompts({
        type: 'autocompleteMultiselect',
        name: 'collectionRefs',
        message: 'Which collection to run this update on?',
        choices: remoteCollections.map(collection => ({ title: collection.name, value: collection.ref }))
    });

    if (!Array.isArray(collectionRefs) || collectionRefs.length === 0) {
        console.log("Exiting program.")
        return
    }

    [err, documentRefs] = await to(getDocumentRefs(_spinner, collectionRefs));
    if (err) {
        _spinner.spinner.fail()
        console.debug("error log: ", err)
        console.log("Failed to get all the document references")
        return
    }

    if(documentRefs.length === 0){
        console.log("No documents matched the selector")
        return
    }

    const { confirmation } = await prompts({
        type: 'confirm',
        name: 'confirmation',
        message: `Confirm update of ${documentRefs.length} documents?`,
        initial: false,
    });

    if (!confirmation) {
        console.log("Exiting program.")
        return
    }

    [err, _] = await to(updateDocuments(_spinner, documentRefs))
    if (err) {
        _spinner.spinner.fail()
        console.debug("error log: ", err)
        console.log("Failed to update documents")
        return
    }

    ora("Done updating collection(s).").succeed()
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

async function getDocumentRefs(_spinner, collectionRefs) {
    const spinner = ora('Getting document ref(s)').start()
    _spinner.spinner = spinner

    const documentRefs = []
    await Promise.all(collectionRefs.map(async collectionRef => {
        const snapshot = await selector(collectionRef).get()
        documentRefs.push(...snapshot.docs.filter(doc => filter(doc.data())).map(doc => doc.ref))
    }))

    spinner.succeed()

    return documentRefs
}


async function updateDocuments(_spinner, documentRefs) {
    const spinner = ora('Updating document(s)').start()
    _spinner.spinner = spinner

    await Promise.all(documentRefs.map(async documentRef => {
        await documentRef.update(update())
    }))

    spinner.succeed()

    return true
}
