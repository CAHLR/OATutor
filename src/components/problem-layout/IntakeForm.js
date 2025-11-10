    import React, { useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Container,
  Grid,
  IconButton,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  makeStyles,
} from "@material-ui/core";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";

import BrandLogoNav from "@components/BrandLogoNav";
import Popup from "@components/Popup/Popup";
import About from "../../pages/Posts/About";
import {
  findLessonById,
  SHOW_COPYRIGHT,
  SITE_NAME,
} from "../../config/config.js";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    minHeight: "100vh",
    display: "flex",  
    flexDirection: "column",
  },
  container: {
    flexGrow: 1,
    padding: theme.spacing(4, 0),
    display: "flex",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: 900,
    borderRadius: 16,
    padding: theme.spacing(3),
  },
  headerBar: {
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    textAlign: "center",
    backgroundColor: theme.palette.background.paper,
  },
  field: {
    marginBottom: theme.spacing(3),
  },
  footer: {
    marginTop: "auto",
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
  },
  spacer: { flexGrow: 1 },
}));

export default function IntakeForm() {
  const classes = useStyles();
  const history = useHistory();
  const { lessonID } = useParams();

  const [showPopup, setShowPopup] = useState(false);
  const [form, setForm] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
  });

  const lesson = useMemo(() => {
    try {
      return findLessonById(lessonID);
    } catch {
      return null;
    }
  }, [lessonID]);

  const topicsText = lesson?.topics
    ? Array.isArray(lesson.topics)
      ? lesson.topics.join(", ")
      : String(lesson.topics)
    : "";

  const headerTitle = lesson
    ? `${lesson.name}${topicsText ? `: ${topicsText}` : ""}`
    : `Lesson ${lessonID}`;

  const allFilled =
    form.q1.trim() && form.q2.trim() && form.q3.trim() && form.q4.trim();

  const onChange = (k) => (e) => {
      const { value } = e.target;
      setForm((f) => ({ ...f, [k]: value }));
  };
  const onSubmit = (e) => {
    e.preventDefault();
    if (!allFilled) return;
    try {
      localStorage.setItem(
        `intake:${lessonID}`,
        JSON.stringify({ ...form, ts: Date.now() })
      );
    } catch {}
    history.push(`/confirm/${lessonID}`);
  };

  return (
    <Box className={classes.root}>
      <AppBar position="fixed" className={classes.headerBar}>
        <Toolbar>
          <Grid container alignItems="center">
            <Grid item xs={3}>
              <BrandLogoNav />
            </Grid>
            <Grid item xs={6} style={{ textAlign: "center" }}>
              {headerTitle}
            </Grid>
            <Grid item xs={3} />
          </Grid>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" className={classes.container}>
        <Paper className={classes.card} elevation={3} component="form" onSubmit={onSubmit}>
          <Box className={classes.sectionTitle}>
            <Typography variant="h5" style={{ fontWeight: 700 }}>
              Intake Form
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Before you begin your course, please take a moment to answer the following questions
              with 1–2 sentences each. Your responses will help us personalize your learning
              material to help you achieve your goals.
            </Typography>
          </Box>

          <Box className={classes.field}>
            <Typography variant="subtitle1" gutterBottom>
              What motivated you to take this class? <span style={{ color: "#d32f2f" }}>(Required)*</span>
            </Typography>
            <TextField
              variant="outlined"
              fullWidth
              required
              multiline
              minRows={4}
              maxRows={10}
              placeholder="Enter your response..."
              value={form.q1}
              onChange={onChange("q1")}
            />
          </Box>

          <Box className={classes.field}>
            <Typography variant="subtitle1" gutterBottom>
              What did you intend to achieve by enrolling in the program? <span style={{ color: "#d32f2f" }}>(Required)*</span>
            </Typography>
            <TextField
              variant="outlined"
              fullWidth
              required
              multiline
              minRows={4}
              maxRows={10}
              placeholder="Enter your response..."
              value={form.q2}
              onChange={onChange("q2")}
            />
          </Box>


          <Box className={classes.field}>
            <Typography variant="subtitle1" gutterBottom>
              How do you hope this course will help you achieve your goals? <span style={{ color: "#d32f2f" }}>(Required)*</span>
            </Typography>
            <TextField
              variant="outlined"
              fullWidth
              required
              multiline
              minRows={4}
              maxRows={10}
              placeholder="Enter your response..."
              value={form.q3}
              onChange={onChange("q3")}
            />
          </Box>

          <Box className={classes.field}>
            <Typography variant="subtitle1" gutterBottom>
              What is your desired field of work? <span style={{ color: "#d32f2f" }}>(Required)*</span>
            </Typography>
            <TextField
              variant="outlined"
              fullWidth
              required
              multiline
              minRows={4}
              maxRows={10}
              placeholder="Enter your response..."
              value={form.q4}
              onChange={onChange("q4")}
            />
          </Box>

          <Box display="flex" justifyContent="center" mt={1}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!allFilled}
            >
              Submit
            </Button>
          </Box>
        </Paper>
      </Container>

      <Box className={classes.footer}>
        <Box component="span">
          {SHOW_COPYRIGHT && `© ${new Date().getFullYear()} ${SITE_NAME}`}
        </Box>
        <Box className={classes.spacer} />
        <IconButton onClick={() => setShowPopup(true)} title={`About ${SITE_NAME}`}>
          <HelpOutlineOutlinedIcon />
        </IconButton>
      </Box>

      <Popup isOpen={showPopup} onClose={() => setShowPopup(false)}>
        <About />
      </Popup>
    </Box>
  );
}
