import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { IconButton, Paper, Typography } from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';
import { ReactComponent as OskiAvatar } from '../../assets/avatar_default_state.svg';
import AgentChatbox from './AgentChatbox';
import { chooseVariables, renderText } from '../../platform-logic/renderText.js';
import { ThemeContext } from '../../config/config.js';

const styles = () => ({
    root: {
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#eef4fa',
        zIndex: 2000,
    },
    header: {
        height: 56,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #4c7d9f 0%, #3f7091 100%)',
        color: 'white',
        borderBottom: '3px solid #ffc300',
        flexShrink: 0,
    },
    titleWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minWidth: 0,
    },
    avatarIcon: {
        width: 32,
        height: 32,
        display: 'block',
        flexShrink: 0,
    },
    title: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontWeight: 600,
    },
    content: {
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
    },
    questionPanel: {
        background: 'white',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        padding: '14px 16px',
        borderRadius: 0,
        boxShadow: 'none',
    },
    questionTitle: {
        fontWeight: 700,
        color: '#1b1b1b',
        marginBottom: 6,
    },
    questionBody: {
        color: '#333',
    },
    chatWrap: {
        flex: 1,
        minHeight: 0,
        display: 'flex',
    },
});

function StandaloneChatViewBase(props) {
    const { classes, lesson, problem, onExit, ...rest } = props;
    const context = React.useContext(ThemeContext);
    const title = problem?.title || lesson?.name || 'AI Tutor';
    const active = typeof props.getActiveStepData === 'function' ? props.getActiveStepData() : null;
    const step = active?.step;
    const stepIndex = typeof active?.stepIndex === 'number' ? active.stepIndex : null;
    const stepTitle = step?.stepTitle || step?.stepTitle === '' ? step.stepTitle : null;
    const stepBody = step?.stepBody || step?.stepBody === '' ? step.stepBody : null;
    const vars = chooseVariables(
        Object.assign({}, problem?.variabilization, step?.variabilization),
        props.seed
    );
    return (
        <div className={classes.root}>
            <div className={classes.header}>
                <div className={classes.titleWrap}>
                    <OskiAvatar className={classes.avatarIcon} aria-label="Oski" />
                    <Typography variant="subtitle1" className={classes.title}>
                        {title}
                    </Typography>
                </div>
                <IconButton
                    size="small"
                    onClick={onExit}
                    title="Exit standalone chat"
                    style={{ color: 'white' }}
                >
                    <CloseIcon />
                </IconButton>
            </div>
            <div className={classes.content}>
                {(stepTitle || stepBody) && (
                    <Paper className={classes.questionPanel}>
                        <Typography variant="subtitle2" className={classes.questionTitle}>
                            {stepIndex != null ? `Step ${stepIndex + 1}` : 'Current question'}
                        </Typography>
                        {stepTitle && (
                            <div className={classes.questionBody}>
                                {renderText(stepTitle, problem?.id, vars, context)}
                            </div>
                        )}
                        {stepBody && (
                            <div className={classes.questionBody} style={{ marginTop: stepTitle ? 8 : 0 }}>
                                {renderText(stepBody, problem?.id, vars, context)}
                            </div>
                        )}
                    </Paper>
                )}
                <div className={classes.chatWrap}>
                    <AgentChatbox {...rest} lesson={lesson} problem={problem} mode="embedded" />
                </div>
            </div>
        </div>
    );
}

export default withStyles(styles)(StandaloneChatViewBase);

