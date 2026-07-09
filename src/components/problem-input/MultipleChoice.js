import React from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import { renderText } from '../../platform-logic/renderText.js';
import { ThemeContext } from "../../config/config";

class MultipleChoice extends React.Component {
    static contextType = ThemeContext;

    constructor(props) {
        super(props);
        this.state = {
            value: props.defaultValue || null,
        };
    }

    handleChange = (event) => {
        this.setState({ value: event.target.value });
        this.props.onChange(event);
    };

    render() {
        let { choices: _choices = [], variabilization } = this.props;

        const choices = []
        if (Array.isArray(_choices)) {
            [...new Set(_choices)].forEach(choice => {
                if (choice.includes(" above")) {
                    choices.push(choice);
                } else {
                    choices.unshift(choice);
                }
            })
        }

        return (
            <div style={{ marginLeft: 0, textAlign: "left", width: "100%" }}>
                <FormControl component="fieldset" style={{ width: "100%" }}>
                    <RadioGroup value={this.state.value} onChange={this.handleChange}>
                        {choices.length > 0
                            ? choices.map((choice) =>
                                <FormControlLabel
                                    value={choice}
                                    control={<Radio color="primary" />}
                                    label={renderText(choice, null, variabilization, this.context)}
                                    key={choice}
                                    style={{ minHeight: 44, alignItems: "flex-start", marginRight: 0 }}
                                    classes={{ label: this.props.classes?.mcLabel }}
                                />)
                            : "Error: This problem has no answer choices. Please submit feedback."}
                    </RadioGroup>
                </FormControl>
            </div>
        );
    }
}

const styles = () => ({
    mcLabel: {
        whiteSpace: "normal",
        wordBreak: "break-word",
    },
});

export default withStyles(styles)(MultipleChoice);
