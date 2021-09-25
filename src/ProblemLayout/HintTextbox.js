import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import styles from './commonStyles.js';
import { checkAnswer } from '../ProblemLogic/checkAnswer.js';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MultipleChoice from './ProblemInput/MultipleChoice.js';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import { renderText, chooseVariables } from '../ProblemLogic/renderText.js';
import EquationEditor from "equation-editor-react";
import { ThemeContext } from '../config/config.js';
import ProblemInput from "./ProblemInput/ProblemInput";

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
    this.setInputValState(event.target.value)
  }

  setInputValState = (inputVal) => {
    // console.debug("new inputVal state: ", inputVal)
    this.setState({ inputVal })
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <ProblemInput
          classes={classes}
          state={this.state}
          step={this.hint}
          _setState={(state) => this.setState(state)}
          context={this.context}
          editInput={this.editInput}
          setInputValState={this.setInputValState}
        />

        <Grid container spacing={0} justifyContent="center" alignItems="center">
          <Grid item xs={false} sm={false} md={4}/>
          <Grid item xs={4} sm={4} md={1}>
            {this.props.type !== "subHintTextbox" ?
              <center>
                <IconButton aria-label="delete" onClick={this.props.toggleHints}>
                  <img src={`${process.env.PUBLIC_URL}/static/images/icons/raise_hand.png`} title="View available hints"
                       alt="hintToggle"/>
                </IconButton>
              </center> : <img src={'/static/images/icons/raise_hand.png'} title="View available hints" alt="hintToggle"
                               style={{ visibility: "hidden" }}/>}
          </Grid>
          <Grid item xs={4} sm={4} md={2}>
            <center>
              <Button className={classes.button} style={{ width: "80%" }} size="small"
                      onClick={this.submit}>Submit</Button>
            </center>
          </Grid>
          <Grid item xs={4} sm={3} md={1}>
            <div style={{ display: "flex", flexDirection: "row", alignContent: "center", justifyContent: "center" }}>
              {this.state.isCorrect ?
                <img className={classes.checkImage} style={{ opacity: this.state.checkMarkOpacity, width: "45%" }}
                     alt=""
                     src="https://image.flaticon.com/icons/svg/148/148767.svg"/> : ""}
              {this.state.isCorrect === false ?
                <img className={classes.checkImage} style={{ opacity: 100 - this.state.checkMarkOpacity, width: "45%" }}
                     alt=""
                     src="https://image.flaticon.com/icons/svg/148/148766.svg"/> : ""}
            </div>
          </Grid>
          <Grid item xs={false} sm={1} md={4}/>
        </Grid>

      </div>
    );
  }
}

export default withStyles(styles)(HintTextbox);
