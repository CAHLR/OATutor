import React from "react";
import Spacer from "@components/Spacer";
import { useStyles } from "./Posts";
import { Link } from "react-router-dom";
import clsx from "clsx";
import ZoomImage from "@components/ZoomImage";

const CanvasAssignments = () => {
    const classes = useStyles()

    return <>
        <h1>
            Creating OATutor Assignments Through Canvas
        </h1>
        <h4 style={{
            marginTop: 0
        }}>
            Last updated: {new Date(1642208021289).toLocaleString()}
        </h4>

        <h4>Prerequisites</h4>

        Make sure that you have followed the previous tutorial to set up the Canvas integration first! You may re-visit
        the tutorial with this link: <Link to={"/posts/set-up-canvas-integration"}>Setting up Canvas to work with
        OATutor</Link>

        <h4>Navigating to the Create Assignment Page</h4>

        First select the course you want to add the Assignment to.

        <div className={clsx(classes.fullWidth, classes.textCenter, classes["p-8"])}>
            <ZoomImage
                alt={"Screenshot showing the user selecting their first course in the courses tab."}
                className={classes.image}
                src={`${process.env.PUBLIC_URL}/static/images/posts/setting-up-canvas-integration/courses%20selection.PNG`}/>
        </div>

        Navigate to the Assignments tab of that course. Then click on the blue "+ Assignment" button.

        <div className={clsx(classes.fullWidth, classes.textCenter, classes["p-8"])}>
            <ZoomImage
                alt={"Screenshot showing the user on the assignment tab of the settings page."}
                className={classes.image}
                src={`${process.env.PUBLIC_URL}/static/images/posts/canvas-assignments/add%20assignment.png`}/>
        </div>

        <h4>Creating the Canvas Assignment</h4>

        Give the Canvas Assignment a name and description as you would with any other Canvas assignments.

        <div className={clsx(classes.fullWidth, classes.textCenter, classes["p-8"])}>
            <ZoomImage
                alt={"Screenshot showing the assignment creation page with the assignment title and description filled out"}
                className={classes.image}
                src={`${process.env.PUBLIC_URL}/static/images/posts/canvas-assignments/create%20an%20assignment%20as%20you%20would%20usually.PNG`}/>
        </div>

        In the "Submission Type" section, select the "External Tool" option then click "Find".

        <div className={clsx(classes.fullWidth, classes.textCenter, classes["p-8"])}>
            <ZoomImage
                alt={"Screenshot showing the user on the submission type section."}
                className={classes.image}
                src={`${process.env.PUBLIC_URL}/static/images/posts/canvas-assignments/submission%20type.PNG`}/>
        </div>

        In the "Configure External Tool" window that pops up, click on the external tool that corresponds with OATutor.
        After seeing the URL field get populated, click select to confirm using OATutor for this assignment.

        <div className={clsx(classes.fullWidth, classes.textCenter, classes["p-8"])}>
            <ZoomImage
                alt={"Screenshot showing the user on the external tool configuration screen."}
                className={classes.image}
                src={`${process.env.PUBLIC_URL}/static/images/posts/canvas-assignments/configure%20external%20tool.PNG`}/>
        </div>

        At this point, you may change any other assignment settings (e.g., submission attempts, anonymous grading,
        assign) before clicking the blue "Save" button to begin the OATutor linking process.

        <h4>Linking the Assignment to the OATutor Lesson Plan</h4>

        After clicking "Save" in the previous step, you will be automatically directed to the instructors' view of the
        assignment. If you are not on the assignment page, navigate to the target assignment via the "Assignments" tab
        of the course page. You should be greeted with an OATutor welcome screen:

        <div className={clsx(classes.fullWidth, classes.textCenter, classes["p-8"])}>
            <ZoomImage
                alt={"Screenshot showing the user on the assignment page, selecting a course."}
                className={classes.image}
                src={`${process.env.PUBLIC_URL}/static/images/posts/canvas-assignments/select%20a%20course.PNG`}/>
        </div>

        <blockquote>
            If you do not see this greeting screen, make sure that the assignment has OATutor configured as the
            external tool. If there is an error screen instead or a blank screen, please contact your OATutor point of
            contact.
        </blockquote>

        Choose a course to select a lesson from (such as OpenStax: College Algebra). You will be redirected to a list of
        lesson plans:

        <div className={clsx(classes.fullWidth, classes.textCenter, classes["p-8"])}>
            <ZoomImage
                alt={"Screenshot showing the user on the lesson plan selecting page."}
                className={classes.image}
                src={`${process.env.PUBLIC_URL}/static/images/posts/canvas-assignments/select%20a%20lesson%20plan.PNG`}/>
        </div>

        <blockquote>
            If you do not see this list of lesson plans, see an error screen, or see a blank screen, please contact your
            OATutor point of contact to submit and record these issues.
        </blockquote>

        Click on a lesson plan to "select" it. If the OATutor lesson has been successfully linked to the Canvas
        assignment, this prompt will appear on the blue OATutor navbar:

        <div className={clsx(classes.fullWidth, classes.textCenter, classes["p-8"])}>
            <ZoomImage
                alt={"Screenshot showing the linkage success prompt."}
                className={classes.image}
                src={`${process.env.PUBLIC_URL}/static/images/posts/canvas-assignments/successfully%20linked%20assignment.PNG`}/>
        </div>

        If you refresh the assignment page, you will be greeted with this information screen:

        <div className={clsx(classes.fullWidth, classes.textCenter, classes["p-8"])}>
            <ZoomImage
                alt={"Screenshot showing the already linked information page."}
                className={classes.image}
                src={`${process.env.PUBLIC_URL}/static/images/posts/canvas-assignments/already%20been%20linked.PNG`}/>
        </div>

        At this point, the Canvas assignment has been registered with the OATutor system and you may now publish the
        assignment.

        <Spacer height={24 * 8}/>
    </>
}

export default CanvasAssignments
