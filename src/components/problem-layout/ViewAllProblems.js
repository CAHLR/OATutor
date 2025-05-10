import React, {
  useEffect,
  useState,
  useMemo,
  Suspense,
  lazy,
  useContext,
} from 'react';
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
  Button,
  makeStyles,
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
    position: 'relative',
    marginBottom: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  stepWrapper: {
    position: 'relative',
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

const BATCH_SIZE = 3;
const NOOP = () => {};

const ViewAllProblems = ({ translate }) => {
  const classes = useStyles();
  const { lessonID } = useParams();
  const context = useContext(ThemeContext);

  const [lesson, setLesson] = useState(null);
  const [problemPool, setProblemPool] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [visibleProblems, setVisibleProblems] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [seed] = useState(() => Date.now().toString());

  // 1) Load full pool
  useEffect(() => {
    import(`@generated/processed-content-pool/${CONTENT_SOURCE}.json`)
      .then(module => setProblemPool(module.default || []))
      .catch(console.error);
  }, []);

  // 2) Set lesson object
  useEffect(() => {
    const found = findLessonById(lessonID);
    if (found) setLesson(found);
  }, [lessonID]);

  // 3) Filter pool by lesson objectives
  const memoFiltered = useMemo(() => {
    if (!lesson || !problemPool.length) return [];
    return problemPool.filter(problem =>
      problem.steps.some(step => {
        const kcs = context.skillModel[step.id] || [];
        return kcs.some(kc => kc in lesson.learningObjectives);
      })
    );
  }, [lesson, problemPool, context.skillModel]);

  useEffect(() => {
    setFilteredProblems(memoFiltered);
  }, [memoFiltered]);

  // 4) Chunked rendering: add BATCH_SIZE problems per frame
  useEffect(() => {
    setVisibleProblems([]);        // reset whenever filter changes
    if (!filteredProblems.length) return;

    let idx = 0;
    function addBatch() {
      setVisibleProblems(prev => [
        ...prev,
        ...filteredProblems.slice(idx, idx + BATCH_SIZE)
      ]);
      idx += BATCH_SIZE;
      if (idx < filteredProblems.length) {
        // schedule next chunk
        setTimeout(addBatch, 16);
      }
    }
    addBatch();
  }, [filteredProblems]);

  // Helper to render the list
  const renderList = (list) =>
    list.map((problem, pIndex) => {
      const vars = chooseVariables(problem.variabilization, seed);
      return (
        <Box key={problem.id} className={classes.problemCard}>
          <Box position="absolute" top={8} right={16}>
            <Typography variant="caption" color="textSecondary">
              {problem.id}
            </Typography>
          </Box>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h5" className={classes.title} align="center">
                {renderText(problem.title, problem.id, vars, context)}
              </Typography>
              <Divider />
              <Box mt={2}>
                <Typography align="center">
                  {renderText(problem.body, problem.id, vars, context)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
          {problem.steps.map((step, idx) => (
            <Box key={step.id} className={classes.stepWrapper}>
              <Suspense fallback={<Typography>Loading step…</Typography>}>
                <ProblemCardWrapper
                  step={step}
                  idx={idx}
                  seed={seed}
                  lesson={lesson}
                  problem={problem}
                  giveStuFeedback
                  giveStuHints
                  giveStuBottomHint
                  unlockFirstHint
                  giveHintOnIncorrect
                  keepMCOrder
                  keyboardType={undefined}
                  answerMade={NOOP}
                  clearStateOnPropChange={lessonID}
                />
              </Suspense>
              {idx < problem.steps.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>
      );
    });

  // topics header
  const topicsText = lesson && lesson.topics
    ? Array.isArray(lesson.topics)
      ? lesson.topics.join(', ')
      : String(lesson.topics)
    : '';

  return (
    <Box className={classes.root}>
      <AppBar position="static">
                    <Toolbar>
                        <Grid
                            container
                            spacing={0}
                            role={"navigation"}
                            alignItems={"center"}
                        >
                            <Grid item xs={3} key={1}>
                                <BrandLogoNav
                                    
                                />
                            </Grid>
                            <Grid item xs={6} key={2}>
                                <div
                                    style={{
                                        textAlign: "center",
                                        textAlignVertical: "center",
                                        paddingTop: "3px",
                                    }}
                                >
                                    {lesson?.name}{topicsText && `: ${topicsText}`}
                                </div>
                            </Grid>
                            <Grid item xs={3} key={3}>
                                <div
                                    style={{
                                        textAlign: "right",
                                        paddingTop: "3px",
                                    }}
                                >
                                </div>
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>

      <Container maxWidth="lg" className={classes.container}>
        {visibleProblems.length
          ? renderList(visibleProblems)
          : <Typography align="center">Loading problems…</Typography>
        }
      </Container>

      <Box className={classes.footer}>
        <Typography variant="body2">
          {SHOW_COPYRIGHT && `© ${new Date().getFullYear()} ${SITE_NAME}`}
        </Typography>
        <div className={classes.spacer}/>
        <IconButton onClick={()=>setShowPopup(true)} title={`About ${SITE_NAME}`}>
          <HelpOutlineOutlinedIcon/>
        </IconButton>
      </Box>

      <Popup isOpen={showPopup} onClose={()=>setShowPopup(false)}>
        <About/>
      </Popup>
    </Box>
  );
};

export default withTranslation(ViewAllProblems);
