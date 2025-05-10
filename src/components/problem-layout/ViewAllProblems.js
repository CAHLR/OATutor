import React, { useEffect, useState, useMemo, Suspense, lazy, useContext } from 'react';
import { useParams } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  IconButton,
  Box,
  makeStyles,
  useTheme,
} from '@material-ui/core';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';

import BrandLogoNav from '@components/BrandLogoNav';
import Popup from '@components/Popup/Popup';
import About from '../../pages/Posts/About';
import { findLessonById, ThemeContext, SHOW_COPYRIGHT, SITE_NAME } from '../../config/config.js';
import { CONTENT_SOURCE } from '@common/global-config';
import { renderText, chooseVariables } from '../../platform-logic/renderText.js';
import withTranslation from '../../util/withTranslation.js';

const ProblemCardWrapper = lazy(() => import('@components/problem-layout/ProblemCardWrapper'));

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.default,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  container: {
    flexGrow: 1,
    padding: theme.spacing(4, 0),
  },
  problemCard: {
    marginBottom: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  stepWrapper: {
    margin: theme.spacing(2, 0),
  },
  footer: {
    marginTop: 'auto',
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
  },
  spacer: {
    flexGrow: 1,
  },
}));

const ViewAllProblems = ({ translate }) => {
  const classes = useStyles();
  const { lessonID } = useParams();
  const context = useContext(ThemeContext);
  const [lesson, setLesson] = useState(null);
  const [problemPool, setProblemPool] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [seed] = useState(() => Date.now().toString());

  useEffect(() => {
    import(`@generated/processed-content-pool/${CONTENT_SOURCE}.json`)
      .then(module => setProblemPool(module.default || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const found = findLessonById(lessonID);
    if (found) setLesson(found);
  }, [lessonID]);

  const filteredProblems = useMemo(() => {
    if (!lesson || !problemPool.length) return [];
    return problemPool.filter(problem =>
      problem.steps.some(step => {
        const kcs = context.skillModel[step.id] || [];
        return kcs.some(kc => kc in lesson.learningObjectives);
      })
    );
  }, [lesson, problemPool, context.skillModel]);

  const topicsText = lesson && lesson.topics
    ? Array.isArray(lesson.topics)
      ? lesson.topics.join(', ')
      : String(lesson.topics)
    : '';

  return (
    <Box className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Grid container alignItems="center">
            <Grid item xs={3}>
              <BrandLogoNav />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6" align="center">
                {lesson?.name}{topicsText && `: ${topicsText}`}
              </Typography>
            </Grid>
            <Grid item xs={3} style={{ textAlign: 'right' }}>
              <IconButton onClick={() => setShowPopup(true)}>
                <HelpOutlineOutlinedIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" className={classes.container}>
        {filteredProblems.length ? (
          filteredProblems.map((problem, pIndex) => (
            <Box key={problem.id} className={classes.problemCard}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h5" className={classes.title} align="center">
                    {renderText(
                      problem.title,
                      problem.id,
                      chooseVariables(problem.variabilization, seed),
                      context
                    )}
                  </Typography>
                  <Divider />
                  <Box mt={2}>
                    <Typography align="center">
                      {renderText(
                        problem.body,
                        problem.id,
                        chooseVariables(problem.variabilization, seed),
                        context
                      )}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {problem.steps.map((step, idx) => (
                <Box key={step.id} className={classes.stepWrapper}>
                  <Suspense fallback={<Typography>Loading step…</Typography>}>
                    <ProblemCardWrapper
                      {...{ step, idx, seed, lesson, problem }}
                      clearStateOnPropChange={lessonID}
                    />
                  </Suspense>
                  {idx < problem.steps.length - 1 && <Divider />}
                </Box>
              ))}
            </Box>
          ))
        ) : (
          <Typography align="center"></Typography>
        )}
      </Container>

      <Box className={classes.footer}>
        <Typography variant="body2">
          {SHOW_COPYRIGHT && `© ${new Date().getFullYear()} ${SITE_NAME}`}
        </Typography>
        <div className={classes.spacer} />
      </Box>

      <Popup isOpen={showPopup} nClose={() => setShowPopup(false)}>
        <About />
      </Popup>
    </Box>
  );
};

export default withTranslation(ViewAllProblems);
