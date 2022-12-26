import React from "react";
import Spacer from "@components/Spacer";
import { useStyles } from "./Posts";
import { HELP_DOCUMENT, SITE_NAME } from "../../config/config";

const VPAT_LINK = `${process.env.PUBLIC_URL}/static/documents/OATutor_Sec508_WCAG.pdf`

const HowToUse = () => {
    const classes = useStyles()

    return <>
        <h1>
            How to use {SITE_NAME}?
        </h1>
        <h2>
            Accessibility Standards, Input Types, and Shortcuts
        </h2>
        <h4 style={{
            marginTop: 0
        }}>
            Last updated: {new Date(1643007791501).toLocaleString()}
        </h4>

        <h4>Question Input Types & Shortcuts</h4>

        To learn more about how to fill in and submit {SITE_NAME} assignments,<span> </span>
        <a href={HELP_DOCUMENT} target={"_blank"} rel={"noreferrer"}>visit our help document</a>.

        <h4>Accessibility Standards</h4>

        <p>
            {SITE_NAME} strives to ensure an easy and accessible experience for all users, regardless of disabilities.
            The site, {SITE_NAME}, is built with the most up-to-date HTML5 and CSS3 standards; all whilst complying with
            W3C's Web Accessibility Guidelines (WCAG) and Section 508 guidelines.
        </p>

        <p className={classes["pt-2"]}>
            The Voluntary Product Accessibility Template, or VPAT, is a tool that administrators and decision-makers can
            use to evaluate {SITE_NAME}{SITE_NAME.match(/s$/i) ? "'" : "'s"} conformance with the accessibility
            standards under Section 508 of the Rehabilitation Act.
        </p>

        <p className={classes["pt-2"]}>
            You may read our most recent publication of our Voluntary Product Accessibility Template at this
            url:<span> </span>
            <a href={VPAT_LINK} target={"_blank"} rel={"noreferrer"}>{VPAT_LINK.match(/\/[^/]*$/)[0].substr(1)}</a>
        </p>

        <Spacer height={24 * 8}/>
    </>
}

export default HowToUse
