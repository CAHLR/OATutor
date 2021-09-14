import React from "react";
import Grid from "@material-ui/core/Grid";
import EquationEditor from "equation-editor-react";
import TextField from "@material-ui/core/TextField";
import MultipleChoice from "./MultipleChoice";
import GridInput from "./GridInput";
import MatrixInput from "./MatrixInput";
import { renderText } from "../../ProblemLogic/renderText";

class ProblemInput extends React.Component {
  render() {
    const { classes, state } = this.props;

    let { problemType } = this.props.step;

    if (/\\begin{[a-zA-Z]?matrix}/.test(this.props.step?.stepAnswer[0]) && this.props.step?.problemType !== "MultipleChoice") {
      console.log('automatically determined matrix input to be the correct problem type')
      problemType = "MatrixInput"
    }

    return (
      <Grid container spacing={0} justifyContent="center" alignItems="center">
        <Grid item xs={1} md={problemType === "TextBox" ? 4 : false}/>
        <Grid item xs={9} md={problemType === "TextBox" ? 3 : 12}>
          {(problemType === "TextBox" && this.props.step.answerType !== "string") && (
            <center
              className={state.isCorrect === false ? classes.textBoxLatexIncorrect : (state.usedHints ? classes.textBoxLatexUsedHint : classes.textBoxLatex)}
              style={{ height: "50px", width: "100%" }}>
              <EquationEditor
                value={state.inputVal}
                onChange={(eq) => this.props.setState({ inputVal: eq })}
                style={{ width: "100%" }}
                autoCommands={this.props.context.autoCommands}
                autoOperatorNames={this.props.context.autoOperatorNames}
              />
            </center>
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
