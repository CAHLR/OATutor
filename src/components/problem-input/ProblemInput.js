import React, { createRef } from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import MultipleChoice from "./MultipleChoice";
import GridInput from "./GridInput";
import MatrixInput from "./MatrixInput";
import { renderText } from "../../platform-logic/renderText";
import clsx from "clsx";
import "mathlive";
import './ProblemInput.css'
import { shuffleArray } from "../../util/shuffleArray";
import { EQUATION_EDITOR_AUTO_COMMANDS, EQUATION_EDITOR_AUTO_OPERATORS, ThemeContext } from "../../config/config";
import { stagingProp } from "../../util/addStagingProperty";
import { parseMatrixTex } from "../../util/parseMatrixTex";

class ProblemInput extends React.Component {
    static contextType = ThemeContext;

    constructor(props) {
        super(props);

        this.equationRef = createRef()

        this.onEquationChange = this.onEquationChange.bind(this)
        
        this.state = {
            value: "",
        };
    }

    componentDidMount() {
        console.debug('problem', this.props.step, 'seed', this.props.seed)
        if (this.isMatrixInput()) {
            console.log('automatically determined matrix input to be the correct problem type')
        }

        const mqDisplayArea = this.equationRef?.current?.querySelector(".mq-editable-field > .mq-root-block")
        if (mqDisplayArea != null) {
            mqDisplayArea.ariaHidden = true
        }

        const textareaEl = this.equationRef?.current?.querySelector(".mq-textarea > textarea")
        if (textareaEl != null) {
            textareaEl.ariaLabel = `Answer question number ${this.props.index} here`
        }
    }

    isMatrixInput() {
        if (this.props.step?.stepAnswer) {
            return this.props.step?.problemType !== "MultipleChoice" &&
                /\\begin{[a-zA-Z]?matrix}/.test(this.props.step.stepAnswer[0])
        }
        if (this.props.step?.hintAnswer) {
            return this.props.step?.problemType !== "MultipleChoice" &&
                /\\begin{[a-zA-Z]?matrix}/.test(this.props.step.hintAnswer[0])
        }
    }

    onEquationChange(eq) {
        const containerEl = this.equationRef?.current
        const eqContentEl = this.equationRef?.current?.querySelector(".mq-editable-field")

        const textareaEl = this.equationRef?.current?.querySelector(".mq-textarea > textarea")

        if (textareaEl != null) {
            // console.debug("not null!", textareaEl)
            textareaEl.ariaLabel = `The current value is: ${eq}. Answer question number ${this.props.index} here.`
        }

        if (containerEl != null && eqContentEl != null) {
            const eqContainer = eqContentEl.querySelector("*[mathquill-block-id]")
            if (eqContainer != null) {
                const tallestEqElement = Math.max(...Array.from(eqContainer.childNodes.values()).map(el => el.offsetHeight))
                const newHeight = Math.max(tallestEqElement + 20, 50)

                containerEl.style.height = `${newHeight}px`;
                eqContainer.style.height = `${newHeight}px`;
            }
        }
        this.props.setInputValState(eq)
    }

