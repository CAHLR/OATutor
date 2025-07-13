import React, { useState, useRef, useEffect } from "react";
import courses from "../content-sources/oatutor/coursePlans.json";
import Grid from "@material-ui/core/Grid";

import GeometryIcon from "../assets/TOC-icon.svg";
import { CircularProgress, Box, Typography, makeStyles } from '@material-ui/core';

import {Accordion, AccordionSummary, AccordionDetails, typography} from "@material-ui/core";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import {ReactComponent as BookIcon} from "../assets/book-open.svg";
import LightningBoltIcon from "../assets/zap-blue.svg";
import GreyLightningBoltIcon from "../assets/zap.svg";
import CheckMark from "../assets/Circle.svg";

import { MASTERY_THRESHOLD } from "../config/config.js";


const useStyles = makeStyles(() => ({
    roundedCaps: {
        "& .MuiCircularProgress-circle": {
        strokeLinecap: "round",
        },
    },

    lessonCard: {
        backgroundColor: "#ffffff",
        padding: "16px",
        borderLeft: "4px solid #EBEFF2", 
        listStyle: "none",
        display: "flex",
        alignItems: "center",
    },


}));

// currently uses incorrect mastery calculation - will replace once each lesson mastery is noted
const MasteryRing = ({ mastery = 0 }) => {
    const classes = useStyles();
    const progressPercent = Math.min(100, Math.max(0, mastery * 100));

    return (
        <Box position="relative" width={56} height={56}>
            <CircularProgress
                variant="determinate"
                value={100}
                size={56}
                thickness={4}
                style={{ color: "#E7F0EE" }}
            />
            <CircularProgress
                variant="determinate"
                value={progressPercent}
                size={56}
                thickness={4}
                style={{ 
                    color: "#0B9B8A",
                    position: "absolute",
                    top: 0,
                    left: 0,
                }}
                className={classes.roundedCaps}
            />
            <Box
                top={0}
                left={0}
                bottom={0}
                right={0}
                position="absolute"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
            <Typography
                component="div"
                style={{
                    color: "#0B9B8A",
                    fontFamily: "Inter",
                    fontWeight: 700,
                }}
                >
                {`${Math.round(progressPercent)}%`}
            </Typography>
            </Box>
        </Box>
    );
};

const LessonCompletionRing = () => {
    const classes = useStyles();

    return (
        <Box position="relative" width={28} height={28}>
            <CircularProgress
                variant="determinate"
                value={100}
                size={28}
                thickness={4}
                style={{ color: "#E7F0EE" }}
            />
            <CircularProgress
                variant="determinate"
                value={50}
                size={28}
                thickness={4}
                style={{ 
                    color: "primary",
                    position: "absolute",
                    top: 0,
                    left: 0,
                }}
                className={classes.roundedCaps}
            />
            <Box
                top={0}
                left={0}
                bottom={0}
                right={0}
                position="absolute"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                {/* <img 
                    src={BookIcon} 
                    alt="Lesson Completion Icon" 
                    style={{
                        width: 16,
                        height: 16,
                    }}
                /> */}

                <BookIcon 
                    style={{ 
                        width: 16,
                        height: 16
                    }} 
                />
            </Box>
        </Box>
    );
};




const SublessonCompletionRing = ({ mastery }) => {


    // const { mastery = {}, updateMastery } = props;

    // useEffect(() => {
    //     if (typeof mastery === "number") {
    //     setDisplayedMastery(mastery);
    //     }
    // }, [mastery]);



    const progressPercent = Math.min(100, Math.max(0, mastery * 100));
    const wholeMasteryThreshold = Math.min(100, Math.max(0, MASTERY_THRESHOLD * 100));
    const classes = useStyles();

    let completionStatus;
    if (progressPercent < 11) {
        completionStatus = "not-started";
    } else if (progressPercent < wholeMasteryThreshold) {
        completionStatus = "in-progress";
    } else {
        completionStatus = "completed";
    }

    if (completionStatus === "completed") {
        return (
            <Box
                width={28}
                height={28}
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <img 
                    src={CheckMark} 
                    alt="Lesson Complete" 
                    style={{
                        width: 28,
                        height: 28,
                    }}
                />
            </Box>
        );
    }


    return (
        <Box position="relative" width={28} height={28}>

            {/* GRAY CIRCLE - not started */}
            <CircularProgress
                variant="determinate"
                value={100}
                size={28}
                thickness={4}
                style={{ color: "#E7F0EE" }}
            />

            {/* In progress ring half complete */}
            {completionStatus === "in-progress" && (
                <CircularProgress
                    variant="determinate"
                    value={50}
                    size={28}
                    thickness={4}
                    style={{ 
                        color: "primary",
                        position: "absolute",
                        top: 0,
                        left: 0,
                    }}
                    className={classes.roundedCaps}
                />
            )}

            {/* Center Icon */}
            <Box
                top={0}
                left={0}
                bottom={0}
                right={0}
                position="absolute"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >

                {completionStatus === "not-started" && (
                    <img 
                        src={GreyLightningBoltIcon} 
                        alt="Sublesson Greyed Icon" 
                        style={{
                            width: 16,
                            height: 16,
                        }}
                    />
                )}

                {completionStatus === "in-progress" && (
                    <img 
                        src={LightningBoltIcon} 
                        alt="Sublesson Completion Icon" 
                        style={{
                            width: 16,
                            height: 16,
                        }}
                    />
                )}
            </Box>
        </Box>
    );
};


