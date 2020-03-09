import React from 'react';
import './App.css';
import { AppBar, Toolbar } from '@material-ui/core';
import Problem from "./ProblemLayout/Problem";
import { nextProblem } from "./ProblemLogic/problemIndex"
import Firebase from "./ProblemLogic/Firebase.js";
import { StickyContainer, Sticky } from 'react-sticky';

var logData = true;

class App extends React.Component {
  constructor() {
    super();
    this.firebase = null;
    if (logData) {
      this.firebase = new Firebase();
    }
  }

  render() {

    return (
      <StickyContainer>
        <div style={{ backgroundColor: "#F6F6F6", paddingBottom: 20 }}>
          <div class="sticky" style={{ zIndex: 1000 }} >
            <Sticky>{({ style }) => <div style={style}>
              <AppBar position="static" >
                <Toolbar>Open ITS</Toolbar>
              </AppBar></div>}
            </Sticky>
          </div>
          <Problem nextProblem={nextProblem} firebase={this.firebase} logData={logData} />
        </div>
      </StickyContainer>
    );
  }
}

export default App;
