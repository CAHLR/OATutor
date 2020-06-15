import React from 'react';
import './App.css';
import Cookies from 'universal-cookie';
import ReactCursorPosition from 'react-cursor-position';
import Platform from './ProblemLogic/Platform.js';
import Firebase from "./ProblemLogic/Firebase.js";

// ### BEGIN CUSTOMIZABLE IMPORTS ###
import credentials from './config/credentials.js';
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
  logMouseData,
  cookieID,
  debug,
  useBottomOutHints
} from './config/config.js';

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
    if (logData) {
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
      progress[skill] = Math.round(stats.probMastery * 100) / 100;
    }
    console.log("Saving:");
    console.log(progress);
    cookies.set("openITS-progress", progress, { path: "/", expires: d });
  }

  loadProgress = () => {
    var progress = cookies.get("openITS-progress");
    if (progress == null) {
      this.bktParams = this.originalBktParams;
      return;
    }
    for (const [skill, stats] of Object.entries(this.bktParams)) {
      stats.probMastery = progress[skill];
    }
    console.log("Successfully loaded progress:");
    console.log(progress);
  }

  render() {
    return (
      <ThemeContext.Provider value={{
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
        useBottomOutHints: useBottomOutHints
      }}>
        <ReactCursorPosition onPositionChanged={(data) => {
          if (logMouseData) {
            this.firebase.mouseLog(data);
          }
        }}>
          <Platform saveProgress={this.saveProgress} loadProgress={this.loadProgress} removeProgress={this.removeProgress}/>
        </ReactCursorPosition>
      </ThemeContext.Provider>
    );
  }
}

export default App;
