import React, { useState }  from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField'


export default function ProblemCard(props) {
    const classes = useStyles();
    const part = props.part;
    const index = props.index;
    const [inputVal, changeInputVal] = useState("");
    const [isCorrect, answerIs] = useState(null);

    function submit() {
        if (isCorrect) { return }

        if (inputVal === part.partAnswer) {
            answerIs(true);
            props.answerMade(index, part.knowledgeComponents, true)
        } else {
            answerIs(false);
            props.answerMade(index, part.knowledgeComponents, false)
        }
    }

    function handleChange(event) {
        changeInputVal(event.target.value)
    }

    const checkMarkStyle = {opacity: isCorrect === true ? '100' : '0'}

    return (
        <Card className={classes.card}>
            <CardContent>
                <h2 className={classes.partHeader}>
                    {part.partTitle}
                    <hr/>
                </h2>

                <div className = {classes.partBody}>
                    {part.partBody}
                </div>

                <TextField error={isCorrect === false} className={classes.inputField} variant="outlined" onChange = {(evt) => handleChange(evt)}>hi</TextField>
                <img className={classes.checkImage} style = {checkMarkStyle} src="https://image.flaticon.com/icons/svg/148/148767.svg" alt="" />


            </CardContent>
            <CardActions>
                <Button className={classes.button} size="small" onClick={submit}>Submit</Button>
            </CardActions>
        </Card>
    );
}



const useStyles = makeStyles({
    card: {
        width: '30em',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: 20
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },

    button: {
        backgroundColor: '#8c94ff',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 10,
        paddingRight: 10,
        width: "20%"
    },

    partHeader: {
        textAlign: 'center',
        fontSize: 20,
        marginTop: 0,
    },

    partBody: {
        textAlign: 'center',
        fontSize: 30,
        marginTop: 10,
        marginBottom: 30
    },

    inputField: {
        width: '7em',
        marginLeft: '10.4em'

    },

    checkImage: {
        width: '3em',
        marginLeft: '0.5em',
        marginRight: '4.3em'
    }


});