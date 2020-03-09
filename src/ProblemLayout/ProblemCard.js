import React, { useState } from 'react';
import useStyles from './problemCardStyles.js';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField'
import HintWrapper from './HintWrapper.js';
import Latex from 'react-latex';
import checkAnswer from '../ProblemLogic/checkAnswer.js';

export default function ProblemCard(props) {
  const classes = useStyles();
  const step = props.step;
  const index = props.index;
  const [inputVal, changeInputVal] = useState("");
  const [isCorrect, answerIs] = useState(null);

  function submit() {
    const [parsed, correctAnswer] = checkAnswer(inputVal, step.partAnswer, step.answerType); 

    if (props.logData) {
      log(parsed, correctAnswer);
    }

    answerIs(correctAnswer);
    props.answerMade(index, step.knowledgeComponents, correctAnswer)
  }

  function log(inputVal, isCorrect) {
    var today = new Date();
    var date = (today.getMonth() + 1) + '-' +
      today.getDate() + '-' +
      today.getFullYear() + " " +
      today.getHours() + ":" +
      today.getMinutes() + ":" +
      today.getSeconds()
    var data = {
      timeStamp: date,
      siteVersion: 0.1,
      studentID: "12345",
      problemID: step.id.slice(0, -1),
      stepID: step.id,
      input: inputVal,
      answer: step.partAnswer,
      isCorrect: isCorrect

    }
    return props.firebase.writeData("problemSubmissions", date, data);
  }

  function handleChange(event) {
    changeInputVal(event.target.value)
  }

  function handleKey(event) {
    if (event.key === 'Enter') {
      submit();
    }
  }

  const checkMarkStyle = { opacity: isCorrect === true ? '100' : '0' }

  return (
    <Card className={classes.card}>
      <CardContent>
        <h2 className={classes.partHeader}>
          {step.partTitle}
          <hr />
        </h2>

        <div className={classes.partBody}>
          <Latex>
            {step.partBody}
          </Latex>
        </div>
        <HintWrapper hints={props.step.hints} />
        <br />

        <TextField
          error={isCorrect === false}
          className={classes.inputField}
          variant="outlined"
          onChange={(evt) => handleChange(evt)}
          onKeyPress={(evt) => handleKey(evt)}>
        </TextField>

        <img className={classes.checkImage} style={checkMarkStyle} src="https://image.flaticon.com/icons/svg/148/148767.svg" alt="" />

      </CardContent>
      <CardActions>
        <Button className={classes.button} size="small" onClick={submit}>Submit</Button>
      </CardActions>
    </Card>
  );
}
