import ora from "ora";
import admin from "firebase-admin";
import prompts from "prompts";
import { config } from "dotenv";
import fs from "fs";
import { to } from "await-to-js";
import { EOL } from "os";
import chalk from "chalk";
import path, { dirname } from "path"
import { fileURLToPath } from "url";
import { createRequire } from "module";
import util from "util";
import { isObject } from "../util/objectEntryTools.mjs";

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
    return !isObject(document.knowledgeComponents)
        || Object.keys(document.knowledgeComponents).length === 0 || document.knowledgeComponents === "n/a"
        || document.lesson == null || document.lesson === "n/a"
        || document.Content == null || document.Content === "n/a"
        || document.knowledgeComponents !== undefined
    // return true
}

const problemMapping = getProblemIdMapping()
const skillMapping = await getSkillMapping()

const MIGRATION_FLAGS = [
    "HEX_PROBLEM_ID_AMBIGUOUS",
    "HEX_PROBLEM_ID_DNE",
    "HEX_PROBLEM_ID_GUESSED",
    "HEX_STEP_ID_AMBIGUOUS",
    "HEX_STEP_ID_DNE",
    "HEX_STEP_ID_GUESSED",
]
const MIGRATION_FLAGS_FIELD = "__MIGRATION_FLAGS" // fields matching __.*__ are reserved in Firestore
const MIGRATION_LOG_FIELD = "__MIGRATIONS_LOG"

const _MIGRATION_FLAGS = Object.fromEntries(MIGRATION_FLAGS.map(fl => ([fl, fl])))

const getProblem = (problemId, migrationLogger) => {
    const _prob = problemMapping[problemId]
    if (_prob) {
        return _prob
    }
    const keys = Object.keys(problemMapping)
    const matchingKeys = keys.filter(key => key.endsWith(problemId) && key.length - problemId.length >= 6)
    if (matchingKeys.length > 1) {
        migrationLogger.addFlag(_MIGRATION_FLAGS.HEX_PROBLEM_ID_AMBIGUOUS, { matchingKeys, legacyKey: problemId })
        console.error(`multiple current IDs match the legacy problem ID: ${problemId}: ${matchingKeys}`)
        return {}
    } else if (matchingKeys.length === 0) {
        migrationLogger.addFlag(_MIGRATION_FLAGS.HEX_PROBLEM_ID_DNE, { legacyKey: problemId })
        console.error(`legacy (or invalid) key: ${problemId} does not match any existing problems`)
        return {}
    }
    migrationLogger.addFlag(_MIGRATION_FLAGS.HEX_PROBLEM_ID_GUESSED, {
        legacyKey: problemId,
        guessedKey: matchingKeys[0]
    })
    return problemMapping[matchingKeys[0]]
}

const getStepSkills = (stepId, migrationLogger) => {
    const _step = skillMapping[stepId]
    if (_step) {
        return _step
    }
    const keys = Object.keys(skillMapping)
    const matchingKeys = keys.filter(key => key.endsWith(stepId) && key.length - stepId.length >= 6)
    if (matchingKeys.length > 1) {
        migrationLogger.addFlag(_MIGRATION_FLAGS.HEX_STEP_ID_AMBIGUOUS, { matchingKeys, legacyKey: stepId })
        console.error(`multiple current IDs match the legacy step ID: ${stepId}: ${matchingKeys}`)
        return "n/a"
    } else if (matchingKeys.length === 0) {
        migrationLogger.addFlag(_MIGRATION_FLAGS.HEX_STEP_ID_DNE, { legacyKey: stepId })
        console.error(`legacy (or invalid) step key: ${stepId} does not match any existing steps`)
        return "n/a"
    }
    migrationLogger.addFlag(_MIGRATION_FLAGS.HEX_STEP_ID_GUESSED, { legacyKey: stepId, guessedKey: matchingKeys[0] })
    return skillMapping[matchingKeys[0]]
}

/**
 * The update object.
 * @param document
 * @return {{[key: string]: any}}
 */
const update = (document, migrationLogger) => {
    const { problemID, stepID, eventType } = document
    const findSkills = eventType !== "unlockSubHint"
    const { lesson = "n/a", courseName = "n/a", id: true_id = "n/a" } = getProblem(problemID, migrationLogger)
    if (!stepID && findSkills) {
        console.debug(`no step ID for ${true_id} (${stepID})`)
    }
    if (!lesson || !courseName || lesson === "n/a" || courseName === "n/a") {
        console.error(`no lesson or courseName found for ${problemID}`)
    }
    const skills = findSkills ? getStepSkills(stepID, migrationLogger) : null
    if ((!Array.isArray(skills) || skills.length === 0) && findSkills) {
        console.error(`no skills found for ${true_id}--${stepID}, ${courseName}, ${lesson}`)
    }

    return {
        lesson,
        Content: courseName,
        ...findSkills
            ? {
                knowledgeComponents: skills
            }
            : {
                knowledgeComponents: admin.firestore.FieldValue.delete()
            }
    };
};

