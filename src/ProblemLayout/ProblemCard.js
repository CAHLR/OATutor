import React, { useState } from 'react';
import useStyles from './problemCardStyles.js';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField'
import HintWrapper from './HintWrapper.js';



export default function ProblemCard(props) {
    const classes = useStyles();
    const part = props.part;
    const index = props.index;
    const [inputVal, changeInputVal] = useState("");
    const [isCorrect, answerIs] = useState(null);

    function submit() {
        if (isCorrect) { return }

        log(inputVal);

        if (inputVal === part.partAnswer) {
            answerIs(true);
            props.answerMade(index, part.knowledgeComponents, true)
        } else {
            answerIs(false);
            props.answerMade(index, part.knowledgeComponents, false)
        }
    }

    function log(inputVal) {
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
            problemID: part.id.slice(0, -1),
            stepID: part.id,
            input: inputVal,
            answer: part.partAnswer,
            isCorrect: inputVal === part.partAnswer

        }
        return props.firebase.writeData("problemSubmissions", date, data);
    }

    function handleChange(event) {
        changeInputVal(event.target.value)
    }

    const checkMarkStyle = { opacity: isCorrect === true ? '100' : '0' }

    return (
        <Card className={classes.card}>
            <CardContent>
                <h2 className={classes.partHeader}>
                    {part.partTitle}
                    <hr />
                </h2>

                <div className={classes.partBody}>
                    {part.partBody}
                </div>
                <HintWrapper hints={props.part.hints} />
                <br />

                <TextField
                    error={isCorrect === false}
                    className={classes.inputField}
                    variant="outlined"
                    onChange={(evt) => handleChange(evt)}>
                </TextField>

                <img className={classes.checkImage} style={checkMarkStyle} src="https://image.flaticon.com/icons/svg/148/148767.svg" alt="" />

            </CardContent>
            <CardActions>
                <Button className={classes.button} size="small" onClick={submit}>Submit</Button>
            </CardActions>
        </Card>
    );
}
