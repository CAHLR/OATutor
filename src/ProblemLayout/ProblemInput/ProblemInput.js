import React, { createRef } from "react";
import Grid from "@material-ui/core/Grid";
import EquationEditor from "equation-editor-react";
import TextField from "@material-ui/core/TextField";
import MultipleChoice from "./MultipleChoice";
import GridInput from "./GridInput";
import MatrixInput from "./MatrixInput";
import { renderText } from "../../ProblemLogic/renderText";
import clsx from "clsx";
import { Resizable } from "react-resizable";
import 'react-resizable/css/styles.css';
import './ProblemInput.css'

class ProblemInput extends React.Component {
  constructor(props) {
    super(props);

    this.cellRef = createRef()
    this.state = {
      inputHeight: 50
    }

    this.onResize = this.onResize.bind(this)
  }

  componentDidMount() {
    console.debug('problem', this.props.step)
    if (this.isMatrixInput()) {
      console.log('automatically determined matrix input to be the correct problem type')
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

  onResize(event, { size }) {
    // console.debug(`new height: ${size.height}, cell ref: `, this.cellRef.current)
    if (this.cellRef.current) {
      if(Math.abs(this.state.inputHeight - size.height) > 30){
        return
      }
      this.cellRef.current.style.height = `${size.height}px`;
      this.cellRef.current.querySelector("* > *[mathquill-block-id]").style.height = `${size.height}px`;
    }
    this.setState({ inputHeight: size.height })
  }

  render() {
    const { classes, state } = this.props;

    let { problemType } = this.props.step;

    if (this.isMatrixInput()) {
      problemType = "MatrixInput"
    }

    return (
      <Grid container spacing={0} justifyContent="center" alignItems="center">
        <Grid item xs={1} md={problemType === "TextBox" ? 4 : false}/>
        <Grid item xs={9} md={problemType === "TextBox" ? 3 : 12}>
          {(problemType === "TextBox" && this.props.step.answerType !== "string") && (
            <Resizable width={-1} height={this.state.inputHeight} axis={"y"} onResize={this.onResize}
                       minConstraints={[50, 50]}
                       maxConstraints={[Infinity, 150]}
            >
              <center
                ref={this.cellRef}
                className={clsx(state.isCorrect === false && classes.textBoxLatexIncorrect, state.usedHints && classes.textBoxLatexUsedHint, classes.textBoxLatex)}>
                <EquationEditor
                  value={state.inputVal}
                  onChange={(eq) => this.props._setState({ inputVal: eq })}
                  style={{ width: "100%" }}
                  autoCommands={this.props.context.autoCommands}
                  autoOperatorNames={this.props.context.autoOperatorNames}
                />
              </center>
            </Resizable>
          )}
          {(problemType === "TextBox" && this.props.step.answerType === "string") && (
            <TextField
              inputProps={{ min: 0, style: { textAlign: 'center' } }}
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
              choices={this.props.step.choices}/>
          )}
          {problemType === "GridInput" && (
            <GridInput
              onChange={(newVal) => this.props.setInputValState(newVal)}
              numRows={this.props.step.numRows}
              numCols={this.props.step.numCols}
              context={this.props.context}
              classes={this.props.classes}
            />
          )}
          {problemType === "MatrixInput" && (
            <MatrixInput
              onChange={(newVal) => this.props.setInputValState(newVal)}
              numRows={this.props.step.numRows}
              numCols={this.props.step.numCols}
              context={this.props.context}
              classes={this.props.classes}
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
