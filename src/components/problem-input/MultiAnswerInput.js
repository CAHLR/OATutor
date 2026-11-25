import React from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import { stagingProp } from "../../util/addStagingProperty";

export default function MultiAnswerInput({ index, multiAnswer, value, onChange, onKeyPress,
    disabled, showFeedback, results = [], errorMessage = "" }) {
    if (multiAnswer.layout === "combined") {
        return (
            <TextField
                fullWidth
                variant="outlined"
                label="Answer (value and unit)"
                inputProps={{ "aria-label": "Answer with value and unit" }}
                value={typeof value === "string" ? value : ""}
                onChange={(event) => onChange(event.target.value)}
                onKeyPress={onKeyPress}
                disabled={disabled}
                error={Boolean(errorMessage) || (showFeedback && results.some(result => !result.isCorrect))}
                helperText={errorMessage || (showFeedback && results.length ?
                    results.map(result => `${result.label || "Answer"}: ${result.isCorrect ? "Correct" : "Try again"}`).join("; ")
                    : undefined)}
                {...stagingProp({ "data-selenium-target": `multi-answer-combined-${index}` })}
            />
        );
    }

    const values = multiAnswer.parts.map((_, partIndex) =>
        Array.isArray(value) ? (value[partIndex] ?? "") : ""
    );
    return (
        <Grid container spacing={2}>
            {multiAnswer.parts.map((part, partIndex) => {
                const result = results[partIndex];
                const label = part.label || `Answer ${partIndex + 1}`;
                return (
                    <Grid item xs={12} sm={6} key={partIndex}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            label={label}
                            inputProps={{
                                "aria-label": label,
                            }}
                            value={values[partIndex] || ""}
                            onChange={(event) => {
                                const next = [...values];
                                next[partIndex] = event.target.value;
                                onChange(next);
                            }}
                            onKeyPress={onKeyPress}
                            disabled={disabled}
                            error={showFeedback && result?.isCorrect === false}
                            helperText={errorMessage || (showFeedback && result ?
                                (result.isCorrect ? "Correct" : "Try again") : undefined)}
                            {...stagingProp({
                                "data-selenium-target": `multi-answer-${index}-${partIndex}`,
                            })}
                        />
                    </Grid>
                );
            })}
        </Grid>
    );
}
