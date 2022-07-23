import {
    MAX_BUFFER_SIZE,
    GRANULARITY,
    CURRENT_SEMESTER,
    DO_LOG_DATA,
    ENABLE_FIREBASE,
    DO_LOG_MOUSE_DATA
} from '../config/config.js'

import { initializeApp } from "firebase/app"
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const problemSubmissionsOutput = "problemSubmissions";
const problemStartLogOutput = "problemStartLogs";
const feedbackOutput = "feedbacks";
const siteLogOutput = "siteLogs"

class Firebase {

    constructor(oats_user_id, credentials, treatment, siteVersion, ltiContext) {
        if (!ENABLE_FIREBASE) return
        const app = initializeApp(credentials)

        this.oats_user_id = oats_user_id;
        this.db = getFirestore(app)
        this.treatment = treatment;
        this.siteVersion = siteVersion;
        this.mouseLogBuffer = [];
        this.ltiContext = ltiContext
    }

    /*
      Collection: Collection of Key/Value pairs
      Document: Key - How you will access this data later. Usually username
      Data: Value - JSON object of data you want to store
    */
    async writeData(_collection, data) {
        if (!ENABLE_FIREBASE) return
        const collection = process.env.REACT_APP_BUILD_TYPE === "production" ? _collection : `development_${_collection}`
        const _payload = {
            semester: CURRENT_SEMESTER,
            siteVersion: this.siteVersion,
            siteCommitHash: process.env.REACT_APP_COMMIT_HASH,
            oats_user_id: this.oats_user_id,
            treatment: this.treatment,
            time_stamp: Date.now(),
            server_time: serverTimestamp(),

            ...this.ltiContext?.user_id
                ? {
                    course_id: this.ltiContext.course_id,
                    course_name: this.ltiContext.course_name,
                    course_code: this.ltiContext.course_code,

                    canvas_user_id: this.ltiContext.user_id
                }
                : {
                    course_id: "n/a",
                    course_name: "n/a",
                    course_code: "n/a",

                    canvas_user_id: "n/a"
                },

            ...data
        }
        const payload = Object.fromEntries(Object.entries(_payload).map(([key, val]) => ([key, typeof val === 'undefined' ? null : val])))

        if (process.env.REACT_APP_BUILD_TYPE === "staging" || process.env.REACT_APP_BUILD_TYPE === "development") {
            console.debug("Writing this payload to firebase: ", payload)
        }

        await setDoc(doc(this.db, collection, this._getReadableID()), payload)
            .catch(err => {
                console.log("a non-critical error occurred.")
                console.debug(err)
            })
    }

    _getReadableID() {
        const today = new Date();
        return (
            ("0" + (today.getMonth() + 1)).slice(-2) + '-' +
            ("0" + today.getDate()).slice(-2) + '-' +
            today.getFullYear() + " " +
            ("0" + today.getHours()).slice(-2) + ":" +
            ("0" + today.getMinutes()).slice(-2) + ":" +
            ("0" + today.getSeconds()).slice(-2) + "|" +
            Math.floor(Math.random() * Math.pow(10, 5)).toString().padStart(5, "0")
        )
    }

    // TODO: consider using just the context instead
    log(inputVal, problemID, step, hint, isCorrect, hintsFinished, eventType, variabilization, lesson, courseName) {
        if (!DO_LOG_DATA) return
        console.debug("trying to log hint: ", hint, "step", step)
        if (Array.isArray(hintsFinished) && Array.isArray(hintsFinished[0])) {
            hintsFinished = hintsFinished.map(step => step.join(", "))
        }
        const data = {
            eventType: eventType,
            problemID: problemID,
            stepID: step?.id,
            hintID: hint?.id,
            input: inputVal?.toString(),
            correctAnswer: step?.stepAnswer?.toString(),
            isCorrect,
            hintInput: null,
            hintAnswer: null,
            hintIsCorrect: null,
            hintsFinished,
            variabilization,
            lesson,
            Content: courseName,
            knowledgeComponents: step?.knowledgeComponents
        };
        return this.writeData(problemSubmissionsOutput, data);
    }

    hintLog(hintInput, problemID, step, hint, isCorrect, hintsFinished, variabilization, lesson, courseName) {
        if (!DO_LOG_DATA) return
        console.debug("step", step)
        const data = {
            eventType: "hintScaffoldLog",
            problemID,
            stepID: step?.id,
            hintID: hint?.id,
            input: null,
            correctAnswer: null,
            isCorrect: null,
            hintInput: hintInput?.toString(),
            hintAnswer: hint?.hintAnswer?.toString(),
            hintIsCorrect: isCorrect,
            hintsFinished,
            variabilization,
            Content: courseName,
            lesson,
            knowledgeComponents: step?.knowledgeComponents
        };
        return this.writeData(problemSubmissionsOutput, data);
    }

    mouseLog(payload) {
        if (!DO_LOG_DATA || !DO_LOG_MOUSE_DATA) return
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
        const data = {
            eventType: "mouseLog",
            _logBufferSize: MAX_BUFFER_SIZE,
            _logGranularity: GRANULARITY,
            screenSize: payload.elementDimensions,
            mousePos: this.mouseLogBuffer
        };
        this.mouseLogBuffer = [];
        console.debug("Logged mouseMovement");
        return this.writeData("mouseMovement", data);
    }

    startedProblem(problemID, courseName, lesson, lessonObjectives) {
        if (!DO_LOG_DATA) return
        console.debug(`Logging that the problem has been started (${problemID})`)
        const data = {
            problemID,
            Content: courseName,
            lesson,
            lessonObjectives
        };
        return this.writeData(problemStartLogOutput, data);
    }

    submitSiteLog(logType, logMessage, relevantInformation, problemID = "n/a") {
        const data = {
            logType,
            logMessage,
            relevantInformation,
            problemID
        };
        return this.writeData(siteLogOutput, data);
    }

    submitFeedback(problemID, feedback, problemFinished, variables, courseName, steps, lesson) {
        const data = {
            problemID,
            problemFinished,
            feedback,
            lesson,
            status: "open",
            Content: courseName,
            variables,
            steps: steps.map(({ answerType, id, stepAnswer, problemType, knowledgeComponents }) => ({
                answerType,
                id,
                stepAnswer,
                problemType,
                knowledgeComponents
            }))
        };
        return this.writeData(feedbackOutput, data);
    }

}

export default Firebase;

