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
import { EOL } from 'os';
import ObjectsToCsv from "objects-to-csv";
import { createTypedEntry, parseEntry } from "../util/objectEntryTools.mjs";
import { calculateSemester } from "../util/calculateSemester.mjs";

config({
    path: './.env.local'
});

const aglob = util.promisify(glob)
const areadFile = util.promisify(fs.readFile)

/*
const transform = document => {
        if (document.course_id === "" || document.course_id === undefined) {
            document.course_id = "n/a"
        }
        if(document.course_id === "n/a"){
            document.course_code = "n/a"
            document.course_name = "n/a"
            document.canvas_user_id = "n/a"
        }
        return document
    }
/**/

/*
const transform = document => {
        if (document.time_stamp === 0) {
            if(!document.timeStamp || document.timeStamp.length < 5){
                throw new Error("could not guess time stamp since timeStamp does not exist on document")
            }
            // fair assumption to use admin locale
            document.time_stamp = new Date(document.timeStamp).getTime()
        }
        delete document.timeStamp
        return document
    }
/**/

/*
const transform = document => {
        if(document.studentID){
            document.oats_user_id = document.studentID
        }
        delete document.studentID
        return document
    }
/**/

/*
const transform = document => {
        delete document.full_name
        delete document.canvasStudentID
        return document
    }
/**/

const transform = document => {
        if (document.time_stamp === 0 || document.time_stamp === undefined) {
            if (!document.timeStamp || document.timeStamp.length < 5) {
                throw new Error("could not guess time stamp since timeStamp does not exist on document")
            }
            // fair assumption to use admin locale
            document.time_stamp = new Date(document.timeStamp).getTime()
        }

        if (document.oats_user_id === undefined || document.oats_user_id.length < 2) {
            document.oats_user_id = document.studentID.toString()
        }

        if (typeof document.siteVersion === "number") {
            document.siteVersion = document.siteVersion.toString()
        }

        if (document.course_id === "" || document.course_id === undefined) {
            document.course_id = "n/a"
        }
        if (document.course_id === "n/a") {
            document.course_code = "n/a"
            document.course_name = "n/a"
            document.canvas_user_id = "n/a"
        }

        if (document.variables === undefined) {
            document.variables = "n/a"
        }

        if (document.steps === undefined) {
            document.steps = "n/a"
        }

        if (document.Content === undefined) {
            document.Content = "n/a"
        }

        if (document.semester === undefined) {
            document.semester = calculateSemester(document.time_stamp)
        }

        delete document.timeStamp
        delete document.canvasStudentID
        delete document.studentID
        return document
    }
    /**/

;(async () => {
    let err, _spinner = {}, csvArr, _;
    [err, csvArr] = await to(findCSVs(_spinner));
    if (err) {
        _spinner.spinner.fail()
        console.debug("error log: ", err)
        console.log(`Failed to find CSVs in the ${chalk.bold('in')} directory`)
        return
    }

    console.log(`Transformation function:${EOL}${chalk.gray(transform.toString())}`)

    const { csvSelections, confirmation } = await prompts([
        {
            type: 'autocompleteMultiselect',
            name: 'csvSelections',
            message: 'Which collection(s) to apply the transformation function on?',
            choices: csvArr.map(csv => ({ title: csv, value: csv }))
        },
        {
            type: "confirm",
            name: "confirmation",
            message: (prev) => `Are you sure you want to apply this function to all documents in ${chalk.bold(prev.join(", "))}`,
            initial: true
        }
    ]);

    if (!csvSelections) {
        console.log("Exiting program.")
        return
    }

    if (!confirmation) {
        console.log("Exiting program.")
        return
    }

    [err, _] = await to(manipulateCSVs(_spinner, csvSelections))
    if (err) {
        _spinner.spinner.fail()
        console.debug("error log: ", err)
        console.log(`Failed to manipulate CSVs`)
        return
    }

    ora("Done transforming collection(s).").succeed()
})()


async function findCSVs(_spinner) {
    const spinner = ora(`Finding CSVs in the ${chalk.bold('in')} directory`).start()
    _spinner.spinner = spinner

    const csvArr = await aglob("in/**/*.csv")

    spinner.succeed()
    return csvArr
}

async function manipulateCSVs(_spinner, csvSelections) {
    _spinner.spinner = ora(`Manipulating CSVs`).start()

    await Promise.all(csvSelections.map(async csv => {
        const _csv = await areadFile(path.join(csv))
        const _objects = await neatCsv(_csv)
        const objects = _objects
            .map(obj => Object.fromEntries(Object.entries(obj).map(parseEntry)))
            .map(transform)
            .map(obj => Object.fromEntries(Object.entries(obj).map(createTypedEntry)))

        const outFile = path.join('out', `modified-${Date.now()}-${path.parse(csv).name}.csv`)

        const modifiedCsv = new ObjectsToCsv(objects);
        await modifiedCsv.toDisk(outFile, { allColumns: true });
    }))

    _spinner.spinner.succeed()
}
