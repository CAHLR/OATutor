import React from 'react';
import { useTranslation } from './useTranslation';

const withTranslation = (WrappedComponent) => {
  return (props) => {
    const translate = useTranslation();
    return <WrappedComponent translate={translate} {...props} />;
  };
};

export default withTranslation;
