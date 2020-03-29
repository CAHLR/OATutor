import React from 'react';
import './App.css';
import { AppBar, Toolbar } from '@material-ui/core';
import { StickyContainer, Sticky } from 'react-sticky';
import { nextProblem } from "./ProblemLogic/problemIndex.js"
import Problem from "./ProblemLayout/Problem";
import Firebase from "./ProblemLogic/Firebase.js";
import { logData } from './config/config.js';

class Platform extends React.Component {
  constructor(props) {
    super(props);
    this.firebase = null;
    if (logData) {
        this.firebase = new Firebase(props.userID);
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
          <Problem nextProblem={nextProblem} firebase={this.firebase} logData={logData} userID= {this.props.userID}/>
        </div>
      </StickyContainer>
    );
  }
}

export default Platform;
