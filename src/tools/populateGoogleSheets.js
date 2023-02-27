require('dotenv').config({
    path: './.env.local'
})
const fromEntries = require('object.fromentries');
const admin = require('firebase-admin');
const to = require('await-to-js').default;
const serviceAccount = require('./service-account-credentials.json');
const { GoogleSpreadsheet } = require("google-spreadsheet");
const crypto = require("crypto")
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const sheetsServiceAccount = require('./sheets-service-account.json');
const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);

const COLLECTION_NAME = "feedbacks";

const { calculateSemester } = require("../util/calculateSemester")
const CURRENT_SEMESTER = calculateSemester(Date.now())
const SHEET_NAME = `All Feedbacks`

const COLUMN_NAME_MAPPING = {
    "id": "Id",
    "time_stamp": "date",
    "feedback": "Feedback",
    "oats_user_id": "studentName",
    "problemID": "problemName",
    "treatment": "treatmentID",
    "problemFinished": "problemFinished?"
};

const COLUMN_TITLES = ["Id", "date", "Content", "problemName", "studentName", "Feedback", "steps", "Issue Type", "status", "resolution", "resolveDate", "deployDate", "problemFinished?", "siteVersion", "versionFixed", "treatmentID", "Semester"]

const INTERPOLATORS = {
    "date": val => getFormattedDate(val),
    "Semester": val => calculateSemester(val)
}

const EXCLUDED_FIELDS = ["semester", "lms_user_id", "course_code", "course_id", "server_time"]

const HASH_EXCLUDE_FIELDS = ['status', 'resolution', 'resolveDate', 'deployDate', 'versionFixed', 'Issue Type']

if (!Object.fromEntries) {
    fromEntries.shim();
}

;(async () => {
    let err;
    [err] = await to(doc.useServiceAccountAuth(sheetsServiceAccount));
    if (err) {
        console.debug(err.message)
        console.log("Errored when trying to use Service Account")
        return
    }

    [err] = await to(doc.loadInfo());
    if (err) {
        console.debug(err.message)
        console.log(`Errored when trying to load doc: ${process.env.SPREADSHEET_ID}`)
        return
    }

    let snapshot;
    [err, snapshot] = await to(db.collection(COLLECTION_NAME).where("semester", "==", CURRENT_SEMESTER).orderBy('time_stamp').get())
    if (err) {
        console.debug(err.message)
        console.log(`Errored when trying to get a snapshot of collection: ${COLLECTION_NAME}. Are you sure it exists?`)
        return
    }

    const _rows = snapshot.docs
        .map(doc => doc.data())
        .map(data => ({ ...data, Semester: data.time_stamp }))
        // sort each data point by its keys to ensure consistent hash
        .map(data => sort(data))
        // generates id based on content
        .map(data => {
            const hash = crypto
                .createHash('sha1')
                .update(JSON.stringify(removeFields(data, HASH_EXCLUDE_FIELDS)))
                .digest('hex');
            return {
                id: hash,
                ...data
            }
        })
        // map db key names to column names
        .map(data => Object.fromEntries(Object.entries(data).map(([key, value]) => [COLUMN_NAME_MAPPING[key] || key, value])));

    // interpolate then convert all none string/number value into string
    let nRows = _rows.map(_row =>
        Object.fromEntries(Object.entries(_row)
            .map(([key, val]) => [key, INTERPOLATORS[key] ? INTERPOLATORS[key](val) : val])
            .map(([key, val]) => [key, typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' ? val : JSON.stringify(val)])
        )
    )

    // calculate additional headings
    const additionalHeadings = new Set()
    _rows.forEach(row => {
        Object.keys(row).forEach(key => {
            if (!COLUMN_TITLES.includes(key) && !EXCLUDED_FIELDS.includes(key)) {
                additionalHeadings.add(key)
            }
        })
    })

    const headerValues = [...COLUMN_TITLES, ...additionalHeadings]

    let sheet;

    sheet = doc.sheetsByTitle[SHEET_NAME];

    if (!sheet) {
        console.debug(`Did not find a sheet by the name of ${SHEET_NAME}, creating new sheet automatically..`);
        [err, sheet] = await to(doc.addSheet({
            title: SHEET_NAME,
            headerValues
        }))
        if (err) {
            console.debug(err.message)
            console.log("Errored when trying to create a new sheet.")
            return
        }
    }

    let oRows;
    [err, oRows] = await to(sheet.getRows());

    const oldIds = oRows.map(_row => _row[COLUMN_NAME_MAPPING['id'] || 'id']).filter(id => id && id.length > 6);

    nRows = nRows.filter(_row => !oldIds.includes(_row[COLUMN_NAME_MAPPING['id'] || 'id']));

    if (nRows.length === 0) {
        console.debug('No new feedback found! Returning early..')
        return
    }

    [err] = await to(sheet.addRows(nRows))
    if (err) {
        console.debug(err.message)
        console.log(`Errored when writing to sheets`)
    } else {
        console.debug(`Successfully inserted ${nRows.length} rows.`)
    }
})()

function removeFields(obj, keys) {
    return Object.fromEntries(Object.entries(obj).filter(([key, _]) => !keys.includes(key)))
}

function getFormattedDate(ms) {
    const date = new Date(ms);
    return (
        ("0" + (date.getMonth() + 1)).slice(-2) + '-' +
        ("0" + date.getDate()).slice(-2) + '-' +
        date.getFullYear() + " " +
        ("0" + date.getHours()).slice(-2) + ":" +
        ("0" + date.getMinutes()).slice(-2) + ":" +
        ("0" + date.getSeconds()).slice(-2)
    )
}

function sort(obj) {
    if (typeof obj !== "object")
        return obj;
    if (Array.isArray(obj)) {
        return obj.map(obj => sort(obj)).sort()
    }
    const sortedObject = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(key => sortedObject[key] = sort(obj[key]));
    return sortedObject;
}
