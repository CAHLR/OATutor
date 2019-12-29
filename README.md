# OpenITS

**How to run**: Clone this project and use a terminal to navigate to the project directory. Run the command `npm start`. After compiling, the project will disply in a new web browser tab at adress `localhost:3000`.

**Technologies Used**: [React Native](https://facebook.github.io/react-native/) and [Material-UI](https://material-ui.com)

**Project Structure**: Code for this project is located in the `src` directory. 

`src`:

- `App.css`: Top level style sheet, contains colors for headers/logo
- `App.js`: Top level script, creates top "AppBar" and presents the first "problem" (everything under the app bar is part of the problem component)
- `index.js`: React metadata

`BKT`:

- `BKTBrains.js`: Contains `update` function that implements the standard BKT update algorithm. Also contains the individual knowledge components along with the initial values for the various BKT variables (all just examples to experiment with for now). 

`ProblemLayout`:

- `Problem.js`: The "problem" component created in App.js. The component is initailized with a "problem" object as one of its props. It then creates a series of "ProblemCards" in `const parts` (currently keys for ProblemCard components are random values, should be UUIDs in the future). 

	The `answerMade` function is passed to each ProblemCard component and is called whenever an answer is submitted to a ProblemCard. This enables the Problem component to update the knowledge component variables after each answer and transition to the next problem after all answers are correct. 
	
	
- `ProblemCard.js`: This component displays an individual card, updates the input text field to display the result of an answer attempt, and calls the `Problem.js` 	`answerMade` function when the submit button is pressed.  


These two files heavily rely on Material-UI syntax (eg. all the `useStyles` and `classes` references). Check their website for more info on this syntax. 

`ProblemPool`: 

- `problem[i].js`: Contains json data for problem i. The prompt attribute is displayed at the top of the problem, the parts attributes correspond to each ProblemCard that is displayed. Each part contains a title, question body, answer, and knowledge componenets used (need to correspond exactly to a component listed in `BKTBrains.js`. 
- `problemIndex.js`: Imports all of the `problem[i]` files and stores them in `const problemIndex`. The function `nextProblem` is used to determine the next problem to be displayed. 

	Currently `nextProblem` iterates across the problems and chooses the one with the lowest average probability of mastery across all of its knowledge components, but this should be able to be changed to any heuristic in the future. 

	

