# OpenITS

## Usage: 
```
git clone https://github.com/CAHLR/OpenITS
cd OpenITS
npm install
npm start
```
After compiling, the project will display in a new web browser tab at adress `localhost:3000`.

## Features in progress:
1) Scaffolding/hint system - modularize the type of help [In development]
2) Adaptive item selection - Pick items to master weakest skills (isolate skills to master individually) [Beta]
3) Centralized skill model - `src/ProblemPool/skillMode.js` [Production]
4) Data logging/collection - Based off of the Cognitive Tutor KDD dataset. [In development]
5) User login/registration - OAuth 2.0 Google

## Technologies Used
* Frontend: ReactJS
	* Theme: Material UI
    * Database: Firebase (Cloud Firestore)
	* Deployment: TBD
* Offline Computation/Iteration:
	* Python (dAFM Machine Learning algorithm)

# Project Structure: 
Code for this project is located in the `src` directory. 

## src

- `App.css`: Top level style sheet, contains colors for headers/logo
- `App.js`: Top level script, creates top "AppBar" and presents the first "problem" (everything under the app bar is part of the problem component)
- `index.js`: React metadata

## BKT

- `BKTBrains.js`: Contains `update` function that implements the standard BKT update algorithm. Also contains the individual knowledge components along with the initial values for the various BKT variables (all just examples to experiment with for now). 

## ProblemLayout

- `HintSystem.js`: Expandable panel component to display all the hints.

- `HintWrapper.js`: Expandable panel which says "View available hints". Contains `HintSystem`

- `HintTextbox.js`: Textbox for scaffold types of hints with answers.

- `Problem.js`: The "problem" component created in App.js. The component is initailized with a "problem" object as one of its props. It then creates a series of "ProblemCards" in `const parts` (currently keys for ProblemCard components are random values, should be UUIDs in the future). 

	The `answerMade` function is passed to each ProblemCard component and is called whenever an answer is submitted to a ProblemCard. This enables the Problem component to update the knowledge component variables after each answer and transition to the next problem after all answers are correct. 
	
- `ProblemCard.js`: This component displays an individual card, updates the input text field to display the result of an answer attempt, and calls the `Problem.js` 	`answerMade` function when the submit button is pressed.  

These two files heavily rely on Material-UI syntax (eg. all the `useStyles` and `classes` references). Check their website for more info on this syntax. 

- `problemCardStyles.js`: This file contains all the styles for `ProblemCard.js`


## ProblemLogic
- `problemIndex.js`: Imports all of the `problem[i]` files and stores them in `const problemIndex`. The function `nextProblem` is used to determine the next problem to be displayed. 

- `skillModel.js`: This file contains all the problem to skill mappings. The format is as follows:
```javascript
    problemID1a: []
    problemID1b: []
    ...
    problemID1z: []
    
    problemID9a: []
    ...
    problemID9z: []
    ...
```

- `heuristic.js`: This file the heuristic for adaptive problem selection. The default heuristic iterates across the problems and chooses the one with the lowest average probability of mastery across all of its knowledge components, but this can be changed to any heuristic. 

- `Firebase.js`: Class with methods to read/write to Firebase (Cloud Firestore).

- `credentials.js`: File which contains the credentials to authenticate to Firebase. (Note: this file is ignored in the gitignore by default to prevent API key leaks.)

## ProblemPool [Configurable]

- `[problemID].js`: Contains json data for problem i. The prompt attribute is displayed at the top of the problem, the parts attributes correspond to each ProblemCard that is displayed. Each part contains an id, title, question body, answer, and knowledge componenets used (need to correspond exactly to a component listed in `BKTBrains.js` and an id listed in `skillModel.js`. 
