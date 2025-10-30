import React from 'react';
import AgentChatbox from './AgentChatbox';

/**
 * Integration wrapper for the AI Agent in OATutor
 * This component handles the data flow between OATutor and the AI Agent
 */
const AgentIntegration = (props) => {
    // Extract all the necessary props that the agent needs
    const agentProps = {
        // Problem context
        problem: props.problem,
        step: props.step,
        lesson: props.lesson,
        courseName: props.courseName,
        problemVars: props.problemVars,
        seed: props.seed,

        // Student state
        inputVal: props.inputVal,
        isCorrect: props.isCorrect,
        attempts: props.attempts,
        hintsFinished: props.hintsFinished,
        user: props.user,
        bktParams: props.bktParams,

        // Additional context
        problemID: props.problemID,
        stepID: props.stepID,
        lessonID: props.lessonID
    };

    return <AgentChatbox {...agentProps} />;
};

export default AgentIntegration;
