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

// Big numeric ring (course/textbook level)
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
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
          }}
        >
          {`${Math.round(progressPercent)}%`}
        </Typography>
      </Box>
    </Box>
  );
};

const calcGroupProgress = (lessons, masteryMap) => {
  if (!Array.isArray(lessons) || lessons.length === 0) return 0;
  const completed = lessons.reduce((acc, l) => acc + ((masteryMap?.[l.id] ?? 0) >= MASTERY_THRESHOLD ? 1 : 0), 0);
  return completed / lessons.length; // 0..1
};

// LESSON ring in accordion header: empty / half / full based on sublessons
const LessonCompletionRing = ({ progress = 0 }) => {
  const classes = useStyles();
  const pct = Math.round(Math.min(100, Math.max(0, progress * 100)));


  return (
    <Box position="relative" width={28} height={28}>
      {/* background ring */}
      <CircularProgress variant="determinate" value={100} size={28} thickness={4} style={{ color: "#E7F0EE" }} />
      {/* filled to % */}
      <CircularProgress
        variant="determinate"
        value={pct}
        size={28}
        thickness={4}
        style={{ color: "primary", position: "absolute", top: 0, left: 0 }}
        className={classes.roundedCaps}
      />
      {/* center icon */}
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
        <BookIcon style={{ width: 16, height: 16 }} />
      </Box>
    </Box>
  );
};

// SUBLESSON ring (unchanged logic)
const SublessonCompletionRing = ({ mastery }) => {
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
      <Box width={28} height={28} display="flex" alignItems="center" justifyContent="center">
        <img src={CheckMark} alt="Lesson Complete" style={{ width: 28, height: 28 }} />
      </Box>
    );
  }

  return (
    <Box position="relative" width={28} height={28}>
      {/* gray ring */}
      <CircularProgress variant="determinate" value={100} size={28} thickness={4} style={{ color: "#E7F0EE" }} />
      {/* half overlay when in progress */}
      {completionStatus === "in-progress" && (
        <CircularProgress
          variant="determinate"
          value={50}
          size={28}
          thickness={4}
          style={{ color: "primary", position: "absolute", top: 0, left: 0 }}
          className={classes.roundedCaps}
        />
      )}
      {/* center icon */}
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
          <img src={GreyLightningBoltIcon} alt="Sublesson Greyed Icon" style={{ width: 16, height: 16 }} />
        )}
        {completionStatus === "in-progress" && (
          <img src={LightningBoltIcon} alt="Sublesson Completion Icon" style={{ width: 16, height: 16 }} />
        )}
      </Box>
    </Box>
  );
};

// Utility: derive header status from its sublessons
const calcGroupStatus = (lessons, masteryMap) => {
  if (!Array.isArray(lessons) || lessons.length === 0) return "not-started";
  const toPct = (id) => Math.min(100, Math.max(0, (masteryMap?.[id] ?? 0) * 100));
  const threshPct = Math.min(100, Math.max(0, MASTERY_THRESHOLD * 100));

  let started = 0;
  let completed = 0;
  for (const l of lessons) {
    const pct = toPct(l.id);
    if (pct >= 11) started += 1;
    if (pct >= threshPct) completed += 1;
  }
  if (completed === lessons.length) return "completed";
  if (started > 0) return "in-progress";
  return "not-started";
};

