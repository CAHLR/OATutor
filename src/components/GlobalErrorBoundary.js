import React from 'react';
import { ThemeContext } from "../config/config";
import ErrorBoundary from "./ErrorBoundary";

export default class GlobalErrorBoundary extends ErrorBoundary {
    static contextType = ThemeContext;

    constructor(props, context) {
        super(props, context);
        this.componentName = "_global_"
    }

    render() {
        if (this.state.hasError) {
            return <>
                <div style={{
                    textAlign: "center",
                    paddingTop: "10vh"
                }}>
                    <h1>Something went wrong</h1>
                    <p style={{
                        fontSize: "150%"
                    }}>This incident has been reported to the developer team. Please try again later.</p>
                </div>
            </>
        }

        return this.props.children;
    }
}
