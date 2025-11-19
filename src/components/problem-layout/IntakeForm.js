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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  USER_ID_STORAGE_KEY,
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
  const { courseNum } = useParams();

  const [showPopup, setShowPopup] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [form, setForm] = useState({
    q1: "",
    q2: "",
    q3: "",
  });
  // DOM-visible stored payload used for test assertions
  const [stored, setStored] = useState(null);

  /**
   * Handles form submission by saving intake responses to localStorage
   * and showing a confirmation modal before navigating to course selection.
   * 
   * @author Aritro Datta
   */

  const headerTitle = `Course Intake Form`;

  const allFilled =
    form.q1.trim() && form.q2.trim() && form.q3.trim();

  const onChange = (k) => (e) => {
      const { value } = e.target;
      setForm((f) => ({ ...f, [k]: value }));
  };
  const onSubmit = (e) => {
    e.preventDefault();
    if (!allFilled) return;
    try {
      // Prefer an app-exposed Firebase instance id, otherwise fall back to stored user id.
      const userId =
        (window?.appFirebase?.oats_user_id) ||
        localStorage.getItem(USER_ID_STORAGE_KEY);

      localStorage.setItem(
        `intake:${userId}:course:${courseNum}`,
        JSON.stringify({ ...form, ts: Date.now() })
      );
    } catch {}
    setShowSubmitModal(true);
  };

  /**
   * Closes the submission confirmation modal and navigates to course selection.
   * 
   * @author Aritro Datta
   */
  const handleSubmitModalClose = () => {
    setShowSubmitModal(false);
    history.push(`/courses/${courseNum}`);
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
              What is your primary career goal? <span style={{ color: "#d32f2f" }}>(Required)*</span>
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
              What industry or field do you currently work in, or want to work in? <span style={{ color: "#d32f2f" }}>(Required)*</span>
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

          <Box display="flex" justifyContent="center" mt={1}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!allFilled}
            >
              Submit
            </Button>

            {/* Test button: save to localStorage and render stored JSON into the DOM for easy test assertions */}
            {/* <Box ml={2}>
              <Button
                type="button"
                variant="outlined"
                color="default"
                disabled={!allFilled}
                onClick={() => {
                  try {
                    const userId =
                      (window?.appFirebase?.oats_user_id) ||
                      localStorage.getItem(USER_ID_STORAGE_KEY);

                    const payload = { ...form, ts: Date.now() };

                    localStorage.setItem(`intake:${userId}`, JSON.stringify(payload));

                    const readBack = localStorage.getItem(`intake:${userId}`);
                    if (readBack) {
                      const parsed = JSON.parse(readBack);

                      setStored(JSON.stringify(parsed, null, 2));
                    } else {
                      setStored(`No saved intake found for user: ${userId}`);
                    }
                  } catch (err) {
                    setStored(`Error loading intake: ${String(err)}`);
                  }
                }}
              >
                Save to local (test DOM)
              </Button>
            </Box> */}
          </Box>
        </Paper>

        {/* DOM-visible storage debug area for tests */}
        {/* {stored && (
          <Box mt={2} width="100%" style={{ display: "flex", justifyContent: "center" }}>
            <Box width="100%" maxWidth={900}>
              <Typography variant="subtitle2" gutterBottom>
                Saved intake (test DOM)
              </Typography>
              <pre id="intake-storage-check" style={{whiteSpace:'pre-wrap', wordBreak:'break-word', background:'#f5f5f5', padding:12, borderRadius:8}}>
{stored}
              </pre>
            </Box>
          </Box>
        )} */}

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
      <Dialog
        open={showSubmitModal}
        onClose={handleSubmitModalClose}
        aria-labelledby="intake-submitted-title"
      >
        <DialogTitle id="intake-submitted-title">Thanks for sharing!</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="textSecondary">
            We saved your responses. Next, you&apos;ll head back to the course list to begin your lesson.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={handleSubmitModalClose}>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
