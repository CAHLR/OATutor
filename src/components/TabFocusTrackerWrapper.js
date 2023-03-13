import React from "react";
import { ThemeContext } from "../config/config";
import TabFocusTracker from "./TabFocusTracker";

export default class TabFocusTrackerWrapper extends React.Component {
    static contextType = ThemeContext;

    render() {
        return <TabFocusTracker context={this.context}/>
    }
}
