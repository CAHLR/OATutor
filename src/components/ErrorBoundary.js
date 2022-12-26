import React from 'react';
import { ThemeContext } from "../config/config";

export default class ErrorBoundary extends React.Component {
    static contextType = ThemeContext;

    constructor(props, context) {
        super(props);
        this.state = { hasError: false };
        this.context = context
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        const { componentName = "_default_" } = this.props
        this.context.firebase.submitSiteLog("site-error", `componentName: ${componentName}`, {
            errorName: error.name || "n/a",
            errorCode: error.code || "n/a",
            errorMsg: error.message || "n/a",
            errorStack: error.stack || "n/a",
            errorInfo
        }, this.context.problemID);
    }

    render() {
        const { replacement } = this.props
        if (this.state.hasError) {
            return <>
                <div style={{
                    textAlign: "center",
                    display: this.props.inline ? "inline" : "block"
                }}>
                    {replacement
                        ? replacement
                        : <i>This {this.props.descriptor || "component"} could not be loaded</i>
                    }
                </div>
            </>
        }

        return this.props.children;
    }
}
