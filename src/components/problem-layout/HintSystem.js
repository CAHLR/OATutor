import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import HintTextbox from "./HintTextbox.js";
import {
    renderText,
    chooseVariables,
} from "../../platform-logic/renderText.js";
import SubHintSystem from "./SubHintSystem.js";
import { ThemeContext } from "../../config/config";
import Spacer from "../Spacer";
import { stagingProp } from "../../util/addStagingProperty";
import ErrorBoundary from "../ErrorBoundary";
import withTranslation from "../../util/withTranslation";

import Button from "@material-ui/core/Button";
import AccordionActions from "@material-ui/core/AccordionActions";
import Grid from "@material-ui/core/Grid";

import Paper from "@material-ui/core/Paper";
import { styled } from "@material-ui/core/styles";

import axios from "axios";
import HintVoiceBoard from "./HintVoiceBoard.js";

// import io from "socket.io-client";
// const socket = io("http://localhost:3000");

const Item = styled(Paper)(({ theme, show_boarder }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.primary,
    border: show_boarder === "true" ? "1px solid black" : "none",
}));
// HELLO

class HintSystem extends React.Component {
    static contextType = ThemeContext;

    constructor(props) {
        super(props);

        var subHintsFinished = [];
        for (var i = 0; i < this.props.hints.length; i++) {
            subHintsFinished.push(
                new Array(
                    this.props.hints[i].subHints !== undefined
                        ? this.props.hints[i].subHints.length
                        : 0
                ).fill(0)
            );
            // set hint audios agentMode to be true/false
            this.props.hints[i].agentMode = true;
            // pre-cache all the audios when the hintsystem shows up
            if (!this.props.hints[i].audios) {
                console.log("Pre cache ongoing for", i);
                this.fetchAudioData(this.props.hints[i]);
            }
        }

        this.giveStuFeedback = props.giveStuFeedback;
        this.unlockFirstHint = props.unlockFirstHint;
        this.isIncorrect = props.isIncorrect;
        this.giveHintOnIncorrect = props.giveHintOnIncorrect;
        this.audioRef = null;

        this.state = {
            latestStep: 0,
            currentExpanded: this.unlockFirstHint || this.isIncorrect ? 0 : -1,
            hintAnswer: "",
            showSubHints: new Array(this.props.hints.length).fill(false),
            subHintsFinished: subHintsFinished,
            agentMode: this.props.agentMode, // showing text or agent whiteboard
            playing: false, // speaking or not
            hintIndex: 0, // index of hint to highlight
        };

        if (this.unlockFirstHint && this.props.hintStatus.length > 0) {
            this.props.unlockHint(0, this.props.hints[0].type);
        }

        if (
            this.giveHintOnIncorrect &&
            this.isIncorrect &&
            this.props.hintStatus.length > 0
        ) {
            this.props.unlockHint(0, this.props.hints[0].type);
        }
    }

    unlockHint = (event, expanded, i) => {
        // Verona calls here
        if (this.state.currentExpanded === i) {
            this.setState({ currentExpanded: -1 });
            console.log("closed");
            this.audioRef.pause();
            this.context.firebase.log(
                null,
                this.props.problemID,
                this.step,
                null,
                null,
                this.state.subHintsFinished,
                "Stopped playing by closing the hint",
                chooseVariables(this.props.stepVars, this.props.seed),
                this.props.lesson,
                this.props.courseName
            );
        } else {
            if (this.state.playing) {
                this.audioRef.pause();
                this.audioRef = null;
            }

            this.setState({ currentExpanded: i });
            if (expanded && i < this.props.hintStatus.length) {
                this.props.unlockHint(i, this.props.hints[i].type);
            }
            this.setState({ latestStep: i });

            this.setState({ agentMode: this.props.agentMode }, () => {
                if (this.state.agentMode) {
                    // console.log("print hint:", this.props.hints[i]);
                    this.playAgent(this.props.hints[i]);
                    this.context.firebase.log(
                        null,
                        this.props.problemID,
                        this.step,
                        null,
                        null,
                        this.state.subHintsFinished,
                        "Start playing",
                        chooseVariables(this.props.stepVars, this.props.seed),
                        this.props.lesson,
                        this.props.courseName
                    );
                }
            });
        }
    };

