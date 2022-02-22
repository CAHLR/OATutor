import ora from "ora";
import admin from "firebase-admin";
import prompts from "prompts";
import { config } from "dotenv";
import fs from "fs";
import { to } from "await-to-js";
import path from "path"
import { dedupeEntries, parseEntry } from "../util/objectEntryTools.mjs";
import chalk from "chalk";
import util from "util";
import glob from "glob";
import neatCsv from "neat-csv";

config({
    path: './.env.local'
});

const aglob = util.promisify(glob);
const areadFile = util.promisify(fs.readFile);

;(async () => {
    let err, _spinner = {}, remoteCollections, csvArr, _;
    [err, remoteCollections] = await to(initFirebase(_spinner));
    if (err) {
        _spinner.spinner.fail()
        console.debug("error log: ", err)
        console.log("Failed to connect to Firebase")
        return
    }

    [err, csvArr] = await to(findCSVs(_spinner));
    if (err) {
        _spinner.spinner.fail()
        console.debug("error log: ", err)
        console.log(`Failed to find CSVs in the ${chalk.bold('in')} directory`)
        return
    }

    const { collectionName, csvSelection, useTestRun } = await prompts([
        {
            type: 'autocomplete',
            name: 'csvSelection',
            message: 'Which CSV file to import?',
            choices: csvArr.map(csv => ({ title: csv, value: csv }))
        },
        {
            type: 'text',
            name: 'collectionName',
            message: 'Dump CSV rows into which collection?',
            validate: val => remoteCollections.map(a => a.name).includes(val) ? "That collection already exists" : true
        },
        {
            type: 'confirm',
            name: 'useTestRun',
            message: 'Test run? (20 rows)',
            initial: true
        }
    ]);

    if (!csvSelection || !collectionName) {
        console.log("Exiting program.")
        return
    }

    const { confirmation } = await prompts({
        type: 'confirm',
        name: 'confirmation',
        message: `Confirm import of ${csvSelection} into ${collectionName}?`,
        initial: true,
    });

    if (!confirmation) {
        console.log("Exiting program.")
        return
    }

    [err, _] = await to(importCollection(_spinner, csvSelection, collectionName, useTestRun))
    if (err) {
        _spinner.spinner.fail()
        console.debug("error log: ", err)
        console.log("Failed to import collection")
        return
    }

    ora("Done importing collection.").succeed()
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

async function findCSVs(_spinner) {
    const spinner = ora(`Finding CSVs in the ${chalk.bold('in')} directory`).start()
    _spinner.spinner = spinner

    const csvArr = await aglob("in/**/*.csv")

    spinner.succeed()
    return csvArr
}

async function importCollection(_spinner, csvSelection, collectionName, useTestRun) {
    const spinner = ora('Importing collection').start()
    _spinner.spinner = spinner

    const _csv = await areadFile(path.join(csvSelection))
    const _rows = await neatCsv(_csv)
    const rows = _rows
        .map(obj => Object.fromEntries(dedupeEntries(Object.entries(obj).map(parseEntry))))

    const objects = useTestRun
        ? sampleArray(rows, 20)
        : rows

    const db = admin.firestore()
    const collection = db.collection(collectionName)
    let batch = db.batch();
    let count = 0;
    while (objects.length) {
        const object = objects.shift()
        batch.set(collection.doc(getReadableID(object.time_stamp)), object);
        if (++count >= 500 || !objects.length) {
            await batch.commit();
            batch = db.batch();
            count = 0;
        }
    }

    spinner.succeed()

    return true
}


function getReadableID(ms) {
    const date = new Date(ms);
    return (
        ("0" + (date.getMonth() + 1)).slice(-2) + '-' +
        ("0" + date.getDate()).slice(-2) + '-' +
        date.getFullYear() + " " +
        ("0" + date.getHours()).slice(-2) + ":" +
        ("0" + date.getMinutes()).slice(-2) + ":" +
        ("0" + date.getSeconds()).slice(-2) + "|" +
        Math.floor(Math.random() * Math.pow(10, 5)).toString().padStart(5, "0")
    )
}

function sampleArray(arr, n) {
    let result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len) n = len
    while (n--) {
        const x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}
