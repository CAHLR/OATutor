import React from 'react';
import './App.css';
import { AppBar, Toolbar } from '@material-ui/core';
import Problem from "./ProblemLayout/Problem";
import { nextProblem } from "./ProblemLogic/problemIndex"
import Firebase from "./ProblemLogic/Firebase.js";
import { StickyContainer, Sticky } from 'react-sticky';
import { logData } from './config/config.js';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

class App extends React.Component {
  constructor() {
    super();
    this.firebase = null;
    if (!cookies.get("id")) {
      let d = new Date();
      const id = Math.floor(Math.random() * 2 ** 16);
      d.setTime(d.getTime() + (3 * 365 * 24 * 60 * 60 * 1000)); // 3 years in the future
      cookies.set("id", id, { path: "/", expires: d });
    }
    if (logData) {
      this.firebase = new Firebase(cookies.get("id"));
    }
    
  }

  render() {

    return (
      <StickyContainer>
        <div style={{ backgroundColor: "#F6F6F6", paddingBottom: 20 }}>
          <div className="sticky" style={{ zIndex: 1000 }} >
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
