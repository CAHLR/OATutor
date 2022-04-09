import React from 'react';
import { ThemeContext } from "../../config/config";

export default class ErrorBoundary extends React.Component {
    static contextType = ThemeContext;

    constructor(props, context) {
        super(props);
        this.state = { hasError: false };
        this.context = context
        this.componentName = props.componentName || "_default_"
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.context.firebase.submitSiteLog("site-error", `componentName: ${this.componentName}`, {
            errorName: error.name || "n/a",
            errorCode: error.code || "n/a",
            errorMsg: error.message || "n/a",
            errorStack: error.stack || "n/a",
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return <>
                <div style={{
                    textAlign: "center",
                    display: this.props.inline ? "inline" : "block"
                }}>
                    <i>This {this.props.descriptor || "component"} could not be loaded</i>
                </div>
            </>
        }

        return this.props.children;
    }
}
