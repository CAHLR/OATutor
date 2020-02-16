import React from 'react';
import './App.css';
import { AppBar, Toolbar } from '@material-ui/core';
import Problem from "./ProblemLayout/Problem";
import { nextProblem } from "./ProblemLogic/problemIndex"
import Firebase from "./ProblemLogic/Firebase.js";

function App() {
  let firebase = new Firebase();
  return (
    <div style={{ backgroundColor: "#F6F6F6", paddingBottom: 20 }}>
      <AppBar position="static">
        <Toolbar>Open ITS</Toolbar>
      </AppBar>
      <Problem problem={nextProblem()} firebase={firebase} />
    </div>
  );
}

export default App;
