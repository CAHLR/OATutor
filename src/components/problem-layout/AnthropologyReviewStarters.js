import React from 'react';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { isOfficeHoursLesson } from '../../util/officeHours';

const STARTERS = [
    { label: 'Text structure', message: 'Quiz me on the overall structure of the text.' },
    { label: 'Key arguments', message: 'Quiz me on the structure of the key arguments.' },
    { label: 'Key terms', message: 'Quiz me on the key terms in the reading.' },
    { label: 'Mix it up', message: 'Quiz me with a mix of text structure, key arguments, and key terms.' },
];

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        paddingLeft: 44,
    },
    button: {
        minHeight: 40,
        borderRadius: 8,
        textTransform: 'none',
        letterSpacing: 0,
        backgroundColor: '#fff',
    },
});

export default function AnthropologyReviewStarters({ lesson, messages, disabled, onSelect }) {
    const classes = useStyles();
    if (lesson?.courseName !== 'Anthropology: Reading Review' || !isOfficeHoursLesson(lesson) ||
        messages.some((message) => message.role === 'user')) return null;

    return (
        <div className={classes.root} role="group" aria-label="Reading review topics">
            {STARTERS.map(({ label, message }) => (
                <Button key={label} className={classes.button} variant="outlined" color="primary"
                    disabled={disabled} onClick={() => onSelect(message)}>
                    {label}
                </Button>
            ))}
        </div>
    );
}