const TableOfContents = ({
  courseName,
  courseMastery = 0,        // big ring (0..1)
  mastery = {},              // per-sublesson mastery map: { [lessonId]: 0..1 }
  onLessonClick,
  selectedLessonId,
  drawerOpen
}) => {
  const coursePlansFiltered = courses.filter(
    (course) => courseName && course.courseName === courseName
  );
  const classes = useStyles();
  const selectedLessonRef = useRef(null);

  const lessonPlans = [];
  for (let i = 0; i < coursePlansFiltered.length; i++) {
    const course = coursePlansFiltered[i];
    for (let j = 0; j < course.lessons.length; j++) {
      lessonPlans.push({ ...course.lessons[j], courseName: course.courseName });
    }
  }

  const totalSublessons = lessonPlans.length;

  const completedSublessons = lessonPlans.reduce((sum, l) => {
    const m = (mastery && typeof mastery[l.id] === "number") ? mastery[l.id] : 0;
    return sum + (m >= MASTERY_THRESHOLD ? 1 : 0);
  }, 0);

  const courseCompletionRatio = totalSublessons > 0
    ? completedSublessons / totalSublessons
    : 0;

  const getLessonGroup = (title) => {
    const match = title.match(/Lesson\s*(\d+)\.\d+/i);
    return match ? `Lesson ${match[1]}` : "Other";
  };

  const getLessonStatus = (lessons) => {
    if (!lessons || lessons.length === 0) return "not-started";

    let anyStarted = false;
    let allCompleted = true;

    for (const l of lessons) {
      const m = (mastery && typeof mastery[l.id] === "number") ? mastery[l.id] : 0; // mastery is per-sublesson (lesson row)
      const pct = Math.min(100, Math.max(0, m * 100));

      if (pct >= 11) anyStarted = true;
      if (pct < (MASTERY_THRESHOLD * 100)) allCompleted = false;
    }

    if (allCompleted) return "completed";
    if (anyStarted) return "in-progress";
    return "not-started";
  };

  const groupedLessons = {};
  lessonPlans.forEach((lesson) => {
    const title = lesson.name || lesson.topics || " ";
    const group = getLessonGroup(title);
    if (!groupedLessons[group]) groupedLessons[group] = [];
    groupedLessons[group].push(lesson);
  });

  const selectedLesson = lessonPlans.find(l => l.id === selectedLessonId);
  const selectedGroup = selectedLesson
    ? getLessonGroup(selectedLesson.name || selectedLesson.topics || " ")
    : null;

  const [expanded, setExpanded] = useState(selectedGroup || false);
  useEffect(() => {
    if (!selectedGroup) return;
    setExpanded(selectedGroup);
  }, [selectedGroup]);

  useEffect(() => {
    if (!drawerOpen) return;
    if (expanded !== selectedGroup) return; // wait until the group is open
    if (selectedLessonRef.current) {
      selectedLessonRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [drawerOpen, expanded, selectedGroup, selectedLessonId]);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  if (!courseName) return <div>Loading course</div>;

  return (
    <>
      {/* COURSE NAME AND BIG RING */}
      <div style={{ marginBottom: 16, marginTop: 10 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "align-left",
            gap: 12,
            marginLeft: 4,
          }}
        >
          <Grid item>
            <img
              src={GeometryIcon}
              alt="Lesson Icon Symbol Geometry"
              style={{ width: 40, height: 40, marginTop: 8 }}
            />
          </Grid>

          <Grid item xs={8}>
            <div style={{ fontWeight: 600 }}>{courseName}</div>
          </Grid>

          <Grid item xs={1}></Grid>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "align-right",
            }}
          >
            <Grid item xs={3}>
              <MasteryRing mastery={courseCompletionRatio} />
            </Grid>
          </div>
        </div>
      </div>

      {/* LESSON ACCORDION CARDS */}
      <div style={{ width: "100%" }}>
        {Object.entries(groupedLessons).map(([groupTitle, lessons], index) => {
          const groupStatus = calcGroupStatus(lessons, mastery);
          const groupProgress = calcGroupProgress(lessons, mastery);

          return (
            <Accordion
              disableGutters
              key={groupTitle}
              expanded={expanded === groupTitle}
              onChange={handleChange(groupTitle)}
              style={{
                marginLeft: "-16px",
                marginRight: "-16px",
                marginBottom: 0,
                marginTop: 0,
                width: "calc(100% + 32px)",
                borderRadius: "0px",
                boxShadow: "none",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${groupTitle}-content`}
                id={`${groupTitle}-header`}
                style={{
                  paddingLeft: 12 + 16,
                  paddingRight: 6 + 16,
                  height: 62,
                  borderTop:
                    expanded === groupTitle || index === 0
                      ? "1px solid #E5E7EB"
                      : "none",
                  borderBottom:
                    expanded === groupTitle ||
                    index === Object.entries(groupedLessons).length - 1
                      ? "1px solid #E5E7EB"
                      : "none",
                  margin: 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <LessonCompletionRing progress={groupProgress} />
                  <div style={{ fontWeight: 500 }}>{groupTitle}</div>
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
                {lessons.map((lesson, i) => {
                  const isSelected = selectedLessonId === lesson.id;
                  const sublessonMastery = mastery?.[lesson.id] ?? 0;

                  return (
                    <Box
                      key={lesson.id || i}
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
                        color: isSelected ? "#4C7D9F" : "#4A4E58",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <SublessonCompletionRing mastery={sublessonMastery} />
                        <div>{lesson.name} {lesson.topics}</div>
                      </div>
                    </Box>
                  );
                })}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </div>
    </>
  );
};

export default TableOfContents;