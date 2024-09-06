import React from 'react';
import { LocalizationConsumer } from '../../util/LocalizationContext';
import Problem from './Problem';

const ProblemWrapper = (props) => (
  <LocalizationConsumer>
    {({ setLanguage }) => <Problem {...props} setLanguage={setLanguage} />}
  </LocalizationConsumer>
);

export default ProblemWrapper;
