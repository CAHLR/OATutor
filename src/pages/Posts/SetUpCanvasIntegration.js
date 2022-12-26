import React, { useState } from "react";
import Spacer from "@components/Spacer";
import { useStyles } from "./Posts";
import clsx from "clsx";
import ZoomImage from "@components/ZoomImage";
import { SITE_NAME } from "../../config/config";

const createCourseLink = "https://community.canvaslms.com/t5/Instructor-Guide/How-do-I-create-a-new-course-from-the-Dashboard-as-an-instructor/ta-p/794"


const SetUpCanvasIntegration = () => {
    const classes = useStyles()

    const [consumerKey, setConsumerKey] = useState(null);
    const [consumerSecret, setConsumerSecret] = useState(null);

    const getConsumerKeySecret = () => {
        setConsumerKey("key")
        setConsumerSecret("secret")
    }

    return <>
        <h1>
            Setting up Canvas to work with OATutor (formerly known as OpenITS)
        </h1>
        <h4 style={{
            marginTop: 0
        }}>
            Last updated: {new Date(1638826551614).toLocaleString()}
        </h4>

        <h4>Creating a Canvas Course</h4>

        Please visit Canvas' post on their community posts <a href={createCourseLink} target={"_blank"}
                                                              rel="noreferrer">here</a>.

        <h4>Navigating to the Course App Settings</h4>

        Select the course you want to add OATutor to.

        <div className={clsx(classes.fullWidth, classes.textCenter, classes["p-8"])}>
            <ZoomImage
                alt={"Screenshot showing the user selecting their first course in the courses tab."}
                className={classes.image}
                src={`${process.env.PUBLIC_URL}/static/images/posts/setting-up-canvas-integration/courses%20selection.PNG`}/>
        </div>

        Navigate to the Settings > Apps tab of that course. Then click on the blue "+ App" button.

        <div className={clsx(classes.fullWidth, classes.textCenter, classes["p-8"])}>
            <ZoomImage
                alt={"Screenshot showing the user on the app tab of the settings page."}
                className={classes.image}
                src={`${process.env.PUBLIC_URL}/static/images/posts/setting-up-canvas-integration/settings%20app%20page.PNG`}/>
        </div>

        Select "By URL" in the Configuration Type dropdown.

        <h4>For the App Fields</h4>
        <div className={classes.fullWidth}><span className={classes.unselectable}>Name: </span><code>{SITE_NAME}</code>
        </div>

        Click <b className={classes.button} onClick={getConsumerKeySecret}>here</b> to generate the required
        consumer key and shared secret.

        {consumerKey && consumerSecret && <>
            <div className={classes.fullWidth}>
                <span className={classes.unselectable}>Consumer Key: </span><code>{consumerKey}</code>
            </div>
            <div className={classes.fullWidth}>
                <span className={classes.unselectable}>Shared Secret: </span><code>{consumerSecret}</code>
            </div>
        </>}
        <div className={classes.fullWidth}>
            <span
                className={classes.unselectable}>Config URL: </span><code>https://cahlr.github.io/{SITE_NAME}/lti-consumer-config.xml</code>
        </div>
        <div className={clsx(classes.fullWidth, classes.textCenter, classes["p-8"])}>
            <ZoomImage
                alt={"Screenshot showing an example App configuration with the fields filled out."}
                className={classes.image}
                src={`${process.env.PUBLIC_URL}/static/images/posts/setting-up-canvas-integration/add%20app.PNG`}/>
        </div>

        Click "Submit" and you will be able to start using {SITE_NAME} as an external tool.
        <Spacer height={24 * 8}/>
    </>
}

export default SetUpCanvasIntegration
