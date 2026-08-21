import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { chooseVariables, renderText } from '../../platform-logic/renderText.js';
import { ThemeContext } from '../../config/config.js';
import { ReactComponent as LightbulbIcon } from '../../assets/lightbulb.svg';
import { ReactComponent as EyeIcon } from '../../assets/eye.svg';
import { ReactComponent as LeftIcon } from '../../assets/left.svg';
import { ReactComponent as RightIcon } from '../../assets/right.svg';

const styles = () => ({
    card: {
        backgroundColor: '#ffffff',
        border: '1px solid rgba(163, 197, 222, 0.75)',
        borderRadius: 12,
        boxShadow: '0 4px 14px rgba(31, 41, 51, 0.08)',
        padding: '16px 18px',
        color: '#1f2933',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 8,
    },
    titleWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        color: '#3f7091',
        fontWeight: 800,
    },
    icon: {
        width: 24,
        height: 24,
        flexShrink: 0,
    },
    hideButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        border: 'none',
        background: 'transparent',
        color: '#3f7091',
        cursor: 'pointer',
        fontWeight: 700,
        padding: 0,
        fontSize: 13,
    },
    body: {
        fontSize: 15,
        lineHeight: 1.55,
        paddingLeft: 34,
    },
    hintTitle: {
        fontWeight: 800,
        marginBottom: 4,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(163, 197, 222, 0.45)',
        margin: '14px 0 10px',
    },
    navRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    navButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        border: 'none',
        background: 'transparent',
        color: '#3f7091',
        cursor: 'pointer',
        fontWeight: 800,
        padding: 0,
        fontSize: 14,
        '&:disabled': {
            cursor: 'default',
            opacity: 0.38,
        },
    },
});

function AvatarHintCardBase(props) {
    const {
        classes,
        hint,
        hintIndex,
        totalHints,
        payload,
        hasPreviousHint,
        hasNextHint,
        onPrevious,
        onNext,
        onHide,
    } = props;
    const context = React.useContext(ThemeContext);

    if (!hint || !payload) {
        return null;
    }

    const vars = chooseVariables(
        Object.assign({}, payload.stepVars, hint.variabilization),
        payload.seed
    );
    const showHintTitle = hint.title && hint.title !== 'nan';

    return (
        <section
            id="avatar-compact-hint-card"
            className={classes.card}
            aria-label={`Hint ${hintIndex + 1} of ${totalHints}`}
        >
            <div className={classes.header}>
                <div className={classes.titleWrap}>
                    <LightbulbIcon className={classes.icon} aria-hidden="true" />
                    <Typography variant="subtitle2" style={{ fontWeight: 800 }}>
                        Hint {hintIndex + 1}
                    </Typography>
                </div>
                <button type="button" className={classes.hideButton} onClick={onHide}>
                    <EyeIcon className={classes.icon} aria-hidden="true" />
                    Hide hint
                </button>
            </div>

            <div className={classes.body}>
                {showHintTitle && (
                    <div className={classes.hintTitle}>
                        {renderText(hint.title, payload.problemID, vars, context)}
                    </div>
                )}
                <div>
                    {renderText(hint.text, payload.problemID, vars, context)}
                </div>
            </div>

            <div className={classes.divider} />
            <div className={classes.navRow}>
                <button
                    type="button"
                    className={classes.navButton}
                    onClick={onPrevious}
                    disabled={!hasPreviousHint}
                >
                    <LeftIcon className={classes.icon} aria-hidden="true" />
                    Previous hint
                </button>
                <button
                    type="button"
                    className={classes.navButton}
                    onClick={onNext}
                    disabled={!hasNextHint}
                >
                    Next hint
                    <RightIcon className={classes.icon} aria-hidden="true" />
                </button>
            </div>
        </section>
    );
}

export default withStyles(styles)(AvatarHintCardBase);
