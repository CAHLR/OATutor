import ora from "ora";
import prompts from "prompts";
import { config } from "dotenv";
import { to } from "await-to-js";
import path from "path"
import chalk from 'chalk';
import glob from 'glob'
import util from 'util'
import fs from 'fs'
import neatCsv from 'neat-csv';
import { dedupeEntries, isObject, parseEntry } from "../util/objectEntryTools.mjs";

config({
    path: './.env.local'
});

const aglob = util.promisify(glob)
const areadFile = util.promisify(fs.readFile)

const collectionTypes = ["Generic", "Feedback", "ProblemSubmission", "ProblemStart"]

;(async () => {
    let err, _spinner = {}, csvArr, _;
    [err, csvArr] = await to(findCSVs(_spinner));
    if (err) {
        _spinner.spinner.fail()
        console.debug("error log: ", err)
        console.log(`Failed to find CSVs in the ${chalk.bold('in')} directory`)
        return
    }

    const { csvSelections, collectionType, useSampleMode } = await prompts([
        {
            type: 'autocompleteMultiselect',
            name: 'csvSelections',
            message: 'Which collection(s) to verify?',
            choices: csvArr.map(csv => ({ title: csv, value: csv }))
        },
        {
            type: "select",
            name: "collectionType",
            message: "What type of collection is this?",
            choices: collectionTypes.map(type => ({ title: type, value: type }))
        },
        {
            type: "confirm",
            name: "useSampleMode",
            message: "Use sample mode? (20 random rows)",
            initial: true
        }
    ]);

    if (!csvSelections) {
        console.log("Exiting program.")
        return
    }

    if (!collectionType) {
        console.log("Exiting program.")
        return
    }

    [err, _] = await to(verifyCSVs(_spinner, csvSelections, collectionType, useSampleMode))
    if (err) {
        _spinner.spinner.fail()
        console.debug("error log: ", err)
        console.log(`Failed to verify CSVs`)
        return
    }

    ora("Done verifying collection(s).").succeed()
})()


async function findCSVs(_spinner) {
    const spinner = ora(`Finding CSVs in the ${chalk.bold('in')} directory`).start()
    _spinner.spinner = spinner

    const csvArr = [...await aglob("in/**/*.csv"), ...await aglob("out/**/*.csv")]

    spinner.succeed()
    return csvArr
}

