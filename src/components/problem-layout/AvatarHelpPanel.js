import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import AgentChatbox from './AgentChatbox';
import AvatarHintCard from './AvatarHintCard';
import { ReactComponent as LightbulbIcon } from '../../assets/lightbulb.svg';
import { ReactComponent as EyeIcon } from '../../assets/eye.svg';

const styles = () => ({
    panel: {
        width: '100%',
        overflow: 'hidden',
    },
    hintButton: {
        width: '100%',
        minHeight: 44,
        marginBottom: 7,
        borderRadius: 14,
        border: '2px solid rgba(76, 125, 159, 0.35)',
        color: '#3f7091',
        backgroundColor: '#fff',
        fontWeight: 800,
        textTransform: 'none',
        fontSize: 16,
        '&:hover': {
            backgroundColor: '#eef4fa',
            borderColor: '#4c7d9f',
        },
    },
    hintButtonIcon: {
        width: 22,
        height: 22,
        marginRight: 8,
    },
});

class AvatarHelpPanel extends React.Component {
    render() {
        const {
            classes,
            onGetHint,
            problem,
            lesson,
            seed,
            problemVars,
            stepStates,
            bktParams,
            getActiveStepData,
            attemptHistory,
            user,
            lessonMasteryMap,
            hintUsageByStep,
            avatarHint,
            avatarHintPayload,
            avatarHintIndex,
            avatarHintButtonLabel,
            avatarHintButtonDisabled,
            avatarHasPreviousHint,
            avatarHasNextHint,
            onPreviousHint,
            onNextHint,
            onHideHint,
        } = this.props;

        const totalHints = avatarHintPayload?.hints?.length || 0;
        const isHintVisible = Boolean(avatarHint);
        const HintButtonIcon = isHintVisible ? EyeIcon : LightbulbIcon;
        const hintCard = (
            <AvatarHintCard
                hint={avatarHint}
                hintIndex={avatarHintIndex}
                totalHints={totalHints}
                payload={avatarHintPayload}
                hasPreviousHint={avatarHasPreviousHint}
                hasNextHint={avatarHasNextHint}
                onPrevious={onPreviousHint}
                onNext={onNextHint}
                onHide={onHideHint}
            />
        );

        const hintButton = isHintVisible ? null : (
            <Button
                className={classes.hintButton}
                onClick={onGetHint}
                disabled={avatarHintButtonDisabled}
                aria-controls="avatar-compact-hint-card"
            >
                <HintButtonIcon
                    className={classes.hintButtonIcon}
                    aria-hidden="true"
                />
                {avatarHintButtonLabel || 'Get a hint'}
            </Button>
        );

        return (
            <aside className={classes.panel} aria-label="Avatar help panel">
                <AgentChatbox
                    mode="embedded"
                    condition="avatar_help_panel"
                    problem={problem}
                    lesson={lesson}
                    seed={seed}
                    problemVars={problemVars}
                    stepStates={stepStates}
                    bktParams={bktParams}
                    getActiveStepData={getActiveStepData}
                    attemptHistory={attemptHistory}
                    user={user}
                    lessonMasteryMap={lessonMasteryMap}
                    hintUsageByStep={hintUsageByStep}
                    embeddedHeight="min(760px, calc(100vh - 220px))"
                    allowEmbeddedClose
                    defaultOpen={false}
                    closedLauncherPlacement="floating"
                    showLauncherBubble={false}
                    afterMessagesContent={hintCard}
                    beforeInputContent={hintButton}
                    showSuggestedQuestions
                />
            </aside>
        );
    }
}

export default withStyles(styles)(AvatarHelpPanel);
