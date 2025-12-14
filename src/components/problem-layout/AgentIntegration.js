import React from 'react';
import AgentChatbox from './AgentChatbox';

/**
 * AgentIntegration.js
 * 
 * Wrapper component that connects Problem.js to AgentChatbox
 * Extracts and passes necessary context from Problem.js
 */
class AgentIntegration extends React.Component {
    render() {
        const {
            problem,
            lesson,
            seed,
            problemVars,
            stepStates,
            bktParams,
            getActiveStepData,
            attemptHistory,
            user
        } = this.props;

        return (
            <AgentChatbox
                problem={problem}
                lesson={lesson}
                seed={seed}
                problemVars={problemVars}
                stepStates={stepStates}
                bktParams={bktParams}
                getActiveStepData={getActiveStepData}
                attemptHistory={attemptHistory}
                user={user}
            />
        );
    }
}

export default AgentIntegration;
