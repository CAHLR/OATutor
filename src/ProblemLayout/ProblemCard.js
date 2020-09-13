import React from 'react';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton';

import checkAnswer from '../ProblemLogic/checkAnswer.js';
import styles from './commonStyles.js';
import { withStyles } from '@material-ui/core/styles';
import HintSystem from './HintSystem.js';
import renderText from '../ProblemLogic/renderText.js';
import MultipleChoice from './MultipleChoice.js';

import { ThemeContext } from '../config/config.js';


class ProblemCard extends React.Component {
  static contextType = ThemeContext;

  constructor(props, context) {
    super(props);
    this.step = props.step;
    this.index = props.index;
    this.hints = this.step.hints[context.hintPathway];

    for (let hint of this.hints) {
      hint.dependencies = hint.dependencies.map(dependency => this._findHintId(this.hints, dependency));
      if (hint.subHints) {
        for (let subHint of hint.subHints) {
          subHint.dependencies = subHint.dependencies.map(dependency => this._findHintId(hint.subHints, dependency));
        }
      }
    }

    // Bottom out hints option
    if (context.useBottomOutHints) {
      // Bottom out hints
      this.hints.push({
        id: this.step.id + "-h" + (this.hints.length),
        title: "Answer",
        text: "The answer is " + this.step.stepAnswer,
        type: "bottomOut",
        dependencies: Array.from(Array(this.hints.length).keys())
      });
      // Bottom out sub hints
      this.hints.map((hint, i) => {
        if (hint.type === "scaffold") {
          if (hint.subHints == null) {
            hint.subHints = [];
          }
          hint.subHints.push({
            id: this.step.id + "-h" + i + "-s" + (hint.subHints.length),
            title: "Answer",
            text: "The answer is " + hint.hintAnswer[0],
            type: "bottomOut",
            dependencies: Array.from(Array(hint.subHints.length).keys())
          });
        }
        return null;
      })
    }

    this.state = {
      inputVal: "",
      isCorrect: null,
      checkMarkOpacity: '0',
      showHints: false,
      hintsFinished: new Array(this.hints.length).fill(0)
    }
  }

  _findHintId = (hints, targetId) => {
    for (var i = 0; i < hints.length; i++) {
      if (hints[i].id === targetId) {
        return i;
      }
    }
    return -1;
  }

  submit = () => {
    const [parsed, correctAnswer] = checkAnswer(this.state.inputVal, this.step.stepAnswer, this.step.answerType, this.step.precision);

    if (this.context.logData) {
      this.context.firebase.log(parsed, this.props.problemID, this.step, correctAnswer, this.state.hintsFinished, "answerStep");
    }

    this.setState({
      isCorrect: correctAnswer,
      checkMarkOpacity: correctAnswer === true ? '100' : '0'
    });
    this.props.answerMade(this.index, this.step.knowledgeComponents, correctAnswer);
  }

  editInput = (event) => {
    this.setState({ inputVal: event.target.value });
  }

  handleKey = (event) => {
    if (event.key === 'Enter') {
      this.submit();
    }
  }

  toggleHints = (event) => {
    this.setState(prevState => ({
      showHints: !prevState.showHints
    }), () => {
      if (this.context.logData) {
        this.props.answerMade(this.index, this.step.knowledgeComponents, false);
      }
    });
  }

  unlockHint = (hintNum, hintType) => {
    // Mark question as wrong if hints are used (on the first time)
    if (this.state.hintsFinished.reduce((a, b) => a + b) === 0) {
      this.props.answerMade(this.index, this.step.knowledgeComponents, false);
    }

    this.setState(prevState => {
      prevState.hintsFinished[hintNum] = (hintType !== "scaffold" ? 1 : 0.5);
      return { hintsFinished: prevState.hintsFinished }
    }, () => {
      if (this.context.logData) {
        this.context.firebase.log(null, this.props.problemID, this.step, null, this.state.hintsFinished, "unlockHint");
      }
    });
  }

  submitHint = (parsed, hint, correctAnswer, hintNum) => {
    if (correctAnswer) {
      this.setState(prevState => {
        prevState.hintsFinished[hintNum] = 1;
        return { hintsFinished: prevState.hintsFinished }
      });
    }
    if (this.context.logData) {
      this.context.firebase.hintLog(parsed, this.props.problemID, this.step, hint, correctAnswer, this.state.hintsFinished);
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <Card className={classes.card}>
        <CardContent>
          <h2 className={classes.stepHeader}>
            {this.step.stepTitle}
            <hr />
          </h2>

          <div className={classes.stepBody}>
            {renderText(this.step.stepBody, this.props.problemID)}
          </div>

          {this.state.showHints ?
            <div className="Hints">
              <HintSystem
                problemID={this.props.problemID}
                step={this.step}
                hints={this.hints}
                unlockHint={this.unlockHint}
                hintStatus={this.state.hintsFinished}
                submitHint={this.submitHint}
              />
              <br /></div>
            : ""}


          <div className={classes.root}>
            <Grid container spacing={0} justify="center" alignItems="center">
              <Grid item xs={1} md={4} />
              <Grid item xs={9} md={3}>
                {this.step.problemType === "TextBox" ?
                  <TextField
                    error={this.state.isCorrect === false}
                    className={classes.inputField}
                    variant="outlined"
                    onChange={(evt) => this.editInput(evt)}
                    onKeyPress={(evt) => this.handleKey(evt)}>
                  </TextField> : ""}
                {this.step.problemType === "MultipleChoice" ?
                  <MultipleChoice
                    onChange={(evt) => this.editInput(evt)}
                    choices={this.step.choices} /> : ""}
              </Grid>
              <Grid item xs={2} md={1}>
                <div style={{ marginLeft: "20%" }}>
                  {this.step.units ? renderText(this.step.units) : ""}
                </div>
              </Grid >
              <Grid item xs={0} md={3} />

            </Grid>
          </div>

        </CardContent>
        <CardActions>
          <Grid container spacing={0} justify="center" alignItems="center">
            <Grid item xs={0} sm={0} md={4} />
            <Grid item xs={4} sm={4} md={1}>
              <center>
                <IconButton aria-label="delete" onClick={this.toggleHints}>
                  <img src={require('./raise_hand.png')} title="View available hints" alt="hintToggle" />
                </IconButton>
              </center>
            </Grid>
            <Grid item xs={4} sm={4} md={2}>
              <center>
                <Button className={classes.button} style={{ width: "80%" }} size="small" onClick={this.submit}>Submit</Button>
              </center>
            </Grid>
            <Grid item xs={4} sm={3} md={1}>
              <div style={{ display: "flex", flexDirection: "row", alignContent: "center", justifyContent: "center" }}>
                {this.state.isCorrect ? <img className={classes.checkImage} style={{ opacity: this.state.checkMarkOpacity, width: "45%", marginLeft: "90%" }} alt=""
                  src="https://image.flaticon.com/icons/svg/148/148767.svg" /> : ""}
                {this.state.isCorrect === false ? <img className={classes.checkImage} style={{ opacity: 100 - this.state.checkMarkOpacity, width: "45%", marginLeft: "90%" }} alt=""
                  src="https://image.flaticon.com/icons/svg/148/148766.svg" /> : ""}
              </div>
            </Grid>
            <Grid item xs={0} sm={1} md={4} />
          </Grid>
        </CardActions>
      </Card>



    )
  };
}
export default withStyles(styles)(ProblemCard);