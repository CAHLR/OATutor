require('dotenv').config({
  path: './.env.local'
})
const admin = require('firebase-admin');
const to = require('await-to-js').default;
const serviceAccount = require('./service-account-credentials.json');
const { GoogleSpreadsheet } = require("google-spreadsheet");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const sheetsServiceAccount = require('./sheets-service-account.json');
const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);

const COLLECTION_NAME = "feedbackFall21"

;(async() => {
  let err;
  [err] = await to(doc.useServiceAccountAuth(sheetsServiceAccount));
  if(err){
    console.debug(err.message)
    console.log("Errored when trying to use Service Account")
    return
  }

  [err] = await to(doc.loadInfo());
  if(err){
    console.debug(err.message)
    console.log(`Errored when trying to load doc: ${process.env.SPREADSHEET_ID}`)
    return
  }

  let snapshot;
  [err, snapshot] = await to(db.collection(COLLECTION_NAME).get())
  if(err){
    console.debug(err.message)
    console.log(`Errored when trying to get a snapshot of collection: ${COLLECTION_NAME}. Are you sure it exists?`)
    return
  }

  const _rows = snapshot.docs.map(doc => doc.data());
  // convert all none string/number value into string
  const rows = _rows.map(_row =>
    Object.fromEntries(Object.entries(_row).map(([key, val]) =>
      [key, typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' ? val : JSON.stringify(val)]
    ))
  )

  const headerValues = Array.from(rows.reduce((acc, cur) => new Set([...acc, ...Object.keys(cur)]), new Set()))
  console.debug(`headerValues from data: ${headerValues}`)

  let sheet;
  [err, sheet] = await to(doc.addSheet({
    title: `${COLLECTION_NAME} - ${getDate()}`,
    headerValues
  }))
  if(err){
    console.debug(err.message)
    console.log("Errored when trying to create a new sheet.")
    return
  }

  [err] = await to(sheet.addRows(rows))
  if(err){
    console.debug(err.message)
    console.log(`Errored when writing to sheets`)
  }
})()

function getDate() {
  const today = new Date();
  return (today.getMonth() + 1) + '-' +
    today.getDate() + '-' +
    today.getFullYear() + "_" +
    today.getHours() + "_" +
    today.getMinutes() + "_" +
    (today.getSeconds() < 10 ? "0" + today.getSeconds() : today.getSeconds())
}