const TableOfContents = ({ courseName, mastery = {}, onLessonClick, selectedLessonId})  => {
    const coursePlans = courses.filter(
        course => courseName && course.courseName === courseName
    );

    const classes = useStyles();
    const selectedLessonRef = useRef(null);

    useEffect(() => {
        if (selectedLessonRef.current) {
            selectedLessonRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [courseName, selectedLessonId]);

    const lessonPlans = [];
    for (let i = 0; i < coursePlans.length; i++) {
        const course = coursePlans[i];
        for (let j = 0; j < course.lessons.length; j++) {
            lessonPlans.push({
                ...course.lessons[j],
                courseName: course.courseName,
            });
        }
    }

    const getLessonGroup = (title) => {
        const match = title.match(/Lesson\s*(\d+)\.\d+/i); 
        return match 
            ? `Lesson ${match[1]}`
            : "Other";
    }

    const groupedLessons = {}
    lessonPlans.forEach((lesson) => {
        const title = lesson.name || lesson.topics || " ";
        const group = getLessonGroup(title); 

        if (!groupedLessons[group]) {
            groupedLessons[group] = [];
        }

        groupedLessons[group].push(lesson);
    });

    const [expanded, setExpanded] = useState(false);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };


    if (!courseName) return <div>Loading course</div>;


    return (
        <>
            
            {/* COURSE NAME AND PROGRESS RING */}
            <div 
                style = {{
                    marginBottom: 16,
                    marginTop: 10
                }}
            >
                <div 
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "align-left",
                        gap: 12,
                        marginLeft: 4
                    }}
                >
                    <Grid item>
                        <img 
                            src={GeometryIcon} 
                            alt="Lesson Icon Symbol Geometry" 
                            style={{
                                width: 40,
                                height: 40,
                                marginTop: 8,
                            }}
                        />
                    </Grid>

                    <Grid item xs={8}>
                        <div style={{fontWeight: 600}}>
                            {courseName}
                        </div>
                    </Grid>

                    <Grid item xs={1}></Grid>
                    {/* progress ring */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "align-right",
                        }}
                    >
                        <Grid item xs={3}>
                            <MasteryRing mastery={mastery} />
                        </Grid>
                    </div>
                </div>
            </div>

            {/* LESSON ACCORDION CARDS */}
            {/* <div style={{width: "100%", borderTop: "2px solid ddd"}}> */}
            
            <div style={{ width: "100%" }}>
                {Object.entries(groupedLessons).map(([groupTitle, lessons], index) => (
                
                <Accordion 
                    disableGutters
                    key={groupTitle} 
                    expanded={expanded === groupTitle}
                    onChange={handleChange(groupTitle)}
                    style={{ 
                        marginLeft: '-16px',
                        marginRight: '-16px',
                        marginBottom: 0,
                        marginTop: 0,
                        width: "calc(100% + 32px)",
                        borderRadius: "0px",
                        boxShadow: "none",
                        "&:before": {
                            display: "none",
                        },
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`${groupTitle}-content`}
                        id={`${groupTitle}-header`}
                        // style={{paddingLeft: 16, paddingRight: 16}}

                        style={{
                            paddingLeft: 12+16,
                            paddingRight: 6+16,
                            height: 62,
                            borderTop:
                                expanded === groupTitle || index === 0
                                    ? "1px solid #E5E7EB"
                                    : "none",
                            borderBottom:
                                expanded === groupTitle || index === Object.entries(groupedLessons).length - 1
                                    ? "1px solid #E5E7EB"
                                    : "none",
                            margin: 0
                        }}
                    >
                        <div 
                            style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "12px", 
                            }}
                        >
                            <LessonCompletionRing />
                            <div style={{fontWeight: 500}}>
                                {groupTitle}
                            </div>
                        </div>
                    </AccordionSummary>

                    <AccordionDetails 
                        style={{ 
                            display: "block", 
                            paddingLeft: 16,
                            paddingTop: 0,
                            paddingBottom: 0,
                            borderBottom: "1px solid #E5E7EB",
                        }}
                    
                    >
                        {lessons.map((lesson, index) => {
                            const isSelected = selectedLessonId === lesson.id;

                            return (
                                <Box 
                                    key={lesson.id || index}
                                    className={classes.lessonCard}
                                    ref={isSelected ? selectedLessonRef : null}
                                    onClick={() => onLessonClick && onLessonClick(lesson)}
                                    style={{
                                        marginLeft: "24px",
                                        marginRight: isSelected ? "-16px" : "24px",
                                        cursor: "pointer", 
                                        backgroundColor: isSelected ? "#E9F4FB" : "#ffffff",
                                        borderLeft: isSelected ? "4px solid #4C7D9F" : "4px solid #EBEFF2",
                                        fontWeight: isSelected ? 600 : 400,
                                        color: isSelected? "#4C7D9F" : "#4A4E58",
                                    }}
                                >
                                    <div 
                                        style={{ 
                                            display: "flex", 
                                            alignItems: "center", 
                                            gap: "12px" 
                                        }}
                                    >
                                        <SublessonCompletionRing mastery={mastery} />

                                        {/* <SublessonCompletionRing mastery={mastery?.[lesson.id] ?? 0} /> */}
                                        <div>
                                            {lesson.name} {lesson.topics}
                                        </div>
                                    </div>
                                </Box>
                            );
                        })}
                    </AccordionDetails>
                </Accordion>
                ))}   
            </div> 
        </>
    )};
export default TableOfContents;