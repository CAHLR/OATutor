import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import styles from './problemCardStyles.js';
import checkAnswer from '../ProblemLogic/checkAnswer.js';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MultipleChoice from './MultipleChoice.js';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';

class HintTextbox extends React.Component {
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
    const [parsed, correctAnswer] = checkAnswer(this.state.inputVal, this.hint.hintAnswer, this.hint.answerType, "hint");
    console.log(this.props.submitHint)
    this.props.submitHint(parsed, this.hint, correctAnswer);


    this.setState({
      isCorrect: correctAnswer,
      checkMarkOpacity: correctAnswer === true ? '100' : '0'
    }, () => parsed);
  }

  editInput = (event) => {
    this.setState({ inputVal: event.target.value });
  }

  handleKey = (event) => {
    if (event.key === 'Enter') {
      this.submit();
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Grid container spacing={0} justify="center" alignItems="center">
          <Grid item xs={4} >
            <Box display="flex">
              <Box ml="auto" mr={0}>
                {this.hint.subHints !== undefined ?
                  <IconButton aria-label="delete" onClick={this.props.toggleHints}>
                    <img src={require('./raise_hand.png')} title="View available hints" alt="hintToggle" />
                  </IconButton> : ""}
              </Box>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box display="flex">
              <Box m="auto">
                {this.hint.problemType === "TextBox" ?
                  <TextField
                    error={this.state.isCorrect === false}
                    className={classes.inputHintField}
                    variant="outlined"
                    onChange={(evt) => this.editInput(evt)}
                    onKeyPress={(evt) => this.handleKey(evt)} /> : ""}
                {this.hint.problemType === "MultipleChoice" ?
                  <MultipleChoice
                    onChange={(evt) => this.editInput(evt)}
                    choices={this.hint.choices} /> : ""}
              </Box>
            </Box>
          </Grid>
          <Grid item xs={4}>
            {this.state.isCorrect ? <img className={classes.checkImage} style={{ opacity: this.state.checkMarkOpacity }} alt=""
              src="https://image.flaticon.com/icons/svg/148/148767.svg" /> : ""}
            {this.state.isCorrect === false ? <img className={classes.checkImage} style={{ opacity: 100 - this.state.checkMarkOpacity }} alt=""
              src="https://image.flaticon.com/icons/svg/148/148766.svg" /> : ""}
          </Grid>
        </Grid>

       
        <div className={classes.center}>
        <Button className={classes.button} size="small" onClick={this.submit} >Submit</Button>
        </div>

      </div>
    );
  }
}

export default withStyles(styles)(HintTextbox);