    isLocked = (hintNum) => {
        if (hintNum === 0) {
            return false;
        }
        var dependencies = this.props.hints[hintNum].dependencies;
        var isSatisfied = dependencies.every(
            (dependency) => this.props.hintStatus[dependency] === 1
        );
        return !isSatisfied;
    };

    toggleSubHints = (event, i) => {
        this.setState(
            (prevState) => {
                var displayHints = prevState.showSubHints;
                displayHints[i] = !displayHints[i];
                return {
                    showSubHints: displayHints,
                };
            },
            () => {
                this.props.answerMade(
                    this.index,
                    this?.step?.knowledgeComponents,
                    false
                );
            }
        );
    };

    unlockSubHint = (hintNum, i, isScaffold) => {
        this.setState(
            (prevState) => {
                prevState.subHintsFinished[i][hintNum] = !isScaffold ? 1 : 0.5;
                return { subHintsFinished: prevState.subHintsFinished };
            },
            () => {
                this.context.firebase.log(
                    null,
                    this.props.problemID,
                    this.step,
                    null,
                    null,
                    this.state.subHintsFinished,
                    "unlockSubHint",
                    chooseVariables(this.props.stepVars, this.props.seed),
                    this.props.lesson,
                    this.props.courseName
                );
            }
        );
    };

    submitSubHint = (parsed, hint, isCorrect, i, hintNum) => {
        if (isCorrect) {
            this.setState((prevState) => {
                prevState.subHintsFinished[i][hintNum] = 1;
                return { subHintsFinished: prevState.subHintsFinished };
            });
        }
        this.context.firebase.hintLog(
            parsed,
            this.props.problemID,
            this.step,
            hint,
            isCorrect,
            this.state.hintsFinished,
            chooseVariables(
                Object.assign({}, this.props.stepVars, hint.variabilization),
                this.props.seed
            ),
            this.props.lesson,
            this.props.courseName
        );
    };

