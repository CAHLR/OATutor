import React from 'react';
import withWidth from '@material-ui/core/withWidth';
import { isMobileWidth } from './responsive';

export const ResponsiveContext = React.createContext({
    width: 'md',
    isMobile: false,
});

function ResponsiveProviderBase({ width, children }) {
    return (
        <ResponsiveContext.Provider
            value={{
                width,
                isMobile: isMobileWidth(width),
            }}
        >
            {children}
        </ResponsiveContext.Provider>
    );
}

export const ResponsiveProvider = withWidth()(ResponsiveProviderBase);

export function withResponsive(Component) {
    return function ResponsiveWrapper(props) {
        return (
            <ResponsiveContext.Consumer>
                {(responsive) => <Component {...props} responsive={responsive} />}
            </ResponsiveContext.Consumer>
        );
    };
}
