import React from 'react';
import { useTranslation } from './useTranslation';

const withTranslation = (WrappedComponent) => {
  return (props) => {
    const { translate, setLanguage } = useTranslation();
    return <WrappedComponent translate={translate} setLanguage={setLanguage} {...props} />;
  };
};

export default withTranslation;