    // Sharon added methods
    fetchAudioData = async (hint) => {
        // console.log("hint pacedSpeech: ", hint.pacedSpeech);
        try {
            const response = await axios.post(
                "https://627d80hft0.execute-api.us-east-1.amazonaws.com/v0",
                {
                    segments: hint.pacedSpeech, // Send the data in the body
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            hint.audios = JSON.parse(response.data.body).audios; // Store audio data
            // console.log("success:", response, hint.audios);
            console.log("hint audio pre-cached");
        } catch (error) {
            console.error("Error fetching audio:", error);
        }
    };

    playAudioForSegment = (segmentIndex, audioData) => {
        if (audioData.length > 0 && segmentIndex < audioData.length) {
            const audioBlob = new Blob(
                [
                    new Uint8Array(
                        atob(audioData[segmentIndex])
                            .split("")
                            .map((c) => c.charCodeAt(0))
                    ),
                ],
                { type: "audio/mp3" }
            );
            const audioUrl = window.URL.createObjectURL(audioBlob);
            this.audioRef = new Audio(audioUrl);

            this.audioRef.play();
            this.audioRef.onended = () => {
                if (segmentIndex + 1 < audioData.length) {
                    this.setState(
                        (prevState) => ({
                            hintIndex: prevState.hintIndex + 1,
                        }),
                        () => {
                            this.playAudioForSegment(
                                segmentIndex + 1,
                                audioData
                            ); // Play next segment
                        }
                    );
                } else {
                    this.setState({ playing: false }); // End of audio sequence
                    this.setState({ hintIndex: 0 });
                }
            };
        }
    };

    // Sagas added methods
    nextBoarder = (hint) => {
        // will run after agent speaks their hint[i]
        if (hint.math !== undefined) {
            if (hint.math.length - 1 > this.state.hintIndex) {
                this.setState((prevState) => ({
                    hintIndex: prevState.hintIndex + 1,
                }));
            } else {
                this.setState({ hintIndex: 0 });
            }
        }
    };

    renderWhiteboard = (hint) => {
        let hintLocation = null;
        this.props.hints.forEach((hint_i, i) => {
            if (hint === hint_i) {
                hintLocation = i;
            }
        });

        return this.state.agentMode ? (
            <HintVoiceBoard
                hint={hint}
                hintIndex={this.state.hintIndex}
                playAgent={this.playAgent}
                isExpanded={this.state.currentExpanded == hintLocation}
            ></HintVoiceBoard>
        ) : (
            hint.text
        ); // if in text mode
    };

    agentPraise = () => {
        const praises = [
            "Good job!",
            "Well done!",
            "Great work!",
            "Very nice!",
        ];
        const randomIndex = Math.floor(Math.random() * praises.length);
        const randomPraise = praises[randomIndex];
        console.log(randomPraise);
        // backendCommunication(randomPraise);
    };

    playAgent = (hint) => {
        if (this.state.agentMode) {
            if (hint.pacedSpeech && hint.audios) {
                this.setState({ hintIndex: 0 });
                this.setState(() => ({ playing: true }));
                this.playAudioForSegment(0, hint.audios);
            }
        }
    };

    reloadSpeech = (hint) => {
        // socket.emit("reload");
        this.setState(
            () => ({ hintIndex: 0 }),
            () => {
                this.playAgent(hint);
                this.context.firebase.log(
                    null,
                    this.props.problemID,
                    this.step,
                    null,
                    null,
                    this.state.subHintsFinished,
                    "Restart playing",
                    chooseVariables(this.props.stepVars, this.props.seed),
                    this.props.lesson,
                    this.props.courseName
                );
            }
        );
    };

    stopSpeech = () => {
        // will stop the speech
    };

    toggleWhiteboard = (hint) => {
        // console.log("hint", hint, hint.agentMode);
        // hint.agentMode = !hint.agentMode;
        if (this.state.playing && this.audioRef) {
            // pause
            this.audioRef.pause();
        }
        this.setState(
            (prevState) => ({
                agentMode: !prevState.agentMode,
            }),
            () => {
                this.playAgent(hint);
                this.context.firebase.log(
                    null,
                    this.props.problemID,
                    this.step,
                    null,
                    null,
                    this.state.subHintsFinished,
                    this.state.agentMode == true
                        ? "Switch to agent"
                        : "Switch to text",
                    chooseVariables(this.props.stepVars, this.props.seed),
                    this.props.lesson,
                    this.props.courseName
                );
            }
        );
        // should play when whiteboard opens and stop when closes
    };

    togglePlayPause = (hint) => {
        console.log("pause called");
        if (this.state.playing) {
            // pause
            this.audioRef.pause();
            this.context.firebase.log(
                null,
                this.props.problemID,
                this.step,
                null,
                null,
                this.state.subHintsFinished,
                "Paused playing",
                chooseVariables(this.props.stepVars, this.props.seed),
                this.props.lesson,
                this.props.courseName
            );
        } else {
            // play
            if (this.state.hintIndex == 0) {
                if (this.state.agentMode) {
                    if (hint.pacedSpeech && hint.audios) {
                        this.playAudioForSegment(0, hint.audios);
                    }
                }
                this.context.firebase.log(
                    null,
                    this.props.problemID,
                    this.step,
                    null,
                    null,
                    this.state.subHintsFinished,
                    "Restart playing",
                    chooseVariables(this.props.stepVars, this.props.seed),
                    this.props.lesson,
                    this.props.courseName
                );
            } else {
                this.audioRef.play();
                this.context.firebase.log(
                    null,
                    this.props.problemID,
                    this.step,
                    null,
                    null,
                    this.state.subHintsFinished,
                    "Continued Playing",
                    chooseVariables(this.props.stepVars, this.props.seed),
                    this.props.lesson,
                    this.props.courseName
                );
            }
        }
        this.setState((prevState) => ({ playing: !prevState.playing }));
    };

    handleOnChange = (event, expanded, index, hint) => {
        console.log("handle on change:", index);
        // opening a new hint should eventually also play agent - had to make a method to call both methods in 1 event
        this.unlockHint(event, expanded, index);
    };

    render() {
        const { translate } = this.props;
        const { classes, index, hints, problemID, seed, stepVars } = this.props;
        const { currentExpanded, showSubHints } = this.state;
        const { debug, use_expanded_view } = this.context;

        return (
            <div className={classes.root}>
                {/* {this.giveDynamicHint && <div>hi</div>} */}
                {hints.map((hint, i) => (
                    <Accordion
                        key={`${problemID}-${hint.id}`}
                        onChange={(event, expanded) =>
                            this.handleOnChange(event, expanded, i, hint)
                        }
                        disabled={
                            this.isLocked(i) && !(use_expanded_view && debug)
                        }
                        expanded={
                            currentExpanded === i ||
                            (use_expanded_view != null &&
                                use_expanded_view &&
                                debug)
                        }
                        defaultExpanded={false}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                            {...stagingProp({
                                "data-selenium-target": `hint-expand-${i}-${index}`,
                            })}
                        >
                            <Typography className={classes.heading}>
                                {translate("hintsystem.hint") + (i + 1) + ": "}
                                {renderText(
                                    hint.title === "nan" ? "" : hint.title,
                                    problemID,
                                    chooseVariables(
                                        Object.assign(
                                            {},
                                            stepVars,
                                            hint.variabilization
                                        ),
                                        seed
                                    ),
                                    this.context
                                )}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography
                                component={"span"}
                                style={{ width: "100%" }}
                            >
                                {renderText(
                                    currentExpanded === i
                                        ? this.renderWhiteboard(hint)
                                        : "", // only render whiteboard for current hint
                                    problemID,
                                    chooseVariables(
                                        Object.assign(
                                            {},
                                            stepVars,
                                            hint.variabilization
                                        ),
                                        seed
                                    ),
                                    this.context
                                )}
                                {hint.type === "scaffold" ? (
                                    <div>
                                        <Spacer />
                                        <HintTextbox
                                            hintNum={i}
                                            hint={hint}
                                            index={index}
                                            submitHint={this.props.submitHint}
                                            seed={this.props.seed}
                                            hintVars={Object.assign(
                                                {},
                                                this.props.stepVars,
                                                hint.variabilization
                                            )}
                                            toggleHints={(event) =>
                                                this.toggleSubHints(event, i)
                                            }
                                            giveStuFeedback={
                                                this.giveStuFeedback
                                            }
                                        />
                                    </div>
                                ) : (
                                    ""
                                )}
                                {(showSubHints[i] ||
                                    (use_expanded_view && debug)) &&
                                hint.subHints !== undefined ? (
                                    <div className="SubHints">
                                        <Spacer />
                                        <ErrorBoundary
                                            componentName={"SubHintSystem"}
                                        >
                                            <SubHintSystem
                                                giveStuFeedback={
                                                    this.giveStuFeedback
                                                }
                                                unlockFirstHint={
                                                    this.unlockFirstHint
                                                }
                                                problemID={problemID}
                                                hints={hint.subHints}
                                                unlockHint={this.unlockSubHint}
                                                hintStatus={
                                                    this.state.subHintsFinished[
                                                        i
                                                    ]
                                                }
                                                submitHint={this.submitSubHint}
                                                parent={i}
                                                index={index}
                                                seed={this.props.seed}
                                                hintVars={Object.assign(
                                                    {},
                                                    this.props.stepVars,
                                                    hint.variabilization
                                                )}
                                            />
                                        </ErrorBoundary>
                                        <Spacer />
                                    </div>
                                ) : (
                                    ""
                                )}
                            </Typography>
                        </AccordionDetails>
                        {this.props.agentMode && (
                            <AccordionActions>
                                {this.state.agentMode ? (
                                    <>
                                        <Button
                                            onClick={() =>
                                                this.reloadSpeech(hint)
                                            }
                                        >
                                            <img
                                                src={`${process.env.PUBLIC_URL}/reload_icon.svg`}
                                                alt="Reload Icon"
                                                width={15}
                                                height={15}
                                            />
                                        </Button>

                                        <Button
                                            onClick={() => {
                                                this.togglePlayPause(hint);
                                            }}
                                        >
                                            {this.state.playing ? (
                                                <img
                                                    src={`${process.env.PUBLIC_URL}/pause_icon.svg`}
                                                    alt="Pause Icon"
                                                    width={15}
                                                    height={15}
                                                />
                                            ) : (
                                                <img
                                                    src={`${process.env.PUBLIC_URL}/play_icon.svg`}
                                                    alt="Play Icon"
                                                    width={15}
                                                    height={15}
                                                />
                                            )}
                                        </Button>
                                    </>
                                ) : (
                                    " "
                                )}

                                <Button
                                    onClick={() => this.toggleWhiteboard(hint)}
                                >
                                    {this.state.agentMode ? "TEXT" : "AGENT"}
                                </Button>
                            </AccordionActions>
                        )}
                    </Accordion>
                ))}
            </div>
        );
    }
}

const styles = (theme) => ({
    root: {
        width: "100%",
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
});

export default withStyles(styles)(withTranslation(HintSystem));
