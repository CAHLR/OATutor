import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import styles from './commonStyles.js';
import { checkAnswer } from '../ProblemLogic/checkAnswer.js';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MultipleChoice from './MultipleChoice.js';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import { renderText, chooseVariables } from '../ProblemLogic/renderText.js';
import EquationEditor from "equation-editor-react";
import { ThemeContext } from '../config/config.js';

class HintTextbox extends React.Component {
  static contextType = ThemeContext;
  constructor(props) {
    super(props);
    this.hint = props.hint;
    this.index = props.index;
    this.state = {
      inputVal: "",
      isCorrect: null,
      checkMarkOpacity: '0',
      showHints: false,
    }
  }

  submit = () => {
    const [parsed, correctAnswer] = checkAnswer(this.state.inputVal, this.hint.hintAnswer, this.hint.answerType, this.hint.precision, chooseVariables(this.props.hintVars, this.props.seed));
    this.props.submitHint(parsed, this.hint, correctAnswer, this.props.hintNum);

    this.setState({
      isCorrect: correctAnswer,
      checkMarkOpacity: correctAnswer === true ? '100' : '0'
    }, () => parsed);
  }

  editInput = (event) => {
    this.setState({ inputVal: event.target.value });
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Grid container spacing={0} justify="center" alignItems="center">
          <Grid item xs={1} md={4} />
          <Grid item xs={9} md={3}>
            {(this.hint.problemType === "TextBox" && this.hint.answerType !== "string") ?
              <center className={this.state.isCorrect === false ? classes.textBoxLatexIncorrect : classes.textBoxLatex} style={{ height: "50px", width: "100%" }}>
                <EquationEditor
                  value={this.state.inputVal}
                  onChange={(eq) => this.setState({ inputVal: eq })}
                  autoCommands={this.context.autoCommands}
                  autoOperatorNames={this.context.autoOperatorNames}
                /></center> : ""}
            {(this.hint.problemType === "TextBox" && this.hint.answerType === "string") ?
              <TextField
                inputProps={{ min: 0, style: { textAlign: 'center' } }}
                error={this.state.isCorrect === false}
                className={classes.inputField}
                variant="outlined"
                onChange={(evt) => this.editInput(evt)}>
              </TextField> : ""}
            {this.hint.problemType === "MultipleChoice" ?
              <MultipleChoice
                onChange={(evt) => this.editInput(evt)}
                choices={this.hint.choices} /> : ""}
          </Grid>
          <Grid item xs={2} md={1}>
            <div style={{ marginRight: "20px" }}>
              {this.hint.units ? renderText(this.hint.units) : ""}
            </div>
          </Grid >
          <Grid item xs={false} md={3} />
        </Grid>

        <Grid container spacing={0} justify="center" alignItems="center">
          <Grid item xs={false} sm={false} md={4} />
          <Grid item xs={4} sm={4} md={1}>
            { this.props.type !== "subHintTextbox" ?
            <center>
              <IconButton aria-label="delete" onClick={this.props.toggleHints}>
                <img src={require('./raise_hand.png').default} title="View available hints" alt="hintToggle" />
              </IconButton>
            </center> : <img src={require('./raise_hand.png').default} title="View available hints" alt="hintToggle" style={{visibility: "hidden"}}/> }
          </Grid>
          <Grid item xs={4} sm={4} md={2}>
            <center>
              <Button className={classes.button} style={{ width: "80%" }} size="small" onClick={this.submit}>Submit</Button>
            </center>
          </Grid>
          <Grid item xs={4} sm={3} md={1}>
            <div style={{ display: "flex", flexDirection: "row", alignContent: "center", justifyContent: "center" }}>
              {this.state.isCorrect ? <img className={classes.checkImage} style={{ opacity: this.state.checkMarkOpacity, width: "45%" }} alt=""
                src="https://image.flaticon.com/icons/svg/148/148767.svg" /> : ""}
              {this.state.isCorrect === false ? <img className={classes.checkImage} style={{ opacity: 100 - this.state.checkMarkOpacity, width: "45%" }} alt=""
                src="https://image.flaticon.com/icons/svg/148/148766.svg" /> : ""}
            </div>
          </Grid>
          <Grid item xs={false} sm={1} md={4} />
        </Grid>

      </div >
    );
  }
}

export default withStyles(styles)(HintTextbox);
