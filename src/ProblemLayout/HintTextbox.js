import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import styles from './problemCardStyles.js';
import checkAnswer from '../ProblemLogic/checkAnswer.js';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField'

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

    if (this.props.logData) {
      this.props.firebase.hintLog(parsed, this.hint, correctAnswer);
    }

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
        <TextField
          error={this.state.isCorrect === false}
          className={classes.inputHintField}
          variant="outlined"
          onChange={(evt) => this.editInput(evt)}
          onKeyPress={(evt) => this.handleKey(evt)}>

        </TextField>
        <img className={classes.checkImage} style={{ opacity: this.state.checkMarkOpacity }} src="https://image.flaticon.com/icons/svg/148/148767.svg" alt="" />

        <div className={classes.center}>
          <Button className={classes.button} size="small" onClick={this.submit} styles={{ marginLeft: "50em" }}>Submit</Button>
        </div>

      </div>
    );
  }
}

export default withStyles(styles)(HintTextbox);
