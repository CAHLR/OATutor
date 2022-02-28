import { to } from "await-to-js";
import chalk from "chalk";
import prompts from "prompts";
import ora from "ora";
import path from "path";
import neatCsv from "neat-csv";
import { createTypedEntry, dedupeEntries, parseEntry } from "../util/objectEntryTools.mjs";
import { createRequire } from "module";
import { config } from "dotenv";
import util from "util";
import glob from "glob";
import fs from "fs";
import ObjectsToCsv from "objects-to-csv";

const require = createRequire(import.meta.url)
const { calculateSemester } = require("../util/calculateSemester.js");

config({
    path: './.env.local'
});

const aglob = util.promisify(glob);
const areadFile = util.promisify(fs.readFile);

;(async () => {
    let err, _spinner = {}, csvArr, _;
    [err, csvArr] = await to(findCSVs(_spinner));
    if (err) {
        _spinner.spinner.fail()
        console.debug("error log: ", err)
        console.log(`Failed to find CSVs in the ${chalk.bold('in')} directory`)
        return
    }

    const { csvSelections } = await prompts([
        {
            type: 'autocompleteMultiselect',
            name: 'csvSelections',
            message: 'Which collection(s) to merge?',
            choices: csvArr.map(csv => ({ title: csv, value: csv }))
        }
    ]);

    if (!csvSelections) {
        console.log("Exiting program.")
        return
    }

    [err, _] = await to(mergeCSVs(_spinner, csvSelections))
    if (err) {
        _spinner.spinner.fail()
        console.debug("error log: ", err)
        console.log(`Failed to merge the CSVs`)
        return
    }

    ora("Done merging collection(s).").succeed()
})()


async function findCSVs(_spinner) {
    const spinner = ora(`Finding CSVs in the ${chalk.bold('in')} directory`).start()
    _spinner.spinner = spinner

    const csvArr = [...await aglob("in/**/*.csv"), ...await aglob("out/**/*.csv")]

    spinner.succeed()
    return csvArr
}

async function mergeCSVs(_spinner, csvSelections) {
    _spinner.spinner = ora(`Merging CSVs`).start()

    const allEntries = await Promise.all(csvSelections.map(async csv => {
        const _csv = await areadFile(path.join(csv))
        const _objects = await neatCsv(_csv)
        return _objects
            .map(obj => Object.fromEntries(dedupeEntries(Object.entries(obj).map(parseEntry))))
            .map(obj => Object.fromEntries(Object.entries(obj).map(createTypedEntry)))
    }))

    const finalArr = allEntries.reduce((acc, cur) => [...acc, ...cur], [])

    const outFile = path.join('out', `binder-${Date.now()}.csv`)

    const modifiedCsv = new ObjectsToCsv(finalArr);
    await modifiedCsv.toDisk(outFile, { allColumns: true });

    _spinner.spinner.succeed()
}
