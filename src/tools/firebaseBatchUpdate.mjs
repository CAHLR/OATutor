import ora from "ora";
import admin from "firebase-admin";
import prompts from "prompts";
import { config } from "dotenv";
import fs from "fs";
import { to } from "await-to-js";
import { EOL } from "os";
import chalk from "chalk";
import path, { dirname } from "path"
import { fileURLToPath, pathToFileURL } from "url";
import { createRequire } from "module";
import util from "util";
import tempy from 'tempy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const require = createRequire(import.meta.url)
const areadFile = util.promisify(fs.readFile)

config({
    path: './.env.local'
});

/**
 * Selector for the Firebase query.
 * @param collectionRef
 * @return {*}
 */
const selector = (collectionRef) => {
    return collectionRef
};

/**
 * Filters documents based on their field values, true to keep.
 * @param document
 * @return {boolean}
 */
const filter = (document) => {
    return !Boolean(document.lessonObjectives)
    // return true
}

const problemMapping = getProblemIdMapping()
const courseMapping = await getCourseMapping()

/**
 * The update object.
 * @param document
 * @return {{[key: string]: any}}
 */
const update = (document) => {
    const { problemID } = document
    const { lesson, courseName } = problemMapping[problemID]
    if (!lesson || !courseName) {
        console.error(`no lesson or courseName found for ${problemID}`)
    }
    const { lessons } = courseMapping[courseName]
    const lessonObjectives = lessons.find(_lesson => `${_lesson.name}${_lesson.topics ? ` ${_lesson.topics}` : ''}` === `Lesson ${lesson}`)?.learningObjectives
    if (!lessonObjectives) {
        console.error(`no lesson objectives found for ${problemID}, ${courseName}, ${lesson}`)
    }

    return {
        lessonObjectives,
        lesson,
        Content: courseName
    };
};

;(async () => {
    let err, _spinner = {}, remoteCollections, _, documents;
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

    [err, documents] = await to(getDocuments(_spinner, collectionRefs));
    if (err) {
        _spinner.spinner.fail()
        console.debug("error log: ", err)
        console.log("Failed to get all the document references")
        return
    }

    if (documents.length === 0) {
        console.log("No documents matched the selector")
        return
    }

    const { confirmation } = await prompts({
        type: 'confirm',
        name: 'confirmation',
        message: `Confirm update of ${documents.length} documents?`,
        initial: false,
    });

    if (!confirmation) {
        console.log("Exiting program.")
        return
    }

    [err, _] = await to(updateDocuments(_spinner, documents))
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

async function getDocuments(_spinner, collectionRefs) {
    const spinner = ora('Getting document ref(s)').start()
    _spinner.spinner = spinner

    const documents = []
    await Promise.all(collectionRefs.map(async collectionRef => {
        const snapshot = await selector(collectionRef).get()
        documents.push(...snapshot.docs.filter(doc => filter(doc.data())).map(doc => ({
            documentRef: doc.ref,
            documentData: doc.data()
        })))
    }))

    spinner.succeed()

    return documents
}


async function updateDocuments(_spinner, documents) {
    const spinner = ora('Updating document(s)').start()
    _spinner.spinner = spinner

    await Promise.all(documents.map(async ({ documentRef, documentData }) => {
        await documentRef.update(update(documentData))
    }))

    spinner.succeed()

    return true
}

function getProblemIdMapping() {
    const poolFile = require(path.join(__dirname, "..", "generated", "poolFile.json"))
    if (!Array.isArray(poolFile)) {
        throw new Error()
    }
    return Object.fromEntries(poolFile.map(obj => ([obj.id, obj])))
}

async function getCourseMapping() {
    const coursePlanFile = await areadFile(path.join(__dirname, "..", "config", "coursePlans.js"))
    const courseArray = await tempy.write.task(coursePlanFile, async (temporaryPath) => {
        return (await import(pathToFileURL(temporaryPath))).default
    }, {
        extension: "mjs"
    })
    if (!Array.isArray(courseArray)) {
        throw new Error()
    }
    return Object.fromEntries(courseArray.map(obj => ([obj.courseName, obj])))
}
