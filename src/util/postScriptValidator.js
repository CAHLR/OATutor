const fs = require('fs');
const path = require('path');
const process = require('process');

process.chdir('../ProblemPool');

const isDirectory = source => fs.lstatSync(source).isDirectory();
const getDirectories = source =>
  fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory);

const getFiles = source =>
  fs.readdirSync(source).map(name => path.join(source, name)).filter((source) => !isDirectory(source));

const REMOVE_FILES = false;
const OVERWRITE = true;

function writeIndexFile(path, data) {
  fs.writeFile(path, data, { flag: (OVERWRITE ? 'w' : 'wx') }, function (err) {
    if (err) {
      console.log("Already exists or write error");
    } else {
      console.log("Saved!");
    }
    if (REMOVE_FILES) {
      fs.unlinkSync(path);
      console.log("Removed files!")
    }
  });
}

function problemIndex(steps) {
  if (steps.length === 0) {
    return;
  }
  result = ""
  for (var i = 0; i < steps.length; i++) {
    result += `import {step as step${i + 1}} from './steps/${steps[i]}/${steps[i]}.js';\n`
  }
  result += "\n"
  result += "var steps = ["
  for (var i = 0; i < steps.length - 1; i++) {
    result += `step${i + 1}, `
  }
  result += `step${steps.length}];`
  result += "\n\nexport default steps;"
  return result;
}

function hintIndex(step, pathways) {
  if (pathways.length === 0) {
    return;
  }
  result = ""
  for (var i = 0; i < pathways.length; i++) {
    result += `import {hints as ${pathways[i]}} from './tutoring/${step}${pathways[i][0].toUpperCase() + pathways[i].substring(1)}.js';\n`
  }
  result += "\n"
  result += "var hints = {"
  for (var i = 0; i < pathways.length - 1; i++) {
    result += `${pathways[i]}: ${pathways[i]}, `
  }
  result += `${pathways[i]}: ${pathways[i]}};`
  result += "\n\nexport default hints;"
  return result;
}

function problemPoolIndex(problems) {
  if (problems.length === 0) {
    return;
  }
  result = ""
  for (var i = 0; i < problems.length; i++) {
    result += `import {problem as ${problems[i]}} from './${problems[i]}/${problems[i]}.js';\n`
  }
  result += "\n"
  result += "var problems = ["
  for (var i = 0; i < problems.length - 1; i++) {
    result += `${problems[i]}, `
  }
  result += `${problems[problems.length - 1]}];`
  result += "\n\nexport default problems;"
  return result;
}

// Already changed directory using process to ProblemPool
const root = "."
var problemDirectories = getDirectories(root);
var problems = problemDirectories.map(step => step.split(path.sep).pop());
var poolIndex = problemPoolIndex(problems);
writeIndexFile(`${root}/problemPool.js`, poolIndex);
problems.map(problem => {
  var stepDirectories = getDirectories(`${root}/${problem}/steps`);
  var steps = stepDirectories.map(step => step.split(path.sep).pop());
  var pIndex = problemIndex(steps);
  writeIndexFile(`${root}/${problem}/${problem}-index.js`, pIndex);
  steps.map(step => {
    var hintFiles = getFiles(`${root}/${problem}/steps/${step}/tutoring`);
    var hints = hintFiles.map(hint => hint.split(path.sep).pop().slice(step.length, -3));
    hints = hints.map(hint => hint[0].toLowerCase() + hint.substring(1));
    var hIndex = hintIndex(step, hints);
    writeIndexFile(`${root}/${problem}/steps/${step}/${step}-index.js`, hIndex);
  });
});