async function verifyCSVs(_spinner, csvSelections, collectionType, useSampleMode) {
    _spinner.spinner = ora(`Verifying CSVs...`).succeed()

    await Promise.all(csvSelections.map(async csv => {
        const _csv = await areadFile(path.join(csv))
        const _rows = await neatCsv(_csv)
        const rows = _rows.map(obj => Object.fromEntries(dedupeEntries(Object.entries(obj).map(parseEntry))))

        const objects = useSampleMode
            ? sampleArray(rows, Math.max(Math.ceil(20 / csvSelections.length), 5))
            : rows

        objects.forEach(_object => {
            const object = new ObjectValidator(_object)
            object.assertType("semester", "string")
            object.assertNotBlank("semester")
            object.assertType("siteVersion", "string")
            object.assertNotBlank("siteVersion")
            object.assertPredicate("siteVersion", val => val?.toString().length >= 2)
            object.assertType("treatment", "string", "number")
            object.assertType("oats_user_id", "string")
            object.assertNotBlank("oats_user_id")
            object.assertPredicate("oats_user_id", val => val?.toString().length >= 2)
            object.assertType("time_stamp", "number")
            object.assertPredicate("time_stamp", val => (!isNaN(val)) && val > 1000)

            object.assertPredicate("course_id", val => val === "n/a" || val?.toString().length === 40)
            object.assertPredicate("course_code", val => val === "n/a" || val?.toString().length >= 2)
            object.assertPredicate("course_name", val => val === "n/a" || val?.toString().length >= 4)
            object.assertPredicate("lms_user_id", val => val === "n/a" || val?.toString().length === 40)

            object.assertType("timeStamp", "undefined")
            object.assertType("canvasStudentID", "undefined")
            object.assertType("full_name", "undefined")
            object.assertType("studentID", "undefined")

            switch (collectionType) {
                case "Feedback": {
                    object.assertType("feedback", "string")
                    object.assertPredicate("Content", val => val === "n/a" || (typeof val === "string" && val.length > 4))
                    object.assertType("problemFinished", "boolean")
                    object.assertPredicate("problemID", val => val === "n/a" || (typeof val === "string" && val.length > 3))
                    object.assertType("status", "string")
                    object.assertPredicate("status", val => val === "n/a" || (typeof val === "string" && val.length > 2))
                    object.assertPredicate("steps", val => val === "n/a" || Array.isArray(val))
                    object.assertPredicate("variables", val => val === "n/a" || isObject(val))
                    break
                }
                case "ProblemSubmission": {
                    object.assertType("eventType", "string")
                    object.assertNotBlank("eventType")
                    object.assertType("hintInput", "string")
                    object.assertPredicate("hintsFinished", val => val === "n/a" || Array.isArray(val))
                    object.assertType("input", "string")
                    object.assertPredicate("hintID", val => val === "n/a" || (typeof val === "string" && val.length > 3))
                    object.assertPredicate("problemID", val => val === "n/a" || (typeof val === "string" && val.length > 3))
                    object.assertPredicate("stepID", val => val === "n/a" || (typeof val === "string" && val.length > 3))

                    object.assertPredicate("variabilization", val => val === "n/a" || isObject(val))
                    object.assertPredicate("correctAnswer", val => val === "n/a" || Array.isArray(val))
                    object.assertPredicate("hintAnswer", val => val === "n/a" || Array.isArray(val) || isObject(val))

                    object.assertPredicate("hintIsCorrect", val => val === "n/a" || typeof val === "boolean")
                    object.assertPredicate("isCorrect", val => val === "n/a" || typeof val === "boolean")

                    object.assertType("variablization", "undefined")
                    break
                }
                case "ProblemStart": {
                    object.assertPredicate("Content", val => val === "n/a" || (typeof val === "string" && val.length > 4))
                    object.assertPredicate("problemID", val => val === "n/a" || (typeof val === "string" && val.length > 3))
                    break
                }
            }

            object.validate()
        })
    }))

    return true
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
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

class ObjectValidator {
    #assertions
    #trackedFields

    constructor(object) {
        this.object = object
        this.#assertions = []
        this.#trackedFields = []
    }

    _trackField = (field) => {
        if (!this.#trackedFields.includes(field)) {
            this.#trackedFields.push(field)
        }
    }

    assertNotBlank = (field) => {
        const obj = this.object
        const val = obj[field]
        this.#assertions.push(() => {
            if (typeof val === "string" && isBlank(val)) {
                console.log(`field ${chalk.bold(field)} is empty`)
                return false
            }
            return true
        })
    }

    assertPredicate = (field, predicate) => {
        this._trackField(field)
        const obj = this.object
        const val = obj[field]
        this.#assertions.push(() => {
            if (!predicate(val)) {
                console.log(`field ${chalk.bold(field)}'s value ${chalk.bold(val)} does not pass predicate: ${chalk.bold(predicate.toString())}`)
                return false
            }
            return true
        })
    }

    assertOptionalType = (field, ...types) => {
        this._trackField(field)
        const obj = this.object
        const val = obj[field]
        types = [...types, "undefined"]
        this.#assertions.push(() => {
            if (!types.some(type => typeof val === type)) {
                console.log(`field ${chalk.bold(field)}'s value ${chalk.bold(val)} has type ${chalk.bold(typeof val)} which does not match type(s): ${chalk.bold(types.join(" "))}`)
                return false
            }
            return true
        })
    }

    assertOptionalNotNull = (field) => {
        this._trackField(field)
        const obj = this.object
        const val = obj[field]
        this.#assertions.push(() => {
            if (val === null) {
                console.log(`field ${chalk.bold(field)} is null`)
            }
            return true
        })
    }

    assertType = (field, ...types) => {
        this._trackField(field)
        const obj = this.object
        const val = obj[field]
        this.#assertions.push(() => {
            if (!types.some(type => typeof val === type)) {
                console.log(`field ${chalk.bold(field)}'s value ${chalk.bold(val)} has type ${chalk.bold(typeof val)} which does not match type(s): ${chalk.bold(types.join(" "))}`)
                return false
            }
            return true
        })
    }

    validate = () => {
        const errored = this.#assertions.map(assertion => !assertion()).some(_ => _)

        const unknownFields = Object.keys(this.object).filter(key => !this.#trackedFields.includes(key))
        if (unknownFields.length > 0) {
            console.log(chalk.yellow(`Unknown fields: ${chalk.bold(unknownFields.join(", "))}`))
        }
        if (errored) {
            console.log(chalk.grey(JSON.stringify(this.object)))
        }

        if (errored || unknownFields.length > 0) {
            console.log()
        }
    }
}