;(async () => {
    let err, _spinner = {}, remoteCollections, _, documentSnapshots;
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

    const { collectionRefs, useSampling, sampleMode, numSamples, migrationNote } = await prompts([
        {
            type: 'text',
            name: 'migrationNote',
            message: 'Write a note for this update (optional)'
        },
        {
            type: 'autocompleteMultiselect',
            name: 'collectionRefs',
            message: 'Which collection to run this update on?',
            choices: remoteCollections.map(collection => ({ title: collection.name, value: collection.ref }))
        },
        {
            type: prev => prev.length === 1 && 'toggle',
            name: 'useSampling',
            message: 'Only update sampled documents?',
            initial: false
        },
        {
            type: prev => prev && 'select',
            name: 'sampleMode',
            message: 'What type of sampling distribution?',
            choices: [
                { title: "uniform", value: "uniform" }, { title: "random", value: "random" }
            ]
        },
        {
            type: prev => prev && 'number',
            message: "How many samples?",
            name: 'numSamples',
            initial: 100,
            min: 2,
            max: 1000
        }
    ])

    if (!Array.isArray(collectionRefs) || collectionRefs.length === 0) {
        console.log("Exiting program.")
        return
    }

    if (useSampling) {
        [err, documentSnapshots] = await to(sampleCollection(collectionRefs[0], numSamples, sampleMode));
    } else {
        [err, documentSnapshots] = await to(getDocuments(_spinner, collectionRefs));
    }
    if (err) {
        _spinner.spinner.fail()
        console.debug("error log: ", err)
        console.log("Failed to get all the document references")
        return
    }

    if (documentSnapshots.length === 0) {
        console.log("No documents matched the selector")
        return
    }

    const { confirmation } = await prompts({
        type: 'confirm',
        name: 'confirmation',
        message: `Confirm update of ${documentSnapshots.length} documents?`,
        initial: false,
    });

    if (!confirmation) {
        console.log("Exiting program.")
        return
    }

    [err, _] = await to(updateDocuments(_spinner, documentSnapshots, migrationNote))
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

/**
 *
 * @return {Promise<FirebaseFirestore.DocumentSnapshot[]>}
 * @param {FirebaseFirestore.CollectionReference[]} collectionRefs
 */
async function getDocuments(_spinner, collectionRefs) {
    const spinner = ora('Getting document ref(s)').start()
    _spinner.spinner = spinner

    const documents = []
    await Promise.all(collectionRefs.map(async collectionRef => {
        const snapshot = await selector(collectionRef).get()
        documents.push(...snapshot.docs)
    }))

    spinner.succeed()

    return documents
}

const createMigrationLogHelper = async (migrationMessage) => {
    const tsMS = Date.now()
    const flags = []
    return {
        log: () => {
            return admin.firestore.FieldValue.arrayUnion({
                tsMS,
                migrationMessage,
                updateFn: update.toString()
            })
        },
        addFlag: (migrationFlag, context) => {
            if (!MIGRATION_FLAGS.includes(migrationFlag)) {
                throw new Error(`Please document ${migrationFlag} in the MIGRATION_FLAGS variable first.`)
            }
            flags.push({
                migrationFlag,
                context: Object.fromEntries(Object.entries(context).map(([key, val]) => ([key, Array.isArray(val) ? arrToObj(val) : val])))
            })
        },
        getFlags: () => {
            return flags.length > 0 ? admin.firestore.FieldValue.arrayUnion({
                tsMS,
                flags: arrToObj(flags)
            }) : null
        }
    }
}

/**
 *
 * @param documents {FirebaseFirestore.DocumentSnapshot[]}
 */
async function updateDocuments(_spinner, documents, migrationNote) {
    const spinner = ora('Updating document(s)').start()
    _spinner.spinner = spinner

    const migrationLogger = await createMigrationLogHelper(migrationNote)

    await Promise.all(documents.map(async (snapshot) => {
        const documentRef = snapshot.ref
        const documentData = snapshot.data()
        const updatePackage = update(documentData, migrationLogger)
        updatePackage[MIGRATION_LOG_FIELD] = migrationLogger.log()
        const migrationFlags = migrationLogger.getFlags()
        if (Array.isArray(migrationFlags)) {
            updatePackage[MIGRATION_FLAGS_FIELD] = migrationFlags
        }
        await documentRef.update(updatePackage)
    }))

    spinner.succeed()

    return true
}

function getProblemIdMapping() {
    const poolFile = require(path.join(__dirname, "..", "..", "generated", "poolFile.json"))
    if (!Array.isArray(poolFile)) {
        throw new Error()
    }
    return Object.fromEntries(poolFile.map(obj => ([obj.id, obj])))
}

async function getSkillMapping() {
    return require(path.join(__dirname, "..", "config", "skillModel.json"))
}

/**
 *
 * @param collectionRef {FirebaseFirestore.CollectionReference}
 * @param n {number} number of samples
 * @param distribution {("uniform" | "random")}
 * @return {Promise<FirebaseFirestore.DocumentSnapshot[]>}
 */
async function sampleCollection(collectionRef, n, distribution = "uniform") {
    const firstTsSnapshot = await collectionRef.orderBy("time_stamp", "desc").limit(2).get()
    const lastTsSnapshot = await collectionRef.orderBy("time_stamp", "asc").limit(2).get()
    const { time_stamp: firstTs } = firstTsSnapshot.docs[1].data()
    const { time_stamp: lastTs } = lastTsSnapshot.docs[0].data()

    const timeDistance = lastTs - firstTs
    const samplePoints = []

    if (distribution === "uniform") {
        const dTs = timeDistance / (n - 1)
        for (let i = 0; i < n; i++) {
            samplePoints.push(firstTs + dTs * i)
        }
    } else {
        samplePoints.push(firstTs)
        samplePoints.push(lastTs)
        for (let i = 0; i < n - 2; i++) {
            samplePoints.push(firstTs + Math.random() * timeDistance)
        }
    }

    return await Promise.all(samplePoints.map(async ts => {
        return (await collectionRef.where("time_stamp", ">=", ts).limit(1).get()).docs[0]
    }))
}

const arrToObj = (arr) => {
    return Object.fromEntries(arr.map((item, idx) => ([idx, item])))
}
