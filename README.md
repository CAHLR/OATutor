# OATutor

OATutor is an Open-source Adaptive Tutoring System (OAT) based on Intelligent Tutoring System principles. It uses Bayesian Knowledge Tracing for skill mastery estimation and is implemented entirely in React JS with optional logging using [Firebase](https://firebase.google.com/). 
The system can be deployed to git-pages without the use of any backend. For LMS integration, 
a middleware backend is required by Learning Tools Interoperability (LTI). Our [hosted backend server](https://cahlr.github.io/OATutor/#/posts/set-up-canvas-integration) can be used or the middleware can be launched independently. OATutor is Section 508 accessibility [compliant](https://cahlr.github.io/OATutor/static/documents/OATutor_Sec508_WCAG.pdf).

> [Quick clone and deploy notebook example](https://colab.research.google.com/drive/15rzSOLT8EtfJM_Ts1ZQZYuT-FvJp2SW1?usp=sharing)
>
> [Quick content authoring notebook example](https://colab.research.google.com/drive/11X3eW9cDnRcvROaCWglPM5VH0NRAXFKp?usp=sharing)
>
> [Sign-up for our mailinglist](https://forms.gle/9SedjDENmfhBM13v8)
>
> [Introduction to OATutor press article](https://bse.berkeley.edu/leveraging-ai-improve-adaptive-tutoring-systems)

## Paper
To credit this system, please cite our CHI'23 paper:

Zachary A. Pardos, Matthew Tang, Ioannis Anastasopoulos, Shreya K. Sheel, and Ethan Zhang. 2023. OATutor: An Open-source Adaptive Tutoring System and Curated Content Library for Learning Sciences Research. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems (CHI '23)*. Association for Computing Machinery, New York, NY, USA, Article 416, 1–17. [https://doi.org/10.1145/3544548.3581574](https://doi.org/10.1145/3544548.3581574)
```
@inproceedings{pardos2023oat,
  title={OATutor: An Open-source Adaptive Tutoring System and Curated Content Library for Learning Sciences Research},
  author={Pardos, Z.A., Tang, M., Anastasopoulos, I., Sheel, S.K., Zhang, E},
  booktitle={Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems},
  pages={1--17},
  organization={Association for Computing Machinery},
  doi={https://doi.org/10.1145/3544548.3581574},
  year={2023}
}
```

Our new pre-print, reporting preliminary finding on learning gains and ChatGPT-based hint evaluation: [https://arxiv.org/abs/2302.06871](https://arxiv.org/abs/2302.06871)

### Creative Commons Attribution

The content submodule repository includes three creative commons (CC BY) textbooks worth of algebra problems with tutoring supports in 
the form of hints and scaffolds, authored and edited by the OATutor project, also released under CC BY 4.0.

1. A subset of problems are derivatives of _OpenStax: Elementary Algebra_ by OpenStax, used under CC
   BY 4.0
2. A subset of problems are derivatives of _OpenStax: Intermediate Algebra_ by OpenStax, used under CC
   BY 4.0
3. A subset of problems are derivatives of _Openstax: College Algebra_ by OpenStax, used under CC
   BY 4.0

## Requirements

The installation assumes that you already have Git, Node.js, and npm installed.

## Installation

```sh
git clone --recurse-submodules https://github.com/CAHLR/OATutor.git
cd OATutor
```

### Dependencies
```sh
npm install
```

> You may use an alternative package manager such as [yarn](https://yarnpkg.com/) or
> [pnpm](https://pnpm.io/).

### Local Development Server

```sh
npm run start
```

### Building & Deployment

```sh
npm run build
npx serve -s build
```
> The build folder now contains all of the static assets necessary to make a complete deployment on
> a static site hosting provider.

### \[Optional\] Firebase Setup

OATutor can use Firebase to persistently store log data.

1. Navigate to the Firebase [website](https://console.firebase.google.com/)
2. Add new project. Configure it as you wish (the options are not important for setup)
3. Click on Database and then create database. Start in test mode, leave the cloud location as is
4. Click on Project settings --> general. Copy SDK Setup & Configuration --> Config
5. Put configuration in `src/config/firebaseConfig.js`

## Features:

1. Scaffolding/hint system - modularize the type of help
2. Adaptive item selection - Pick items to master weakest skills (isolate skills to master individually)
3. Centralized skill model - `src/content-sources/*/skillModel.json`
4. Data logging/collection - Based off of the Cognitive Tutor KDD dataset.
5. User login/registration - JSON Web Tokens

## Technologies Used

* Frontend: ReactJS
    * Theme: Material UI
    * Database: localForage (localStorage, WebSQL, IndexedDB)
    * Deployment: Github Actions to Github Pages
    * \[Optional\] Logging: Firebase (Cloud Firestore)
* Middleware: ExpressJS
    * Database: Level-DB
* Offline Computation/Iteration:
    * Python (dAFM Machine Learning algorithm)

## Project Structure:

Code for this project is located in the `src` directory.

### . (src)

- `App.css`: Top level style sheet, contains colors for headers/logo
- `App.js`: Top level script, creates firebase object. Sets up the application context.
- `index.js`: Renders `App.js`

### ./models/BKT

- `BKT-brain.js`: Contains `update` function that implements the standard BKT update algorithm.
- `problem-select-heuristics/*.js`: These files contain a configurable heuristic for adaptive
  problem selection. The default heuristic iterates across the problems and chooses the one with the lowest average
  probability of mastery across all of its knowledge components, but this can be changed to any heuristic depending
  on the problem information and the previously completed problems.

### ./components

- `Firebase.js`: Class with methods to read/write to Firebase (Cloud Firestore).

### ./components/problem-layout

- `HintSystem.js`: Expandable panel component to display all the hints.

- `HintTextbox.js`: Textbox for scaffold types of hints with answers.

- `Problem.js`: The "problem" component created in App.js. The component is initailized with a "problem" object as one
  of its props. It then creates a series of "ProblemCards" in `const parts` (currently keys for ProblemCard components
  are random values, should be UUIDs in the future).

  The `answerMade` function is passed to each ProblemCard component and is called whenever an answer is submitted to a
  ProblemCard. This enables the Problem component to update the knowledge component variables after each answer and
  transition to the next problem after all answers are correct.

- `ProblemCard.js`: This component displays an individual card, updates the input text field to display the result of an
  answer attempt, and calls the `Problem.js`  `answerMade` function when the submit button is pressed.

These two files heavily rely on Material-UI syntax (eg. all the `useStyles` and `classes` references). Check their
website for more info on this syntax.

- `problemCardStyles.js`: This file contains all the styles for `ProblemCard.js`

### ./platform-logic

- `checkAnswer.js`: Function to check answers. 3 different types of answers are supported: Algebraic, String, Numeric.
  Algebraic will simplify numeric expressions, numeric checks numeric equivalence, string requires answers to exactly
  match.

- `Platform.js`: Creates top "AppBar" and presents the first "problem" (everything under the app bar is part of the
  problem component). Also imports all of the problem files and stores them in `const problemIndex`. The
  function `nextProblem` is used to determine the next problem to be displayed.

- `Firebase.js`: Class with methods to read/write to Firebase (Cloud Firestore).

- `renderText.js`: Method called to render text. Fills in dynamic text generation.

### ./content-sources [Configurable]

- Each sub-folder can be considered its own isolated content source.
  -  `oatutor` contains OATutor-curated content but can be removed if the content is not being used.
- See the [Content Source](#oatutor-content-pool) section for more details.

#### Markdown Support

- All `\` must be escaped as `\\` because values are strings
- Wrap Latex in `$` for inline LaTeX
- Newlines can be created with `\n`, escaped as `\\n`

### ./config [Configurable]

- `config.js`: Central place where options can be configured. Also includes function to get the treatment id given a
  userID, imports all appropriate treatments (Ex. BKTParam, HintPathway, Adaptive Problem selection heuristic)

- `firebaseConfig.js`: File containing firebase set up configuration.

### ./tools [Optional]

Data parsing and spreadsheet populating tools are stored in `src/tools`. If you would
like to use any of the tools in this directory, the following steps must be taken to
ensure Firebase access.

1. Navigate to the Firebase [website](https://console.firebase.google.com/)
2. Click on the project made in Firebase Setup
3. Click on Project settings --> service accounts. Generate a new `Node.js` private key.
4. Put that private key in `src/tools/service-account-credentials.json`
5. `cd src/tools`
6. `npm install`

#### populateGoogleSheets.js

This tool allows you to sync the feedback received from your website to a Google Spreadsheet
of your choosing.

1. Navigate to the Firebase [website](https://console.firebase.google.com/)
2. Click on the project made in Firebase Setup
3. Click on Project settings --> service accounts
4. Create another service account and save its private key to `src/tools/sheets-service-account.json`
5. Copy the email address for the service account
6. Share the target spreadsheet with that email address and give them editor access
7. Create `.env.local` in `src/tools` and add this line `SPREADSHEET_ID=YOUR_SPREADSHEET_ID_HERE`
8. If your school runs on a quarter system, you may change the first line in
   `common/global-config.js` to `QUARTER`

From the `src/tools` directory, `node populateGoogleSheets.js`

#### firebaseExportCSV.mjs

This tool requires no additional set up, and allows you to download a CSV of the Firebase
collections.

### ./util

Contains common helper methods for the frontend React app.

## Listeners

### Mouse Logging

* Size of screen is the size of the scrollable browser canvas
* Wrap `<Platform />` with the following in `App.js`

```javascript
<ReactCursorPosition onPositionChanged={(data) => {
    if (DO_LOG_MOUSE_DATA) {
        this.firebase.mouseLog(data);
    }
}}>
    <Platform props_here/>
    <ReactCursorPosition/>
    }}>

```

### Focus Logging

* Records the times at which the user enters/leaves the tab
* Uses efficient Firestore storage by partitioning data into collections
* Turn off by editing config.js setting
```javascript
DO_FOCUS_TRACKING = false;
```

### Adding Listeners

1. Install the React component for the listener.
2. Wrap the Platform component with the listener. The listener must take a prop that is a function to log data that it
   receives.
3. In `/ProblemLogic/Firebase.js` add a new function to log the new type of data. Create a new collection for this
   listener logs.
4. Configure buffer size and granularity of logging

## Content Sources <a id='oatutor-content-pool'></a>

- OATutor can support multiple content sources simultaneously, compartmentalizing courses, lessons, and problems of
  different topics
- Currently, the `oatutor` content source is included in this repository as a [git submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
  to enable separate versioning
- However, content sources can be copied in as entire folders as well and committed to this repository

### Content Source Directory Structure
#### ./content-pool
- Each _problem_ is contained in its own folder.
- Problems can contain _steps_ which are contained in their own sub-folder.
- Steps can contain _hints_ which are stored as _pathways_ in the `tutoring` sub-folder.
- All problems are pre-processed before being ingested by the frontend platform. 
  All problems are accumulated in the `generated/processed-content-pool/[source_name].json` file prior to each run or build.

#### ./bkt-params
- `bktParams.js`: Contains the mastery, transit, slip, and guess probabilities for each skill. Used by the BKT model.

#### Meta / Tagging files
- `skillModel.json`: This file contains all the problem to skill mappings. The format is as follows:
```json5
{
    problemID1a: ['skill1', 'skill2'],
    problemID1b: ['skill2', 'skill3'],
    // ...
}
```
- `coursePlans.json`: This file contains all of the _courses_ relating to this content source. Each course specified in
  this file is associated with multiple _lessons_. See the [creating lesson plans](#creating-lesson-plans) section for
  more details.

### Adding a problem to the Content Pool

1. Create a folder in `./content-pool` for that problem (Ex. `circle1`)
2. Create a metadata json file for that problem id (Ex. `circle1.json`)
3. Create a folder called `figures` if the problem has image figures
4. Create a sub-folder for each problem step (Ex. `circle1a`, `circle1b`)
5. In each sub-folder, create a json file for that problem step (Ex. `circle1a.json`)
   1. Ensure that the step name matches the folder name
6. Create a sub-folder within the step's sub-folder called `tutoring`
7. Place each hint pathway within the folder (Ex. `circle1aDefaultPathway.json`)
8. In `./skillModel.json`, tag each problem with the appropriate skills
9. If the skill does not already exist in `bktParams` and you are using the BKT model, add its BKT parameters in the 
   appropriate `bkt-params/bktParams.json` files

### Types of problems

* `TextBox` : Box for student to enter answer. 3 different types of answers are supported: Algebraic, String, Numeric.
  Algebraic will simplify numeric expressions, numeric checks numeric equivalence, string requires answers to exactly
  match.
* `MultipleChoice`: List choices as `choices: ["Choice A", "Choice B"]`, must have `answerType: "string"`

### Example Directory Structure

```
content-sources/
└── oatutor [submodule]/
    ├── bkt-params/
    │   ├── bktParams1.json
    │   └── bktParams2.json
    ├── content-pool/
    │   ├── circle1/
    │   │   ├── circle1.json
    │   │   └── steps/
    │   │       ├── circle1a/
    │   │       │   ├── circle1a.json
    │   │       │   └── tutoring/
    │   │       │       └── circle1aDefaultPathway.json
    │   │       └── circle1b/
    │   │           ├── circble1b.json
    │   │           └── tutoring/
    │   │               └── circle1bDefaultPathway.json
    │   └── slope1/
    │       ├── slope1.json
    │       └── ...
    ├── coursePlans.json
    └── skillModel.json
```

### Example Problem File

```json5
{
    "id": "circle1",
    "title": "Buying a Big Rug",
    "body": "Bob wants to surprise Alice by buying a new rug for their living room. Their living room is 28 feet wide and 20 feet long. To further surprise Alice, Bob wants to buy the biggest circular rug that will fit.",
    "variabilization": {},
    "oer": "https://example.com",
    "lesson": "1.1 Circle Radius",
    "courseName": "Geometry"
}
```

### Example Step File

```json5
{
    "id": "circle1a",
    "stepAnswer": [
        "10"
    ],
    "problemType": "TextBox",
    "stepTitle": "1. Maximum Radius",
    "stepBody": "What is the maximum radius of a circular rug that will fit in the room?",
    "answerType": "numeric",
    "variabilization": {}
}
```

### Example Hint Pathway File

```json5
[
    {
        "id": "circle1a-h1",
        "title": "Size of the room",
        "text": "Consider the shape of the room and the limitations this has on the radius of the rug.",
        "type": "hint",
        "dependencies": [],
        "variabilization": {}
    },
    {
        "id": "circle1a-h2",
        "title": "Constricting dimension",
        "text": "The length (20ft) creates limitations on the size of the circle. What is the maximum diameter that the circle can be?",
        "hintAnswer": ["20"],
        "problemType": "TextBox",
        "answerType": "numeric",
        "type": "scaffold",
        "dependencies": [0],
        "variabilization": {}
    },
    {
        "id": "circle1a-h3",
        "title": "Solution",
        "text": "Recall that the radius is half the diameter, so $r = \\frac{d}{2} = 10$",
        "type": "solution",
        "dependencies": [1],
        "variabilization": {}
    }
]
```

### Using OATutor custom markdown parser for images and LaTeX

```json5
{
    "id": "pythag1", //Substeps will be in the form problem.id + 'a' and so on
    "title": "Car Forces",
    "body": "A %CAR% experiences three horizontal forces of -3.10N, 1.70N and -4.00N. It also experiences three vertical forces of -4.30N, 0.20N and 4.20N. \\n Round all answers to the hundredths place. \\n##triangle.png## ",
    "variabilization": {}
}
```

### Creating Lesson Plans <a id="creating-lesson-plans"><a/>

* Create a lesson plan by making a new item in `[content_source]/coursePlans.json`
* Each lesson plan has learning objectives which you can also list the target mastery level
* Lesson plans can have multiple learning objectives (for cumulative review)
* Users select a lesson upon visiting the site

```json5
{
    id: "lesson1",
    name: "Lesson 1",
    topics: "Pythagorean Theorem",
    allowRecycle: true,
    learningObjectives:
    {
        pythagorean: 0.95
    }
}
```

## Research

### AB testing
OATutor was designed with the research case in mind and thus supports AB testing for many features. The benefit of the
open source nature of the platform allows researchers to insert AB testing logic into any part of the platform they
would like. To show that this is possible, we have included several examples of how one could use AB testing. 

AB testing is conducted by randomly assigning users into one of two groups. The treatment split is 50/50 by default,
but it can be easily changed to a different split percentage or more than two splits. The userID is recorded in all data
logs to infer the treatment.

```js
// src/App.js
this.userID = generateRandomInt().toString();
getTreatment = () => {
    return this.userID % 2;
}

getTreatmentObject = (targetObject) => {
    return targetObject[this.getTreatment()]
}
```

#### Problem Selection Heuristics
One example is to include different heuristics for problem selection. One heuristic is to choose problems with a knowledge
component that is lowest (meaning the student is weakest in this subject) to round out the student's knowledge. Another
heuristic is to choose problems with a knowledge component that is highest (meaning the student is strongest in this
subject) to fully master a skill before moving on to another. New heuristic files can be added to the appropriate folder (see
below code snippet) and imported accordingly to be used.

```js
// src/App.js
import { heuristic as defaultHeuristic } from "./models/BKT/problem-select-heuristics/defaultHeuristic.js";
import { heuristic as experimentalHeuristic } from "./models/BKT/problem-select-heuristics/experimentalHeuristic.js";

...
const treatmentMapping = {
    heuristic: {
        0: defaultHeuristic,
        1: experimentalHeuristic
    },
}
```

#### BKT Parameters
Different BKT parameters can also be used in AB testing. New bktParam files can be added to the appropriate folder (see
below code snippet) and imported accordingly to be used.

```js
// src/App.js
import defaultBKTParams from "./content-sources/oatutor/bkt-params/defaultBKTParams.json";
import experimentalBKTParams from "./content-sources/oatutor/bkt-params/experimentalBKTParams.json";

...
const treatmentMapping = {
    bktParams: {
        0: cleanObjectKeys(defaultBKTParams),
        1: cleanObjectKeys(experimentalBKTParams)
    },
}
```

#### Hint Pathways
Most content in the OATutor-Content repository currently only contains one hint pathway (the `defaultPathway`), but 
additional hint pathways can easily be added. AB testing can be done with multiple hint pathways for efficacy tests. 
New hint pathway files can be added to the tutoring folder of within a step.

```js
// src/App.js
const treatmentMapping = {
    hintPathway: {
        0: "DefaultPathway",
        1: "YourNewPathwayHere"
    }
}
```

Example content directory with multiple hint pathways:
```
content-sources/
└── oatutor [submodule]/
    ├── content-pool/
    │   ├── circle1/
    │   │   ├── circle1.json
    │   │   └── steps/
    │   │       ├── circle1a/
    │   │       │   ├── circle1a.json
    │   │       │   └── tutoring/
    │   │       │       ├── circle1aDefaultPathway.json
    │   │       │       └── circle1aYourNewPathwayHere.json  <--- Add your new pathway here
    │   │       └── circle1b/
    │   │           ├── circble1b.json
    │   │           └── tutoring/
    │   │               ├── circle1bDefaultPathway.json
    │   │               └── circle1bYourNewPathwayHere.json  <--- Add your new pathway here
    │   └── slope1/
    │       ├── slope1.json
    │       └── ...
    ├── ...
```

### Details of KC model Description (how it works/format)
Knowledge components (KCs) are assigned at the step level in the file skillModel.json. A KC is defined as a string that
contains corresponding BKT parameters (existing in bktParams.js file) including probMastery, probTransit, probSlip, and
probGuess. Each step can be assigned any number of KCs in an array format (['kc1', 'kc2', ... 'kcN']). skillModel.json
stores a mapping between step IDs and the KCs array as a JSON object.

bktParams.js contains a JSON object that maps KCs to their corresponding BKT parameters (probMastery, probTransit,
probSlip, and probGuess). These values are typically empirically determined and can be AB tested (see above).

What the format of a section looks like Problems are decomposed into steps. Problems do not contain an answer field (
problems without real steps are formatted as a problem with only one step). Steps can be one of 2 answer types: textbox
or multiple choice. Steps can contain help items which can be toggled to be shown by clicking a raised hand icon on each
step. There are two possible help items: hints which are purely textual and have no user input, or scaffolds which
contain user input (again, either textbox or multiple choice). Scaffolds can contain help items themselves, except this
is the deepest level of content (the scaffolds's scaffolds cannot contain any help items).

### BKT algorithm selecting problems

OATutor uses Bayesian Knowledge Tracing to determine model mastery based on an input. (If you need to describe how BKT
works, just copy the descriptions of the 4 model parameters used in BKT from wikipedia along with equations a thru d.
The implementation is exactly identical to wikpedia, nothing special here)

Problem selection is determined using a heuristic which is fully configurable and can be AB tested (see above). For the
purposes of this paper, let us assume we are using a heuristic that selects problems prioritizing the lowest mastery
first. Upon receiving user input, the standard BKT update equations will update the predicted user's mastery. Upon
completion of a problem, OATutor will iterate through all problems and compute each problem's mastery level(note:
mastery level is computed at the problem granularity not the step) for the user. This is done by multiplying all the
mastery priors for all KCs of that step (as labelled by the researcher in the KC model) and then multiplying all step
masteries together to get the problem mastery. The heuristic will be applied, which in this case is lowest mastery
first, so the problem with the lowest mastery is selected to give to the user. In the case that the first problem is
being chosen in the session, equation a from the BKT model is used and the default probMastery is considered the user's
mastery. Ties (of equal mastery) in the heuristic selection algorithm are broken by randomly choosing a problem.

### Supported Meta Tags
- **giveStuFeedback:** controls correctness feedback (i.e. whether a user inputted the correct answer or not)
- **giveStuHints:** controls whether hints should be displayed or not (i.e. controls the hint icon as well)
- **doMasteryUpdate:** controls whether OATutor should track student mastery
- **allowRecycle:** controls whether problems/steps can be repeated or not
- **showStuMastery:** controls whether matters should be displayed to the user in the upper right corner
- **unlockFirstHint:** controls whether the first hint should be auto-expanded when the user clicks the hint icon
- **allowDynamicHint:** controls whether a dynamically generated hint should be given to the user
- **giveStuBottomHint:** controls whether the suer should receive a bottom-out hint (last hint in the hint pathway that contains the answer)
- **giveHintOnIncorrect:** controls whether an incorrect response should automatically force the user into the hint pathway
- **keepMCOrder:** controls whether to preserve the order of MCQ choices in the spreadsheet
