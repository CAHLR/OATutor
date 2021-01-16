import { MAX_BUFFER_SIZE, GRANULARITY } from '../config/config.js'
var firebase = require("firebase/app");
require("firebase/firestore");

class Firebase {

  constructor(id, credentials, treatment, siteVersion) {
    var app = firebase.initializeApp(credentials);
    this.id = id;
    this.db = firebase.firestore(app);
    this.treatment = treatment;
    this.siteVersion = siteVersion;
    this.mouseLogBuffer = [];
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

  getDate() {
    var today = new Date();
    return (today.getMonth() + 1) + '-' +
      today.getDate() + '-' +
      today.getFullYear() + " " +
      today.getHours() + ":" +
      today.getMinutes() + ":" +
      (today.getSeconds() < 10 ? "0" + today.getSeconds() : today.getSeconds())
  }

  log(inputVal, problemID, step, isCorrect, hintsFinished, eventType, canvasStudentID) {
    var date = this.getDate();
    var data = {
      timeStamp: date,
      eventType: eventType,
      siteVersion: this.siteVersion,
      studentID: this.id,
      problemID: problemID,
      stepID: step.id,
      hintID: null,
      input: inputVal,
      correctAnswer: step.stepAnswer,
      isCorrect: isCorrect,
      hintInput: null,
      hintAnswer: null,
      hintIsCorrect: null,
      treatment: this.treatment,
      hintsFinished: hintsFinished,
      canvasStudentID: canvasStudentID
    }
    return this.writeData("problemSubmissions", date, data);
  }

  hintLog(hintInput, problemID, step, hint, isCorrect, hintsFinished, canvasStudentID) {
    var date = this.getDate();
    var data = {
      timeStamp: date,
      eventType: "hintScaffoldLog",
      siteVersion: this.siteVersion,
      studentID: this.id,
      problemID: problemID,
      stepID: step.id,
      hintID: hint.id,
      input: null,
      correctAnswer: null,
      isCorrect: null,
      hintInput: hintInput,
      hintAnswer: hint.hintAnswer,
      hintIsCorrect: isCorrect,
      treatment: this.treatment,
      hintsFinished: hintsFinished,
      canvasStudentID: canvasStudentID
    }
    console.log(data);
    return this.writeData("problemSubmissions", date, data);
  }

  mouseLog(payload) {
    var date = this.getDate();
    if (this.mouseLogBuffer.length > 0) {
      if (!(Math.abs(payload.position.x - this.mouseLogBuffer[this.mouseLogBuffer.length - 1].x) > GRANULARITY ||
        Math.abs(payload.position.y - this.mouseLogBuffer[this.mouseLogBuffer.length - 1].y) > GRANULARITY
      )) {
        return;
      }
    }
    if (this.mouseLogBuffer.length < MAX_BUFFER_SIZE) {
      this.mouseLogBuffer.push({
        x: payload.position.x,
        y: payload.position.y,
      });
      return;
    }
    var data = {
      timeStamp: date,
      eventType: "mouseLog",
      siteVersion: this.siteVersion,
      studentID: this.id,
      treatment: this.treatment,
      _logBufferSize: MAX_BUFFER_SIZE,
      _logGranularity: GRANULARITY,
      screenSize: payload.elementDimensions,
      mousePos: this.mouseLogBuffer
    }
    this.mouseLogBuffer = [];
    console.log("Logged mouseMovement");
    return this.writeData("mouseMovement", date, data);
  }

  submitFeedback(problemID, feedback, problemFinished, canvasStudentID) {
    var date = this.getDate();
    var data = {
      timeStamp: date,
      siteVersion: this.siteVersion,
      studentID: this.id,
      problemID: problemID,
      treatment: this.treatment,
      problemFinished: problemFinished,
      feedback: feedback,
      canvasStudentID: canvasStudentID
    }
    return this.writeData("feedback", date, data);
  }

}
export default Firebase;

