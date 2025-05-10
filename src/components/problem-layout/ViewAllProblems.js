// src/pages/ViewAllProblems.js
import React, {
  useEffect,
  useState,
  useMemo,
  lazy,
  Suspense,
  useContext,
  useRef,
  useLayoutEffect,
} from 'react';
import { useParams } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Container,
  Grid,
  Divider,
  Typography,
  IconButton,
  Card,
  CardContent,
} from '@material-ui/core';
import styles from "./common-styles.js";
import { withStyles } from '@material-ui/core/styles';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';

import BrandLogoNav from '@components/BrandLogoNav';
import Popup from '@components/Popup/Popup';
import About from '../../pages/Posts/About';

import {
  findLessonById,
  ThemeContext,
  SHOW_COPYRIGHT,
  SITE_NAME,
} from '../../config/config.js';
import { CONTENT_SOURCE } from '@common/global-config';
import { renderText, chooseVariables } from '../../platform-logic/renderText.js';
import withTranslation from '../../util/withTranslation.js';

import { VariableSizeList as List } from 'react-window';

const ROW_GAP = 16;

// Code-split the heavy ProblemCardWrapper
const ProblemCardWrapper = lazy(() =>
  import('@components/problem-layout/ProblemCardWrapper')
);

const ViewAllProblems = ({ classes, translate }) => {
  const { lessonID } = useParams();
  const context = useContext(ThemeContext);
  const listRef = useRef();
  const sizeMap = useRef({});

  const [lesson, setLesson] = useState(null);
  const [problemPool, setProblemPool] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [seed] = useState(() => Date.now().toString());

  // 1) Lazy-load the JSON pool
  useEffect(() => {
    import(
      `@generated/processed-content-pool/${CONTENT_SOURCE}.json`
    )
      .then(module => setProblemPool(module.default))
      .catch(err => console.error('Failed to load problems', err));
  }, []);

  // 2) Load the lesson object
  useEffect(() => {
    const l = findLessonById(lessonID);
    if (l) {
      setLesson(l);
    }
  }, [lessonID]);

  // 3) Memoize the filtered list
  const filteredProblems = useMemo(() => {
    if (!lesson || !problemPool.length) return [];
    return problemPool.filter(problem =>
      problem.steps.some(step => {
        const kcs = context.skillModel[step.id] || [];
        return kcs.some(kc => kc in lesson.learningObjectives);
      })
    );
  }, [lesson, context.skillModel, problemPool]);

  // 4) Reset measurements when content changes
  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0, true);
    }
  }, [filteredProblems]);

  // 5) Size getter: use measured height or fallback (including gap)
  const getItemSize = index => sizeMap.current[index] || 400 + ROW_GAP;

  // 6) Row renderer with measurement
  const Row = ({ index, style }) => {
    const problem = filteredProblems[index];
    const rowRef = useRef(null);

    useLayoutEffect(() => {
      if (!rowRef.current) return;
      const contentHeight = rowRef.current.getBoundingClientRect().height;
      const totalHeight = contentHeight + ROW_GAP;
      if (sizeMap.current[index] !== totalHeight) {
        sizeMap.current[index] = totalHeight;
        listRef.current.resetAfterIndex(index);
      }
    }, [filteredProblems, index]);

    return (
      <Box ref={rowRef} style={style} px={2}>
        <Card className={classes.titleCard} elevation={2}>
          <CardContent>
            <Typography
              variant="h5"
              component="h2"
              className={classes.problemHeader}
              align="center"
              gutterBottom
            >
              {renderText(
                problem.title,
                problem.id,
                chooseVariables(problem.variabilization, seed),
                context
              )}
            </Typography>
            <Divider />
            <Typography
              component="div"
              className={classes.problemBody}
              align="center"
            >
              {renderText(
                problem.body,
                problem.id,
                chooseVariables(problem.variabilization, seed),
                context
              )}
            </Typography>
          </CardContent>
        </Card>

        {problem.steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <Box display="flex" justifyContent="center" mt={2}>
              <Box width="100%" maxWidth={1000}>
                <Suspense fallback={<Typography>Loading step…</Typography>}>
                  <ProblemCardWrapper
                    step={step}
                    index={idx}
                    seed={seed}
                    problemID={problem.id}
                    problemVars={problem.problemVars || {}}
                    lesson={lesson}
                    courseName={problem.courseName}
                    giveStuFeedback
                    giveStuHints
                    giveStuBottomHint
                    unlockFirstHint
                    giveHintOnIncorrect
                    keepMCOrder
                    keyboardType={undefined}
                    answerMade={() => {}}
                    clearStateOnPropChange={lessonID}
                  />
                </Suspense>
              </Box>
            </Box>
            {idx < problem.steps.length - 1 && (
              <Divider style={{ margin: `${ROW_GAP}px 0` }} />
            )}
          </React.Fragment>
        ))}
      </Box>
    );
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{ backgroundColor: '#F6F6F6', minHeight: '100vh' }}
    >
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item xs={3}>
              <BrandLogoNav />
            </Grid>
            <Grid
              item
              xs={6}
              style={{ textAlign: 'center', paddingTop: 3 }}
            >
              {lesson?.name} {lesson?.topics}
            </Grid>
            <Grid item xs={3} style={{ textAlign: 'right' }} />
          </Grid>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" style={{ flexGrow: 1, padding: '16px 0' }}>
        <List
          ref={listRef}
          height={window.innerHeight - 200}
          itemCount={filteredProblems.length}
          itemSize={getItemSize}
          width="100%"
          overscanCount={5}
        >
          {Row}
        </List>
      </Container>

      {/* Footer */}
      <Box display="flex" alignItems="center" p={2}>
        <Box fontSize={16} flexGrow={1}>
          {SHOW_COPYRIGHT && <>{`© ${new Date().getFullYear()} ${SITE_NAME}`}</>}
        </Box>
        <IconButton
          aria-label="about"
          title={`About ${SITE_NAME}`}
          onClick={() => setShowPopup(true)}
        >
          <HelpOutlineOutlinedIcon htmlColor="#000" style={{ fontSize: 36 }} />
        </IconButton>
        <Popup isOpen={showPopup} nClose={() => setShowPopup(false)}>
          <About />
        </Popup>
      </Box>
    </Box>
  );
};

export default withStyles(styles)(withTranslation(ViewAllProblems));
