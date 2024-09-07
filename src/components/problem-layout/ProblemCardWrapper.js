import React from 'react';
import { LocalizationConsumer } from '../../util/LocalizationContext';
import ProblemCard from './ProblemCard';

const ProblemCardWrapper = (props) => (
  <LocalizationConsumer>
    {({ setLanguage }) => <ProblemCard {...props} setLanguage={setLanguage} />}
  </LocalizationConsumer>
);

export default ProblemCardWrapper;