    render() {
        const { classes, state, index, showCorrectness, allowRetry, variabilization } = this.props;
        const { use_expanded_view, debug } = this.context;
        let { problemType, stepAnswer, hintAnswer, units } = this.props.step;
        const keepMCOrder = this.props.keepMCOrder;
        const keyboardType = this.props.keyboardType;

        const problemAttempted = state.isCorrect != null
        const correctAnswer = Array.isArray(stepAnswer) ? stepAnswer[0] : hintAnswer[0]
        const disableInput = problemAttempted && !allowRetry

        if (this.isMatrixInput()) {
            problemType = "MatrixInput"
        }
        
        try {
            window.mathVirtualKeyboard.layouts = [keyboardType];
        } catch {
            window.mathVirtualKeyboard.layouts = ["default"];
        }


        return (
            <Grid container spacing={0} justifyContent="center" alignItems="center"
                className={clsx(disableInput && 'disable-interactions')}>
                <Grid item xs={1} md={problemType === "TextBox" ? 4 : false}/>
                <Grid item xs={9} md={problemType === "TextBox" ? 3 : 12}>
                    {(problemType === "TextBox" && this.props.step.answerType !== "string") && (
                        <math-field 
                            onInput={evt => this.props.setInputValState(evt.target.value)}
                            style={{"display": "block"}}
                            value={(use_expanded_view && debug) ? correctAnswer : state.inputVal}
                            onChange={this.onEquationChange}
                            autoCommands={EQUATION_EDITOR_AUTO_COMMANDS}
                            autoOperatorNames={EQUATION_EDITOR_AUTO_OPERATORS}
                        >
                            </math-field>
                        
                    )}
                    {(problemType === "TextBox" && this.props.step.answerType === "string") && (
                        <TextField
                            ref={this.textFieldRef}
                            inputProps={{
                                min: 0,
                                style: { textAlign: 'center' },
                                "aria-label": "Enter a response to the question above"
                            }}
                            {...stagingProp({
                                "data-selenium-target": `string-answer-${index}`
                            })}
                            error={showCorrectness && state.isCorrect === false}
                            className={classes.inputField}
                            variant="outlined"
                            onChange={(evt) => this.props.editInput(evt)}
                            onKeyPress={(evt) => this.props.handleKey(evt)}
                            InputProps={{
                                classes: {
                                    notchedOutline: ((showCorrectness && state.isCorrect !== false && state.usedHints) ? classes.muiUsedHint : null)
                                }
                            }}
                            {...(use_expanded_view && debug) ? {
                                defaultValue: correctAnswer
                            } : {}}
                        >
                        </TextField>
                    )}
                    {(problemType === "TextBox" && this.props.step.answerType === "short-essay") && (
                        <textarea
                            className="short-essay-input"
                            onChange={(evt) => this.props.editInput(evt)}
                            onKeyPress={(evt) => this.props.handleKey(evt)}
                        >
                        </textarea>
                    )}
                                        {(problemType === "MultipleChoice" && keepMCOrder) ? (
                        <MultipleChoice
                            onChange={(evt) => this.props.editInput(evt)}
                            choices={[...this.props.step.choices].reverse()}
                            index={index}
                            {...(use_expanded_view && debug) ? {
                                defaultValue: correctAnswer
                            } : {}}
                            variabilization={variabilization}
                        />
                    ) :
                    (problemType === "MultipleChoice") && (
                        <MultipleChoice
                            onChange={(evt) => this.props.editInput(evt)}
                            choices={shuffleArray(this.props.step.choices, this.props.seed)}
                            index={index}
                            {...(use_expanded_view && debug) ? {
                                defaultValue: correctAnswer
                            } : {}}
                            variabilization={variabilization}
                        />
                    )}
                    {problemType === "GridInput" && (
                        <GridInput
                            onChange={(newVal) => this.props.setInputValState(newVal)}
                            numRows={this.props.step.numRows}
                            numCols={this.props.step.numCols}
                            context={this.props.context}
                            classes={this.props.classes}
                            index={index}
                            {...(use_expanded_view && debug) ? {
                                defaultValue: parseMatrixTex(correctAnswer)[0]
                            } : {}}
                        />
                    )}
                    {problemType === "MatrixInput" && (
                        <MatrixInput
                            onChange={(newVal) => this.props.setInputValState(newVal)}
                            numRows={this.props.step.numRows}
                            numCols={this.props.step.numCols}
                            context={this.props.context}
                            classes={this.props.classes}
                            index={index}
                            {...(use_expanded_view && debug) ? {
                                defaultValue: parseMatrixTex(correctAnswer)[0]
                            } : {}}
                        />
                    )}
                </Grid>
                <Grid item xs={2} md={1}>
                    <div style={{ marginLeft: "20%" }}>
                        {units && renderText(units, this.context.problemID, variabilization, this.context)}
                    </div>
                </Grid>
                <Grid item xs={false} md={problemType === "TextBox" ? 3 : false}/>
            </Grid>
        )
    }
}

export default ProblemInput
