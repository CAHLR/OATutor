import React from 'react';
import './App.css';
import Platform from './ProblemLogic/Platform.js';
import DebugPlatform from './ProblemLogic/DebugPlatform.js';
import Firebase from "./ProblemLogic/Firebase.js";

import * as localforage from "localforage";

import {
    Route,
    HashRouter as Router,
    Switch
} from "react-router-dom";
import Notfound from "./notfound.js";

import {
    ThemeContext,
    PROGRESS_STORAGE_KEY,
    SITE_VERSION,
    USER_ID_STORAGE_KEY,
    DO_FOCUS_TRACKING,
} from './config/config.js';
import { createTheme, responsiveFontSizes, ThemeProvider } from '@material-ui/core/styles';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import parseJwt from "./util/parseJWT";
import AssignmentNotLinked from "./pages/AssignmentNotLinked";
import AssignmentAlreadyLinked from "./pages/AssignmentAlreadyLinked";
import SessionExpired from "./pages/SessionExpired";
import { Posts } from "./pages/Posts/Posts";
import loadFirebaseEnvConfig from "./util/loadFirebaseEnvConfig";
import generateRandomInt from "./util/generateRandomInt";
import { cleanObjectKeys } from "./util/cleanObject";
import GlobalErrorBoundary from "./Components/_General/GlobalErrorBoundary";
import { IS_STAGING_OR_DEVELOPMENT } from "./util/getBuildType";
import TabFocusTrackerWrapper from "./Components/_General/TabFocusTrackerWrapper";

// ### BEGIN CUSTOMIZABLE IMPORTS ###
import config from './config/firebaseConfig.js';
import skillModel from './config/skillModel.json';
import bktParams1 from './config/bktParams/bktParams1.json';
import bktParams2 from './config/bktParams/bktParams2.json';
import { heuristic as lowestHeuristic } from './config/problemSelectHeuristics/problemSelectHeuristic1.js';
import { heuristic as highestHeuristic } from './config/problemSelectHeuristics/problemSelectHeuristic2.js';
// ### END CUSTOMIZABLE IMPORTS ###

loadFirebaseEnvConfig(config)

let theme = createTheme();
theme = responsiveFontSizes(theme);

const queryParamToContext = {
    "token": "jwt",
    "lis_person_name_full": "studentName",
    "to": "alreadyLinkedLesson",
    "use_expanded_view": "use_expanded_view"
}

const queryParamsToKeep = ["use_expanded_view", "to"]

