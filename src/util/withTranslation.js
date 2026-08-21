import React from 'react';
import { useTranslation } from './useTranslation';

const withTranslation = (WrappedComponent) => {
  return (props) => {
    const { translate, setLanguage, enterCourse, exitCourse, language } = useTranslation();
    return (
      <WrappedComponent
        {...props}
        translate={translate}
        setLanguage={setLanguage}
        enterCourse={enterCourse}
        exitCourse={exitCourse}
        language={language}
      />
    );
  };
};

export default withTranslation;