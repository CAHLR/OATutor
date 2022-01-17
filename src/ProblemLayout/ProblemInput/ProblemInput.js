import React, { createRef } from "react";
import Grid from "@material-ui/core/Grid";
import EquationEditor from "equation-editor-react";
import TextField from "@material-ui/core/TextField";
import MultipleChoice from "./MultipleChoice";
import GridInput from "./GridInput";
import MatrixInput from "./MatrixInput";
import { renderText } from "../../ProblemLogic/renderText";
import clsx from "clsx";
import './ProblemInput.css'
import { shuffleArray } from "../../util/shuffleArray";
import { EQUATION_EDITOR_AUTO_COMMANDS, EQUATION_EDITOR_AUTO_OPERATORS } from "../../config/config";
import { stagingProp } from "../../util/addStagingProperty";

class ProblemInput extends React.Component {
    constructor(props) {
        super(props);

        this.equationRef = createRef()

        this.onEquationChange = this.onEquationChange.bind(this)
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
            console.debug("not null!", textareaEl)
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
        const { classes, state, index } = this.props;

        let { problemType } = this.props.step;

        if (this.isMatrixInput()) {
            problemType = "MatrixInput"
        }

        return (
            <Grid container spacing={0} justifyContent="center" alignItems="center">
                <Grid item xs={1} md={problemType === "TextBox" ? 4 : false}/>
                <Grid item xs={9} md={problemType === "TextBox" ? 3 : 12}>
                    {(problemType === "TextBox" && this.props.step.answerType !== "string") && (
                        <center
                            ref={this.equationRef}
                            className={clsx(state.isCorrect === false && classes.textBoxLatexIncorrect, state.usedHints && classes.textBoxLatexUsedHint, classes.textBoxLatex)}
                            {...stagingProp({
                                "data-selenium-target": `arithmetic-answer-${index}`
                            })}
                        >
                            <EquationEditor
                                value={state.inputVal}
                                onChange={this.onEquationChange}
                                style={{ width: "100%" }}
                                autoCommands={EQUATION_EDITOR_AUTO_COMMANDS}
                                autoOperatorNames={EQUATION_EDITOR_AUTO_OPERATORS}
                            />
                        </center>
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
                            error={state.isCorrect === false}
                            className={classes.inputField}
                            variant="outlined"
                            onChange={(evt) => this.props.editInput(evt)}
                            onKeyPress={(evt) => this.props.handleKey(evt)}
                            InputProps={{
                                classes: {
                                    notchedOutline: ((state.isCorrect !== false && state.usedHints) ? classes.muiUsedHint : null)
                                }
                            }}>
                        </TextField>
                    )}
                    {problemType === "MultipleChoice" && (
                        <MultipleChoice
                            onChange={(evt) => this.props.editInput(evt)}
                            choices={shuffleArray(this.props.step.choices, this.props.seed)}
                            index={index}
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
                        />
                    )}
                </Grid>
                <Grid item xs={2} md={1}>
                    <div style={{ marginLeft: "20%" }}>
                        {this.props.step.units && renderText(this.props.step.units)}
                    </div>
                </Grid>
                <Grid item xs={false} md={problemType === "TextBox" ? 3 : false}/>
            </Grid>
        )
    }
}

export default ProblemInput
