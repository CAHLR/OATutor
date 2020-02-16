import React, { useState }  from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ProblemCard from './ProblemCard'
import {animateScroll as scroll, scroller, Element} from "react-scroll";
import {update, knowledgeComponentModels} from '../BKT/BKTBrains'
import { nextProblem } from '../ProblemLogic/problemIndex'

export default function Problem(props) {
    // let problem = nextProblem(knowledgeComponentModels);
    const [problemData, updateProblem] = useState(props.problem);
    var partStates = {};
    var numCorrect = 0;


    const parts = problemData.parts.map(function(part, index) {
        partStates[index] = null;
        return <Element name={index.toString()} key={Math.random()}>
            <ProblemCard part={part} index={index} answerMade = {answerMade} firebase={props.firebase}/>
        </Element>
    }
    );

    function answerMade(cardIndex, kcArray, isCorrect) {
        if (partStates[cardIndex] === true) { return }
        partStates[cardIndex] = isCorrect;
        
        for (var kc of kcArray) {
            console.log(kc);
            update(knowledgeComponentModels[kc], isCorrect);
            console.log(knowledgeComponentModels[kc].probMastery);
        }
        

        if (isCorrect) {
            numCorrect += 1;
            if (numCorrect === Object.keys(partStates).length) {
                scroll.scrollToTop({duration: 900});
                partStates = {};
                numCorrect = 0;

                const problem = nextProblem();
                setTimeout(function(){ updateProblem(problem); }, 900)

            } else {
                scroller.scrollTo((cardIndex + 1).toString(), {
                    duration: 500,
                    smooth: true
                })
            }
        }
    }

    const classes = useStyles();

    return (
        <div>
            <div className={classes.prompt}>
                {problemData.prompt}
                <hr/>

            </div>
            {parts}
        </div>
    );
}

const useStyles = makeStyles({
    prompt: {
        marginLeft: 50,
        marginRight: 50,
        marginTop: 20,
        textAlign: 'center',
        fontSize: 30,
        fontFamily: 'Titillium Web, sans-serif',
    },
});