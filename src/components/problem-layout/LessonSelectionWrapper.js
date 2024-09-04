import React from 'react';
import { LocalizationConsumer } from '../../util/LocalizationContext';
import LessonSelection from './LessonSelection';

const LessonSelectionWrapper = (props) => (
  <LocalizationConsumer>
    {({ setLanguage }) => <LessonSelection {...props} setLanguage={setLanguage} />}
  </LocalizationConsumer>
);

export default LessonSelectionWrapper;
