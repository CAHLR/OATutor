import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import styles from './problemCardStyles.js';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField'

function useStyles () {
  

  return makeStyles(styles);
}

export default function HintTextbox(props) {
  const classes = useStyles();
  const [inputVal, changeInputVal] = useState("");
  const [isCorrect, answerIs] = useState(null);

  function submit() {
    if (isCorrect) { return }

    if (inputVal === props.hintAnswer) {
      answerIs(true);
      //props.answerMade(index, step.knowledgeComponents, true)
    } else {
      answerIs(false);
      //props.answerMade(index, step.knowledgeComponents, false)
    }
  }

  function handleChange(event) {
    changeInputVal(event.target.value)
  }

  const checkMarkStyle = { opacity: isCorrect === true ? '100' : '0' }

  return (
    <div>
      <TextField
        error={isCorrect === false}
        className={classes.inputHintField}
        variant="outlined"
        onChange={(evt) => handleChange(evt)}>
      </TextField>
      <img className={classes.checkImage} style={checkMarkStyle} src="https://image.flaticon.com/icons/svg/148/148767.svg" alt="" />
      
      <div className={classes.center}>
        <Button className={classes.button} size="small" onClick={submit} styles={{ marginLeft: "50em" }}>Submit</Button>
      </div>

    </div>
  );
}
