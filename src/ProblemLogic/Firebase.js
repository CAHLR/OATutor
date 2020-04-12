import firebase from 'firebase';
import { credentials } from '../config/config.js';
import { getTreatment } from '../config/treatmentAssigner.js'

class Firebase {

  constructor(id) {
    firebase.initializeApp(credentials);
    this.id = id;
    this.db = firebase.firestore();
    this.treatment = getTreatment(id);
  }

  /*
    Collection: Collection of Key/Value pairs 
    Document: Key - How you will access this data later. Usually username
    Data: Value - JSON object of data you want to store
  */
  writeData(collection, document, data) {
    try {
      this.db.collection(collection).doc(document).set(data);
      return 0;
    } catch (err) {
      console.log(err);
      return -1;
    }
  }

  /*
    Collection: Collection of Key/Value pairs
    Document: Key - How you plan to access this data
    cb: callback function since reading data is asynchronous
  */
  readData(collection, document, cb, req, res) {
    this.db.collection(collection).doc(document).get().then((doc) =>
      cb(req, res, doc.data())
    ).catch(err => {
      cb(req, res, undefined)
    });
  }

  log(inputVal, step, isCorrect, hintsFinished) {
    var today = new Date();
    var date = (today.getMonth() + 1) + '-' +
      today.getDate() + '-' +
      today.getFullYear() + " " +
      today.getHours() + ":" +
      today.getMinutes() + ":" +
      (today.getSeconds() < 10 ? "0" + today.getSeconds() : today.getSeconds())
    var data = {
      timeStamp: date,
      siteVersion: 0.1,
      studentID: this.id,
      problemID: step.id.slice(0, -1),
      stepID: step.id,
      hintID: null,
      input: inputVal,
      correctAnswer: step.stepAnswer,
      isCorrect: isCorrect,
      hintInput: null,
      hintAnswer: null,
      hintIsCorrect: null,
      treatment: this.treatment,
      hintsFinished: hintsFinished
    }
    return this.writeData("problemSubmissions", date, data);
  }

  hintLog(hintInput, hint, isCorrect) {
    var today = new Date();
    var date = (today.getMonth() + 1) + '-' +
      today.getDate() + '-' +
      today.getFullYear() + " " +
      today.getHours() + ":" +
      today.getMinutes() + ":" +
      (today.getSeconds() < 10 ? "0" + today.getSeconds() : today.getSeconds())

    var data = {
      timeStamp: date,
      siteVersion: 0.1,
      studentID: this.id,
      problemID: null,
      stepID: null,
      hintID: null,
      input: null,
      correctAnswer: null,
      isCorrect: isCorrect,
      hintInput: hintInput,
      hintAnswer: hint.hintAnswer,
      hintIsCorrect: isCorrect,
      treatment: this.treatment,
      hintsFinished: null
    }
    console.log(data);
    return this.writeData("problemSubmissions", date, data);
  }
}
export default Firebase;

