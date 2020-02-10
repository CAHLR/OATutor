# OpenITS

## Usage: 
```
git clone https://github.com/CAHLR/OpenITS
cd OpenITS
npm install
npm start
```
After compiling, the project will disply in a new web browser tab at adress `localhost:3000`.

## Features in progress:
1) Scaffolding/hint system - modularize the type of help
2) Adaptive item selection - Pick items to master weakest skills (isolate skills to master individually)
3) Centralized skill model - `src/ProblemPool/skillMode.js`
4) Data logging/collection - Based off of the Cognitive Tutor KDD dataset.
5) User login/registration - OAuth 2.0 Google

### Technologies Used
* Frontend: ReactJS
	* Theme: Material UI
	* Deployment: TBD
* Offline Computation/Iteration:
	* Python (DAFM Machine Learning algorithm)

# Project Structure: 
Code for this project is located in the `src` directory. 

## src

- `App.css`: Top level style sheet, contains colors for headers/logo
- `App.js`: Top level script, creates top "AppBar" and presents the first "problem" (everything under the app bar is part of the problem component)
- `index.js`: React metadata

## BKT

- `BKTBrains.js`: Contains `update` function that implements the standard BKT update algorithm. Also contains the individual knowledge components along with the initial values for the various BKT variables (all just examples to experiment with for now). 

## ProblemLayout

- `Problem.js`: The "problem" component created in App.js. The component is initailized with a "problem" object as one of its props. It then creates a series of "ProblemCards" in `const parts` (currently keys for ProblemCard components are random values, should be UUIDs in the future). 

	The `answerMade` function is passed to each ProblemCard component and is called whenever an answer is submitted to a ProblemCard. This enables the Problem component to update the knowledge component variables after each answer and transition to the next problem after all answers are correct. 
	
- `ProblemCard.js`: This component displays an individual card, updates the input text field to display the result of an answer attempt, and calls the `Problem.js` 	`answerMade` function when the submit button is pressed.  

These two files heavily rely on Material-UI syntax (eg. all the `useStyles` and `classes` references). Check their website for more info on this syntax. 

- `problemIndex.js`: Imports all of the `problem[i]` files and stores them in `const problemIndex`. The function `nextProblem` is used to determine the next problem to be displayed. 

	Currently `nextProblem` iterates across the problems and chooses the one with the lowest average probability of mastery across all of its knowledge components, but this should be able to be changed to any heuristic in the future. 

- `skillModel.js`: This file contains all the problem to skill mappings. The format is as follows:
```javascript
    problemID: [
        [part 1 skills], 
        [part 2 skills], 
        ... 
        [part n skills]
    ]
    ...
```

## ProblemPool [Configurable]

- `problem[i].js`: Contains json data for problem i. The prompt attribute is displayed at the top of the problem, the parts attributes correspond to each ProblemCard that is displayed. Each part contains an id, title, question body, answer, and knowledge componenets used (need to correspond exactly to a component listed in `BKTBrains.js` and an id listed in `skillModel.js`. 
