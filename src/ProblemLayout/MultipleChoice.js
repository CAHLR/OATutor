import React from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import renderText from '../ProblemLogic/renderText.js';

class MultipleChoice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
    };
  }

  handleChange = (event) => {
    this.setState({ value: event.target.value });
    this.props.onChange(event);
  };

  render() {
    return (
      <div style={{marginRight: "5%", textAlign: "center"}}>
      <FormControl component="fieldset" >
        <FormLabel component="legend"></FormLabel>
        <RadioGroup value={this.state.value} onChange={this.handleChange}>
          {this.props.choices.map((choice, i) =>
            <FormControlLabel value={choice} control={<Radio />} label={renderText(choice)} key={choice} />)}
        </RadioGroup>
      </FormControl>
      </div>
    );
  }
}

export default MultipleChoice;