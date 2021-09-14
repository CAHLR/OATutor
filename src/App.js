import React from 'react';
import './App.css';
import Cookies from 'universal-cookie';
import Platform from './ProblemLogic/Platform.js';
import DebugPlatform from './ProblemLogic/DebugPlatform.js';
import Firebase from "./ProblemLogic/Firebase.js";

import {
  Route,
  HashRouter as Router,
  Switch
} from "react-router-dom";
import Notfound from "./notfound.js";

// ### BEGIN CUSTOMIZABLE IMPORTS ###
import credentials from './config/credentials-secret.js';
import skillModel from './config/skillModel.js';
import { bktParams as bktParams1 } from './config/bktParams/bktParams1.js';
import { bktParams as bktParams2 } from './config/bktParams/bktParams2.js';
import { heuristic as lowestHeuristic } from './config/problemSelectHeuristics/problemSelectHeuristic1.js';
import { heuristic as highestHeuristic } from './config/problemSelectHeuristics/problemSelectHeuristic2.js';
// ### END CUSTOMIZABLE IMPORTS ###


import {
  ThemeContext,
  siteVersion,
  logData,
  cookieID,
  debug,
  useBottomOutHints,
  autoCommands,
  autoOperatorNames,
  middlewareURL,
  bkt2Index,
  index2Bkt
} from './config/config.js';
import { createTheme, responsiveFontSizes, ThemeProvider } from '@material-ui/core/styles';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

let theme = createTheme();
theme = responsiveFontSizes(theme);

const cookies = new Cookies();

class App extends React.Component {
  constructor() {
    super();
    // UserID creation/loading
    if (!cookies.get(cookieID)) {
      let d = new Date();
      d.setTime(d.getTime() + (3 * 365 * 24 * 60 * 60 * 1000)); // 3 years in the future
      const id = Math.floor(Math.random() * 2 ** 16);
      cookies.set(cookieID, id, { path: "/", expires: d });
    }
    this.userID = cookies.get(cookieID);
    this.bktParams = this.getTreatment() === 0 ? bktParams1 : bktParams2;
    this.originalBktParams = this.bktParams;

    // Firebase creation
    this.firebase = null;
    if (true) { //logData
      this.firebase = new Firebase(this.userID, credentials, this.getTreatment(), siteVersion);
    }

  }

  getTreatment = () => {
    return this.userID % 2;
  }

  removeProgress = () => {
    cookies.remove("openITS-progress");
    this.loadProgress();
  }

  saveProgress = () => {
    let d = new Date();
    d.setTime(d.getTime() + (3 * 365 * 24 * 60 * 60 * 1000)); // 3 years in the future
    var progress = {};
    for (const [skill, stats] of Object.entries(this.bktParams)) {
      if (typeof bkt2Index[skill] !== 'undefined') {
        progress[bkt2Index[skill]] = Math.round(stats.probMastery * 100) / 100;
      }
    }
    console.log("Saving");
    //console.log(progress);
    cookies.set("openITS-progress", progress, { path: "/", expires: d });
  }

  loadProgress = () => {
    var progress = cookies.get("openITS-progress");
    if (progress == null) {
      this.bktParams = this.originalBktParams;
      return;
    }
    var uncompressedProgress = {}
    for (const [idx, stats] of Object.entries(progress)) {
      uncompressedProgress[index2Bkt[idx]] = stats;
    }
    for (const [skill, stats] of Object.entries(this.bktParams)) {
      if (typeof uncompressedProgress[skill] !== 'undefined') {
        stats.probMastery = uncompressedProgress[skill];
      }
    }
    //console.log("Successfully loaded progress:");
    //console.log(this.bktParams);
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <ThemeContext.Provider value={{
          siteVersion: siteVersion,
          userID: this.userID,
          firebase: this.firebase,
          logData: logData,
          getTreatment: this.getTreatment,
          bktParams: this.bktParams,
          heuristic: this.getTreatment() === 0 ? lowestHeuristic : highestHeuristic,
          hintPathway: this.getTreatment() === 0 ? "defaultPathway" : "defaultPathway",
          skillModel: skillModel,
          credentials: credentials,
          debug: debug,
          useBottomOutHints: useBottomOutHints,
          autoCommands: autoCommands,
          autoOperatorNames: autoOperatorNames,
          studentName: '',
          middlewareURL: middlewareURL,
          problemIDs: null,
        }}>
          <Router>
            <div className="Router">
              <Switch>
                <Route exact path="/" render={(props) => (
                  <Platform key={Date.now()} saveProgress={this.saveProgress} loadProgress={this.loadProgress}
                            removeProgress={this.removeProgress} {...props} />
                )}/>
                <Route path="/courses/:courseNum" render={(props) => (
                  <Platform key={Date.now()} saveProgress={this.saveProgress} loadProgress={this.loadProgress}
                            removeProgress={this.removeProgress} courseNum={props.match.params.courseNum} {...props} />
                )}/>
                <Route path="/lessons/:lessonNum" render={(props) => (
                  <Platform key={Date.now()} saveProgress={this.saveProgress} loadProgress={this.loadProgress}
                            removeProgress={this.removeProgress} lessonNum={props.match.params.lessonNum} {...props} />
                )}/>
                <Route path="/debug/:problemID" render={(props) => (
                  <DebugPlatform key={Date.now()} saveProgress={this.saveProgress} loadProgress={this.loadProgress}
                                 removeProgress={this.removeProgress}
                                 problemID={props.match.params.problemID} {...props} />
                )}/>
                <Route component={Notfound}/>
              </Switch>
            </div>
          </Router>
          <ToastContainer />
        </ThemeContext.Provider>
      </ThemeProvider>
    );
  }
}

export default App;
