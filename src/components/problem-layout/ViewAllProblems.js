import React, {
  useEffect,
  useState,
  useMemo,
  useContext,
} from 'react';
import { useParams } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Container,
  Grid,
  IconButton,
  Box,
  Typography,
  makeStyles,
} from '@material-ui/core';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';

import BrandLogoNav from '@components/BrandLogoNav';
import Popup from '@components/Popup/Popup';
import About from '../../pages/Posts/About';
import ProblemWrapper from '@components/problem-layout/ProblemWrapper';
import { findLessonById, ThemeContext, SHOW_COPYRIGHT, SITE_NAME } from '../../config/config.js';
import { CONTENT_SOURCE } from '@common/global-config';
import withTranslation from '../../util/withTranslation.js';

import userIcon from "../../assets/UserThumb.svg";
import FeedbackOutlinedIcon from "@material-ui/icons/FeedbackOutlined";
import leftArrow from "../../assets/chevron-left.svg";

import { withRouter } from 'react-router-dom';

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
    position: 'relative',  // allow absolute positioning of id badge
    marginBottom: theme.spacing(4),
  },
  noFooterWrapper: {
    '& footer': {
      display: 'none',
    },
    '& div[width="100%"]': {
      display: 'none',
    },
    paddingRight: theme.spacing(8),
  },
  loadingBox: {
    textAlign: 'center',
    padding: theme.spacing(2),
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
  idBadge: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
  },
}));

const BATCH_SIZE = 3;

const ViewAllProblems = ({ translate, history }) => {
  const classes = useStyles();
  const { lessonID } = useParams();
  const context = useContext(ThemeContext);

  const [lesson, setLesson] = useState(null);
  const [problemPool, setProblemPool] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [visibleProblems, setVisibleProblems] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [seed] = useState(() => Date.now().toString());

  const studentNameDisplay = context.studentName
  ? decodeURIComponent(context.studentName)
  : translate('platform.LoggedIn');

  // no-op handlers for ProblemWrapper
  const displayMastery = () => {};
  const problemComplete = () => {};

  // Load pool
  useEffect(() => {
    import(`@generated/processed-content-pool/${CONTENT_SOURCE}.json`)
      .then(m => setProblemPool(m.default || []))
      .catch(console.error);
  }, []);

  // Find lesson
  useEffect(() => {
    const found = findLessonById(lessonID);
    if (found) setLesson(found);
  }, [lessonID]);

  // Filter by objectives
  const memoFiltered = useMemo(() => {
    if (!lesson || problemPool.length === 0) return [];
    const pool = problemPool.filter(problem =>
      problem.steps.some(step =>
        (context.skillModel[step.id] || []).some(kc => kc in lesson.learningObjectives)
      )
    );

    return pool;
  }, [lesson, problemPool, context.skillModel]);

  useEffect(() => {
    setFilteredProblems(memoFiltered);
  }, [memoFiltered]);

  // Chunk rendering
  useEffect(() => {
  setVisibleProblems(filteredProblems);
}, [filteredProblems]);

  // Safely build topics string
  const topicsText = lesson?.topics
    ? Array.isArray(lesson.topics)
      ? lesson.topics.join(', ')
      : String(lesson.topics)
    : '';

  const togglePopup = () => setShowPopup(prev => !prev);

  return (
    <Box className={classes.root}>


      <AppBar position="static" style = {{backgroundColor: '#FFFFFF'}}>
        <Toolbar>
          <Grid 
            container 
            spacing={0}
            role={"navigation"}
            alignItems={"center"}            
          >

            <Grid item xs={3}><BrandLogoNav /></Grid>
            <Grid item xs={6} style={{ textAlign: 'center' }}> </Grid>
            <Grid xs = {3} item key={3}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center", 
                        gap: "9px",
                        color: "#344054",
                    }}
                >
                    <img src={userIcon} alt="User Icon" />
                    <div style={{ fontWeight: 600 }}>
                        {studentNameDisplay}
                    </div>
                </div>
            </Grid>

          </Grid>
        </Toolbar>
      </AppBar>

      <AppBar position="static" >
          <Toolbar style={{ minHeight: '56px'}}>
              <Grid
                  container
                  spacing={0}
                  role={"secondary-navigation"}
                  alignItems={"center"}
              >
                  <Grid item xs={9} key={1}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-start",
                            alignItems: "center", 
                            gap: "8px"
                        }}
                    >
                        <IconButton 
                          onClick = {() => history.goBack()}
                          aria-label = "Back" 
                        >
                          <img src={leftArrow} alt="Back Arrow" />

                        </IconButton>
                    </div>
                  </Grid>


                  <Grid xs = {3} item key={3}>
                      <div
                          style={{
                              display: "flex",
                              flexGrow: 1,
                              justifyContent: "flex-end",
                              border: 'none'
                          }}
                      >

                          <IconButton
                              aria-label="about"
                              title={`About ${SITE_NAME}`}
                              onClick={togglePopup}
                          >
                              <HelpOutlineOutlinedIcon
                                  htmlColor={"#ffffff"}
                                  style={{
                                      fontSize: 36,
                                      margin: -2,
                                  }}
                              />
                          </IconButton>

                      </div>
                      <Popup isOpen={showPopup} onClose={togglePopup}>
                          <About />
                      </Popup>
                      
                  </Grid>

              </Grid>
          </Toolbar>
      </AppBar>


      <Container maxWidth="med" className={classes.container}>
        {visibleProblems.length ? visibleProblems.map(problem => (
          <Box key={problem.id} className={classes.problemCard}>
            {/* ID badge */}
            <Box className={classes.idBadge} style ={{marginRight: 20}}>
              <Typography variant="caption" color="textSecondary">
                {problem.id}
              </Typography>
            </Box>
            <Box className={classes.noFooterWrapper}>
              <ProblemWrapper
                autoScroll={false}
                problem={problem}
                lesson={lesson}
                seed={seed}
                clearStateOnPropChange={lessonID}
                displayMastery={displayMastery}
                problemComplete={problemComplete}
              />
            </Box>
          </Box>
        )) : (
          <Box className={classes.loadingBox}>
            <Typography>{translate('loadingProblems') || 'Loading problems…'}</Typography>
          </Box>
        )}
      </Container>

      <Box className={classes.footer}>
        <Box component="span">
          {SHOW_COPYRIGHT && `© ${new Date().getFullYear()} ${SITE_NAME}`}
        </Box>
        <Box className={classes.spacer} />
        {/* <IconButton onClick={() => setShowPopup(true)} title={`About ${SITE_NAME}`}>
          <HelpOutlineOutlinedIcon />
        </IconButton> */}
      </Box>

      {/* <Popup isOpen={showPopup} onClose={() => setShowPopup(false)}>
        <About />
      </Popup> */}
    </Box>
  );
};

export default withTranslation(withRouter(ViewAllProblems));
