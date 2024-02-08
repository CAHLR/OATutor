import {
    CURRENT_SEMESTER,
    DO_LOG_DATA,
    DO_LOG_MOUSE_DATA,
    ENABLE_FIREBASE,
    GRANULARITY,
    MAX_BUFFER_SIZE,
} from "../config/config.js";

import { initializeApp } from "firebase/app";
import {
    arrayUnion,
    doc,
    getFirestore,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";
import daysSinceEpoch from "../util/daysSinceEpoch";
import {
    IS_PRODUCTION,
    IS_STAGING_CONTENT,
    IS_STAGING_OR_DEVELOPMENT,
    IS_STAGING_PLATFORM,
} from "../util/getBuildType";

const problemSubmissionsOutput = "problemSubmissions";
const problemStartLogOutput = "problemStartLogs";
const GPTExperimentOutput = "GPTExperimentOutput";
const feedbackOutput = "feedbacks";
const siteLogOutput = "siteLogs";
const focusStatus = "focusStatus";

class Firebase {
    constructor(oats_user_id, credentials, treatment, siteVersion, ltiContext) {
        if (!ENABLE_FIREBASE) {
            console.debug("Not using firebase for logging");
            return;
        }
        const app = initializeApp(credentials);

        this.oats_user_id = oats_user_id;
        this.db = getFirestore(app);
        this.treatment = treatment;
        this.siteVersion = siteVersion;
        this.mouseLogBuffer = [];
        this.ltiContext = ltiContext;
    }

    getCollectionName(targetCollection) {
        const cond1 =
            IS_STAGING_CONTENT &&
            [feedbackOutput, siteLogOutput].includes(targetCollection);
        const cond2 =
            IS_STAGING_PLATFORM && [siteLogOutput].includes(targetCollection);

        return IS_PRODUCTION || cond1 || cond2
            ? targetCollection
            : `development_${targetCollection}`;
    }

    /**
     * Instead of creating a new doc, pushes to an array instead.
     * @param _collection
     * @param documentId
     * @param arrField
     * @param data
     * @param doPartitioning partition data into a sub-collection's documents (for large amount of data)
     * @param partitionFn
     * @returns {Promise<void>}
     */
    async pushDataToArr(
        _collection,
        documentId,
        arrField,
        data,
        doPartitioning = false,
        partitionFn = daysSinceEpoch
    ) {
        if (!ENABLE_FIREBASE) return;
        const collection = this.getCollectionName(_collection);
        const payload = this.addMetaData(data, true);

        if (IS_STAGING_OR_DEVELOPMENT) {
            console.debug(`Upserting document: ${documentId}, with ${data}`);
        }

        const path = [this.db, collection, documentId];
        if (doPartitioning) {
            path.push("partitions", partitionFn().toString());
        }
        const docRef = doc(...path);
        await setDoc(
            docRef,
            {
                [arrField]: arrayUnion(payload),
            },
            {
                merge: true,
            }
        ).catch((err) => {
            console.log("a non-critical error occurred.");
            console.debug(err);
        });
    }

    /*
      Collection: Collection of Key/Value pairs
      Document: Key - How you will access this data later. Usually username
      Data: Value - JSON object of data you want to store
    */
    async writeData(_collection, data) {
        if (!ENABLE_FIREBASE) return;
        const collection = this.getCollectionName(_collection);
        const payload = this.addMetaData(data);

        if (IS_STAGING_OR_DEVELOPMENT) {
            // console.log("payload: ", payload);
            console.debug("Writing this payload to firebase: ", payload);
        }

        await setDoc(
            doc(this.db, collection, this._getReadableID()),
            payload
        ).catch((err) => {
            console.log("a non-critical error occurred.");
            console.log("Error is: ", err);
            console.debug(err);
        });
    }

    /**
     *
     * @param data
     * @param isArrayElement if true, cannot use FieldValue methods like serverTimestamp()
     * @returns {{[p: string]: *}}
     */
    addMetaData(data, isArrayElement = false) {
        const _payload = {
            semester: CURRENT_SEMESTER,
            siteVersion: this.siteVersion,
            siteCommitHash: process.env.REACT_APP_COMMIT_HASH,
            oats_user_id: this.oats_user_id,
            treatment: this.treatment,
            time_stamp: Date.now(),

            ...(process.env.REACT_APP_STUDY_ID
                ? {
                      study_id: process.env.REACT_APP_STUDY_ID,
                  }
                : {}),

            ...(!isArrayElement
                ? {
                      server_time: serverTimestamp(),
                  }
                : {}),

            ...(this.ltiContext?.user_id
                ? {
                      course_id: this.ltiContext.course_id,
                      course_name: this.ltiContext.course_name,
                      course_code: this.ltiContext.course_code,

                      lms_user_id: this.ltiContext.user_id,
                  }
                : {
                      course_id: "n/a",
                      course_name: "n/a",
                      course_code: "n/a",

                      lms_user_id: "n/a",
                  }),

            ...data,
        };
        return Object.fromEntries(
            Object.entries(_payload).map(([key, val]) => [
                key,
                typeof val === "undefined" ? null : val,
            ])
        );
    }

    _getReadableID() {
        const today = new Date();
        return (
            ("0" + (today.getMonth() + 1)).slice(-2) +
            "-" +
            ("0" + today.getDate()).slice(-2) +
            "-" +
            today.getFullYear() +
            " " +
            ("0" + today.getHours()).slice(-2) +
            ":" +
            ("0" + today.getMinutes()).slice(-2) +
            ":" +
            ("0" + today.getSeconds()).slice(-2) +
            "|" +
            Math.floor(Math.random() * Math.pow(10, 5))
                .toString()
                .padStart(5, "0")
        );
    }

    // TODO: consider using just the context instead
    log(
        inputVal,
        problemID,
        step,
        hint,
        isCorrect,
        hintsFinished,
        eventType,
        variabilization,
        lesson,
        courseName,
        hintType,
        dynamicHint,
        bioInfo
    ) {
        if (!DO_LOG_DATA) {
            console.debug("Not using firebase for logging (2)");
            return;
        }
        console.debug("trying to log hint: ", hint, "step", step);
        if (Array.isArray(hintsFinished) && Array.isArray(hintsFinished[0])) {
            hintsFinished = hintsFinished.map((step) => step.join(", "));
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
            knowledgeComponents: step?.knowledgeComponents,
            hintType,
            dynamicHint,
            bioInfo,
        };
        // return this.writeData(GPTExperimentOutput, data);
        return this.writeData(problemSubmissionsOutput, data);
    }

    hintLog(
        hintInput,
        problemID,
        step,
        hint,
        isCorrect,
        hintsFinished,
        variabilization,
        lesson,
        courseName,
        hintType,
        dynamicHint,
        bioInfo
    ) {
        if (!DO_LOG_DATA) return;
        console.debug("step", step);
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
            dynamicHint: "abc",
            bioInfo: "abcedf",
            variabilization,
            Content: courseName,
            lesson,
            knowledgeComponents: step?.knowledgeComponents,
            hintType,
            dynamicHint,
            bioInfo,
        };
        // return this.writeData(GPTExperimentOutput, data);
        return this.writeData(problemSubmissionsOutput, data);
    }

    mouseLog(payload) {
        if (!DO_LOG_DATA || !DO_LOG_MOUSE_DATA) return;
        if (this.mouseLogBuffer.length > 0) {
            if (
                !(
                    Math.abs(
                        payload.position.x -
                            this.mouseLogBuffer[this.mouseLogBuffer.length - 1]
                                .x
                    ) > GRANULARITY ||
                    Math.abs(
                        payload.position.y -
                            this.mouseLogBuffer[this.mouseLogBuffer.length - 1]
                                .y
                    ) > GRANULARITY
                )
            ) {
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
            mousePos: this.mouseLogBuffer,
        };
        this.mouseLogBuffer = [];
        console.debug("Logged mouseMovement");
        return this.writeData("mouseMovement", data);
    }

    startedProblem(problemID, courseName, lesson, lessonObjectives) {
        if (!DO_LOG_DATA) return;
        console.debug(
            `Logging that the problem has been started (${problemID})`
        );
        const data = {
            problemID,
            Content: courseName,
            lesson,
            lessonObjectives,
        };
        return this.writeData(problemStartLogOutput, data);
    }

    submitSiteLog(logType, logMessage, relevantInformation, problemID = "n/a") {
        const data = {
            logType,
            logMessage,
            relevantInformation,
            problemID,
        };
        return this.writeData(siteLogOutput, data);
    }

    submitFocusChange(_focusStatus) {
        const data = {
            focusStatus: _focusStatus,
        };

        // TODO: oats_user_id is not guaranteed to be unique across users; is this a problem?
        return this.pushDataToArr(
            focusStatus,
            this.oats_user_id,
            "focusHistory",
            data,
            true
        );
    }

    submitFeedback(
        problemID,
        feedback,
        problemFinished,
        variables,
        courseName,
        steps,
        lesson
    ) {
        const data = {
            problemID,
            problemFinished,
            feedback,
            lesson,
            status: "open",
            Content: courseName,
            variables,
            steps: steps.map(
                ({
                    answerType,
                    id,
                    stepAnswer,
                    problemType,
                    knowledgeComponents,
                }) => ({
                    answerType,
                    id,
                    stepAnswer,
                    problemType,
                    knowledgeComponents,
                })
            ),
        };
        return this.writeData(feedbackOutput, data);
    }
}

export default Firebase;