const treatmentMapping = {
    bktParams: {
        0: cleanObjectKeys(bktParams1),
        1: cleanObjectKeys(bktParams2)
    },
    heuristic: {
        0: lowestHeuristic,
        1: highestHeuristic
    },
    hintPathway: {
        0: "DefaultPathway",
        1: "DefaultPathway"
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        // UserID creation/loading
        let userId = localStorage.getItem(USER_ID_STORAGE_KEY)
        if (!userId) {
            userId = generateRandomInt().toString();
            localStorage.setItem(USER_ID_STORAGE_KEY, userId);
        }
        this.userID = userId;
        this.bktParams = this.getTreatmentObject(treatmentMapping.bktParams);

        this.originalBktParams = JSON.parse(JSON.stringify(this.getTreatmentObject(treatmentMapping.bktParams)))

        this.state = {
            additionalContext: {},
        }

        if (IS_STAGING_OR_DEVELOPMENT) {
            document["oats-meta-site-hash"] = process.env.REACT_APP_COMMIT_HASH
        }

        const onLocationChange = () => {
            const additionalContext = {}
            const search = window.location.search
                || window.location.hash.substr(window.location.hash.indexOf("?") + 1)
            const sp = new URLSearchParams(search)

            Object.keys(queryParamToContext).forEach(qp => {
                const ctxKey = queryParamToContext[qp]
                const ctxValue = sp.get(qp);
                if (ctxValue !== null) {
                    additionalContext[ctxKey] = ctxValue
                }
            })

            if (additionalContext?.jwt) {
                const user = parseJwt(additionalContext.jwt)
                additionalContext['user'] = user
                additionalContext['studentName'] = user.full_name
            }

            // Firebase creation
            this.firebase = new Firebase(this.userID, config, this.getTreatment(), SITE_VERSION, additionalContext.user);

            let targetLocation = window.location.href.split("?")[0]

            const keptQueryParamsObj = Object
                .fromEntries(Object.entries(additionalContext).filter(([key, _]) => queryParamsToKeep.includes(key)))
            const keptQueryParams = new URLSearchParams(keptQueryParamsObj)

            if (Object.keys(keptQueryParamsObj).length > 0) {
                targetLocation += `?${keptQueryParams.toString()}`
            }

            if (this.mounted) {
                this.setState((prev) => ({
                    additionalContext: {
                        ...prev.additionalContext,
                        ...additionalContext
                    }
                }))
                window.history.replaceState({}, document.title, targetLocation)
            } else if (this.mounted === undefined) {
                this.state = {
                    ...this.state,
                    additionalContext
                }
                window.history.replaceState({}, document.title, targetLocation)
            }
        }
        window.addEventListener('popstate', onLocationChange);
        onLocationChange()

        this.saveProgress = this.saveProgress.bind(this)
    }

    componentDidMount() {
        this.mounted = true
    }

    componentWillUnmount() {
        this.mounted = false
    }

    getTreatment = () => {
        return this.userID % 2;
    }

    getTreatmentObject = (targetObject) => {
        return targetObject[this.getTreatment()]
    }

    removeProgress = async () => {
        await localforage.removeItem(PROGRESS_STORAGE_KEY)
        this.bktParams = this.getTreatmentObject(treatmentMapping.bktParams)
        window.location.reload();
    }

    saveProgress = () => {
        console.debug("saving progress");

        const progressedBktParams = Object.fromEntries(
            // only add to db if it is not the same as originally provided bkt params
            Object.entries(this.bktParams || {}).filter(([key, val]) => {
                // console.debug(this.originalBktParams[key]?.probMastery, 'vs.', val.probMastery)
                return this.originalBktParams[key]?.probMastery !== val.probMastery
            })
        )
        localforage.setItem(PROGRESS_STORAGE_KEY, progressedBktParams, (err) => {
            if (err) {
                console.debug('save progress error: ', err)
                toast.warn('Unable to save mastery progress :(', {
                    toastId: 'unable_to_save_progress'
                })
            } else {
                console.debug('saved progress successfully')
            }
        }).then(_ => {
        });
    }

    loadBktProgress = async () => {
        const progress = await localforage.getItem(PROGRESS_STORAGE_KEY).catch(_e => {
            console.debug('error with getting previous progress', _e)
        });
        if (progress == null || typeof progress !== 'object' || Object.keys(progress).length === 0) {
            console.debug('resetting progress... obtained progress was invalid: ', progress)
            this.bktParams = this.getTreatmentObject(treatmentMapping.bktParams)
        } else {
            console.debug('restoring progress from before (raw, uncleaned): ', progress)
            Object.assign(this.bktParams, cleanObjectKeys(progress))
        }
    }

    render() {
        return (
            <ThemeProvider theme={theme}>
                <ThemeContext.Provider value={{
                    userID: this.userID,
                    firebase: this.firebase,
                    getTreatment: this.getTreatment,
                    bktParams: this.bktParams,
                    heuristic: this.getTreatmentObject(treatmentMapping.heuristic),
                    hintPathway: this.getTreatmentObject(treatmentMapping.hintPathway),
                    skillModel,
                    credentials: config,
                    debug: false,
                    studentName: '',
                    alreadyLinkedLesson: "",
                    jwt: '',
                    user: {},
                    problemID: 'n/a',
                    problemIDs: null,
                    ...this.state.additionalContext
                }}>
                    <GlobalErrorBoundary>
                        <Router>
                            <div className="Router">
                                <Switch>
                                    <Route exact path="/" render={(props) => (
                                        <Platform key={Date.now()} saveProgress={() => this.saveProgress()}
                                            loadBktProgress={this.loadBktProgress}
                                            removeProgress={this.removeProgress} {...props} />
                                    )}/>
                                    <Route path="/courses/:courseNum" render={(props) => (
                                        <Platform key={Date.now()} saveProgress={() => this.saveProgress()}
                                            loadBktProgress={this.loadBktProgress}
                                            removeProgress={this.removeProgress}
                                            courseNum={props.match.params.courseNum} {...props} />
                                    )}/>
                                    <Route path="/lessons/:lessonID" render={(props) => (
                                        <Platform key={Date.now()} saveProgress={() => this.saveProgress()}
                                            loadBktProgress={this.loadBktProgress}
                                            removeProgress={this.removeProgress}
                                            lessonID={props.match.params.lessonID} {...props} />
                                    )}/>
                                    <Route path="/debug/:problemID" render={(props) => (
                                        <DebugPlatform key={Date.now()} saveProgress={() => this.saveProgress()}
                                            loadBktProgress={this.loadBktProgress}
                                            removeProgress={this.removeProgress}
                                            problemID={props.match.params.problemID} {...props} />
                                    )}/>
                                    <Route path="/posts" render={(props) => (
                                        <Posts key={Date.now()} {...props} />
                                    )}/>
                                    <Route exact path="/assignment-not-linked" render={(props) => (
                                        <AssignmentNotLinked key={Date.now()} {...props} />
                                    )}/>
                                    <Route exact path="/assignment-already-linked" render={(props) => (
                                        <AssignmentAlreadyLinked key={Date.now()} {...props} />
                                    )}/>
                                    <Route exact path="/session-expired" render={(props) => (
                                        <SessionExpired key={Date.now()} {...props} />
                                    )}/>
                                    <Route component={Notfound}/>
                                </Switch>
                            </div>
                            {
                                DO_FOCUS_TRACKING && <TabFocusTrackerWrapper/>
                            }
                        </Router>
                        <ToastContainer
                            autoClose={false}
                            closeOnClick={false}
                        />
                    </GlobalErrorBoundary>
                </ThemeContext.Provider>
            </ThemeProvider>
        );
    }
}

export default App;
