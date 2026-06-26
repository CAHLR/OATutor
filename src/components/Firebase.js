import {
    CURRENT_SEMESTER,
    DO_LOG_DATA,
    DO_LOG_MOUSE_DATA,
    ENABLE_FIREBASE,
    GRANULARITY,
    MAX_BUFFER_SIZE,
} from "../config/config.js";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
    arrayUnion,
    doc,
    getFirestore,
    increment,
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
const feedbackOutput = "feedbacks";
const siteLogOutput = "siteLogs";
const focusStatus = "focusStatus";
const chatHistoryOutput = "chatHistory";

function isPlaceholderFirebaseConfig(credentials) {
    const projectId = credentials?.projectId || "";
    const apiKey = credentials?.apiKey || "";
    return (
        projectId.includes("[projId]") ||
        apiKey.includes("[apikey]") ||
        !projectId ||
        !apiKey
    );
}

function isFirestoreFieldValue(value) {
    return (
        value &&
        typeof value === "object" &&
        typeof value._methodName === "string"
    );
}

function sanitizeForFirestore(value) {
    if (value === undefined) return null;
    if (isFirestoreFieldValue(value)) return value;
    if (value === null || typeof value !== "object") return value;
    if (Array.isArray(value)) {
        return value.map(sanitizeForFirestore);
    }
    return Object.fromEntries(
        Object.entries(value).map(([key, val]) => [
            key,
            sanitizeForFirestore(val),
        ])
    );
}

class Firebase {
    constructor(oats_user_id, credentials, treatment, siteVersion, ltiContext) {
        if (!ENABLE_FIREBASE) {
            console.debug("Not using firebase for logging");
            return;
        }
        if (isPlaceholderFirebaseConfig(credentials)) {
            console.error(
                "[Firebase] Logging is enabled but firebaseConfig.js still has placeholder values. " +
                    "Copy your project config from Firebase Console → Project settings → Your apps, " +
                    "or set REACT_APP_FIREBASE_CONFIG in .env, then restart npm start."
            );
        }
        const app = getApps().length ? getApp() : initializeApp(credentials);

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
        if (!this.db) {
            console.warn(
                `[Firebase] Skipping write to "${_collection}" because Firestore is not initialized.`
            );
            return;
        }

        const collection = this.getCollectionName(_collection);
        let payload;
        try {
            payload = sanitizeForFirestore(this.addMetaData(data));
        } catch (err) {
            console.warn(`Firebase write failed while building payload for "${collection}"`, err);
            return;
        }

        if (IS_STAGING_OR_DEVELOPMENT) {
            console.debug("Writing this payload to firebase: ", payload);
        }

        const docId = this._getReadableID();
        try {
            await Promise.race([
                setDoc(doc(this.db, collection, docId), payload),
                new Promise((_, reject) =>
                    setTimeout(
                        () =>
                            reject(
                                new Error(
                                    "Firestore write timed out after 10s (check firebaseConfig.js and security rules)"
                                )
                            ),
                        10000
                    )
                ),
            ]);
            if (_collection === chatHistoryOutput) {
                console.log(`[chatHistory] saved to "${collection}"`, payload.eventType);
            }
        } catch (err) {
            console.warn(`Firebase write failed for "${collection}"`, err);
        }
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
        bioInfo,
        masteryScore = null,
        kcMastery = null
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
            masteryScore,
            kcMastery,
            knowledgeComponents: step?.knowledgeComponents,
            hintType,
            dynamicHint,
            bioInfo,
        };
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
        bioInfo,
        masteryScore = null,
        kcMastery = null
    ) {
        if (!DO_LOG_DATA) return;
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
            masteryScore,
            kcMastery,
            lesson,
            knowledgeComponents: step?.knowledgeComponents,
            hintType,
            dynamicHint,
            bioInfo,
        };
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

    logChatHistory(data) {
        if (!DO_LOG_DATA) return;
        const collection = this.getCollectionName(chatHistoryOutput);
        if (process.env.NODE_ENV === 'development') {
            console.log(`[chatHistory] writing to "${collection}"`, data?.eventType || data);
        }
        return this.writeData(chatHistoryOutput, data);
    }

    /**
     * Write or update a chatSessions document.
     * Called with full initial metadata on session start, then with delta
     * objects (using Firestore increment()) for counter updates.
     * Does NOT call addMetaData — caller is responsible for all fields.
     */
    async logChatSession(sessionId, data) {
        if (!DO_LOG_DATA) return;
        if (!this.db) return;
        const collection = this.getCollectionName('chatSessions');
        const docRef = doc(this.db, collection, sessionId);
        let payload;
        try {
            payload = sanitizeForFirestore(data);
        } catch (err) {
            console.warn('[Firebase] logChatSession: failed to sanitize payload', err);
            return;
        }
        if (process.env.NODE_ENV === 'development') {
            console.log(`[chatSessions] upsert "${sessionId}"`, payload);
        }
        return setDoc(docRef, payload, { merge: true }).catch((err) => {
            console.warn('[Firebase] logChatSession write failed', err);
        });
    }

    /**
     * Write one lean chatHistory document for a single user/assistant message.
     * Only stores session-linking fields + message content; all other metadata
     * lives in chatSessions and is NOT duplicated here.
     */
    async logChatMessage(sessionId, messageData) {
        if (!DO_LOG_DATA) return;
        if (!this.db) return;
        const collection = this.getCollectionName(chatHistoryOutput);
        const docId = this._getReadableID();
        let payload;
        try {
            payload = sanitizeForFirestore({ sessionId, ...messageData });
        } catch (err) {
            console.warn('[Firebase] logChatMessage: failed to sanitize payload', err);
            return;
        }
        if (process.env.NODE_ENV === 'development') {
            console.log(`[chatHistory] message "${docId}"`, payload?.role);
        }
        return setDoc(doc(this.db, collection, docId), payload).catch((err) => {
            console.warn('[Firebase] logChatMessage write failed', err);
        });
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
export { increment };
