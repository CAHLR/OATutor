// src/pages/LessonConfirmation.js
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  AppBar,
  Toolbar,
  Grid,
  Box,
  Paper,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  CircularProgress,
} from "@material-ui/core";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";
import { withStyles } from "@material-ui/core/styles";
import { useHistory, useParams } from "react-router-dom";

import BrandLogoNav from "@components/BrandLogoNav";
import Popup from "@components/Popup/Popup";
import About from '../../pages/Posts/About';

import styles from "./common-styles.js";
import { findLessonById, SHOW_COPYRIGHT, SITE_NAME, USER_ID_STORAGE_KEY, MIDDLEWARE_URL, coursePlans } from '../../config/config.js';

const DURATION_MS = 15000;
const TICK_MS = 100;

function LessonConfirmation({ classes, onConfirm, onCancel }) {
  const history = useHistory();
  const { lessonID } = useParams();

  const lesson = useMemo(() => {
    try {
      return findLessonById(lessonID);
    } catch {
      return null;
    }
  }, [lessonID]);

  const [ack, setAck] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [personalizedMessage, setPersonalizedMessage] = useState("");
  const [personalizationLoading, setPersonalizationLoading] = useState(false);
  const [personalizationError, setPersonalizationError] = useState(null);

  const rafRef = useRef(null);
  const startRef = useRef(null);

  const progress = useMemo(
    () => Math.min(100, (elapsed / DURATION_MS) * 100),
    [elapsed]
  );
  const timerDone = elapsed >= DURATION_MS;
  const remaining = useMemo(
    () => Math.max(0, Math.ceil((DURATION_MS - Math.min(elapsed, DURATION_MS)) / 1000)),
    [elapsed]
  );

  const canStart = ack && timerDone;

  const resolveCourseKey = () => {
    if (!lesson?.courseName) return null;
    const idx = coursePlans.findIndex(
      (course) => course.courseName === lesson.courseName
    );
    return idx > -1 ? String(idx) : null;
  };

  const loadIntakeResponses = () => {
    if (typeof window === "undefined") return null;
    try {
      const userId =
        window?.appFirebase?.oats_user_id ||
        localStorage.getItem(USER_ID_STORAGE_KEY);
      if (!userId) return null;
      const courseKey = resolveCourseKey();
      if (courseKey == null) return null;
      const storageKey = `intake:${userId}:course:${courseKey}`;
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return {
        motivation: parsed.q1 || "",
        enrollmentReason: parsed.q2 || "",
        personalChoice: parsed.q2 || "",
        desiredField: parsed.q3 || "",
      };
    } catch (error) {
      console.debug("Unable to load intake responses", error);
      return null;
    }
  };

  const buildLessonSummary = () => {
    if (!lesson) return "";
    const parts = [];
    if (lesson.topics) {
      parts.push(`Topics: ${lesson.topics}`);
    }
    if (lesson.description) {
      parts.push(lesson.description);
    }
    if (lesson.courseName) {
      parts.push(`Course: ${lesson.courseName}`);
    }
    const objectives = Object.keys(lesson.learningObjectives || {});
    if (objectives.length) {
      parts.push(`Learning objectives covered: ${objectives.length}`);
    }
    return parts.join(" | ");
  };

  const fetchPersonalizedMessage = useCallback(async () => {
    if (!lesson) return;
    const intakePayload = loadIntakeResponses();
    if (!intakePayload) {
      setPersonalizedMessage("");
      return;
    }
    setPersonalizationLoading(true);
    setPersonalizationError(null);
    const requestBody = {
      motivation: intakePayload.motivation || "",
      enrollmentReason: intakePayload.enrollmentReason || "",
      personalChoice: intakePayload.personalChoice || "",
      desiredField: intakePayload.desiredField || "",
      lessonTitle: lesson.name || lesson.title || "Your Lesson",
      lessonContent: buildLessonSummary(),
    };
    try {
      const response = await fetch(
        `${MIDDLEWARE_URL}/api/generate-personalized-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to personalize");
      }
      const data = await response.json();
      const message = data?.message?.trim();
      if (!message) {
        setPersonalizedMessage("");
        setPersonalizationError(
          "We couldn't personalize this lesson right now, but you can still continue."
        );
      } else {
        setPersonalizedMessage(message);
      }
    } catch (error) {
      console.error("Failed to fetch personalized message", error);
      setPersonalizedMessage("");
      setPersonalizationError(
        "We couldn't personalize this lesson right now, but you can still continue."
      );
    } finally {
      setPersonalizationLoading(false);
    }
  }, [lesson]);

  useEffect(() => {
    if (lesson) {
      fetchPersonalizedMessage();
    }
  }, [lesson, fetchPersonalizedMessage]);

  useEffect(() => {
    let lastTick = 0;
    const loop = (ts) => {
      if (startRef.current == null) startRef.current = ts;
      const delta = ts - startRef.current;

      if (ts - lastTick >= TICK_MS) {
        setElapsed(Math.min(DURATION_MS, delta));
        lastTick = ts;
      }
      if (delta < DURATION_MS) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        setElapsed(DURATION_MS)
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleStart = () => {
    if (!canStart) return;
    if (onConfirm) onConfirm(lessonID);
    else history.push(`/lessons/${lessonID}`);
  };

  const handleBack = () => {
    if (onCancel) onCancel();
    else history.goBack();
  };

  const titleCenter = lesson
    ? `${lesson.name}${lesson.topics ? `: ${lesson.topics}` : ""}`
    : `Lesson ${lessonID}`;

  return (
    <Box className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Grid container alignItems="center">
            <Grid item xs={3}><BrandLogoNav /></Grid>
            <Grid item xs={6} style={{ textAlign: "center" }}>
              {titleCenter}
            </Grid>
            <Grid item xs={3} />
          </Grid>
        </Toolbar>
      </AppBar>

      <Box display="flex" justifyContent="center" px={2} mt={6}>
        <Paper
          elevation={3}
          style={{
            width: "100%",
            maxWidth: 820,
            borderRadius: 16,
            padding: 32,
          }}
        >
          <Box textAlign="center" mb={1}>
            <Typography variant="h5" gutterBottom>
              Lesson x.x
            </Typography>
            <Typography variant="h4" style={{ fontWeight: 700 }} gutterBottom>
              Title
            </Typography>
          </Box>

          <Box maxWidth={640} mx="auto" mb={2}>
            <Typography
              variant="h6"
              align="center"
              style={{ fontWeight: 700, marginBottom: 8 }}
            >
              How This Lesson Supports Your Career
            </Typography>
            {personalizationLoading ? (
              <Box display="flex" alignItems="center" justifyContent="center" py={2}>
                <CircularProgress size={24} />
                <Typography
                  variant="body2"
                  style={{ marginLeft: 12 }}
                  color="textSecondary"
                >
                  Crafting a personalized orientation for you...
                </Typography>
              </Box>
            ) : personalizationError ? (
              <Typography variant="body1" align="left" color="textSecondary">
                {personalizationError}
              </Typography>
            ) : personalizedMessage ? (
              <Typography variant="body1" align="left" color="textSecondary">
                {personalizedMessage}
              </Typography>
            ) : (
              <Typography variant="body1" align="left" color="textSecondary">
                This lesson will help you build the skills you need to achieve your career goals.
              </Typography>
            )}
          </Box>

          <Box
            maxWidth={640}
            mx="auto"
            mt={2}
            mb={4}
            display="flex"
            justifyContent="center"
          >
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  checked={ack}
                  onChange={(e) => setAck(e.target.checked)}
                />
              }
              label="I have read this message and I am ready to start.*"
            />
          </Box>

          <Box
            maxWidth={360}
            mx="auto"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={1}
          >
            <Button onClick={handleBack} variant="text">
              Back
            </Button>

            <Button
              onClick={handleStart}
              variant="contained"
              color="primary"
              disabled={!canStart}
              className={classes.button}
              style={{
                position: "relative",
                overflow: "hidden",
                minWidth: 220,
                borderRadius: 12,
                width: "auto",
              }}
            >
              <Box
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${progress}%`,
                  background:
                    "linear-gradient(to right, rgba(255,255,255,0.35), rgba(255,255,255,0.15))",
                  pointerEvents: "none",
                  transition: "width 100ms linear",
                }}
              />
              <Box position="relative" zIndex={1} px={1}>
                { ! timerDone
                  ? `Start Lesson (${remaining})`
                  : "Start Lesson"}
              </Box>
            </Button>
          </Box>

          {/* <Box mt={3} textAlign="center">
            <Typography variant="caption" color="textSecondary">
              * You must check the box and wait for the timer to complete before
              starting the lesson.
            </Typography>
          </Box> */}
        </Paper>
      </Box>

      <Box
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 16px",
          marginTop: 24,
        }}
      >
        <Box component="span">
          {SHOW_COPYRIGHT && `© ${new Date().getFullYear()} ${SITE_NAME}`}
        </Box>
        <Box style={{ flexGrow: 1 }} />
        <IconButton
          onClick={() => setShowPopup(true)}
          title={`About ${SITE_NAME}`}
        >
          <HelpOutlineOutlinedIcon />
        </IconButton>
      </Box>

      <Popup isOpen={showPopup} onClose={() => setShowPopup(false)}>
        <About />
      </Popup>
    </Box>
  );
}

export default withStyles(styles)(LessonConfirmation);
