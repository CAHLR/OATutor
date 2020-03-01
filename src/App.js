import React from 'react';
import './App.css';
import { AppBar, Toolbar } from '@material-ui/core';
import Problem from "./ProblemLayout/Problem";
import { nextProblem } from "./ProblemLogic/problemIndex"
import Firebase from "./ProblemLogic/Firebase.js";

var logData = false;

function App() {
  let firebase;
  if (logData) {
     firebase = new Firebase();
  }
  return (
    <div style={{ backgroundColor: "#F6F6F6", paddingBottom: 20 }}>
      <AppBar position="static">
        <Toolbar>Open ITS</Toolbar>
      </AppBar>
      <Problem problem={nextProblem()} firebase={firebase} logData={logData}/>
    </div>
  );
}

export default App;
