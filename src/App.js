import React from 'react';
import logo from './logo.svg';
import './App.css';
import { AppBar, Toolbar } from '@material-ui/core';
import Problem from "./ProblemLayout/Problem";
import { problemIndex, nextProblem } from "./ProblemPool/problemIndex"

function App() {
  const problems = problemIndex.problems;
  console.log(problems)
  return (

      <div style={{backgroundColor: "#F6F6F6", paddingBottom: 20}}>
      <AppBar position="static">
          <Toolbar>Open ITS</Toolbar>
      </AppBar>
      <Problem problem={nextProblem()}/>
      </div>
  );
}

export default App;
