import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import AgentChatbox from './AgentChatbox';

const styles = () => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        width: '100%',
        background: '#eef4fa',
    },
    chatWrap: {
        flex: 1,
        minHeight: 0,
        width: '100%',
        display: 'flex',
    },
});

function StandaloneChatViewBase({ classes, lesson }) {
    return (
        <div className={classes.root}>
            <div className={classes.chatWrap}>
                <AgentChatbox
                    lesson={lesson}
                    mode="embedded"
                    officeHours
                    showEmbeddedHeader={false}
                    condition="office_hours"
                    embeddedHeight="100%"
                />
            </div>
        </div>
    );
}

export default withStyles(styles)(StandaloneChatViewBase);
