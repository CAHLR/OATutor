import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

// This reload icon is used to regenerate ChatGPT generated hints
const ReloadIconButton = ({ onClick }) => (
    <Tooltip title="Regenerate Hint">
        <IconButton onClick={onClick} aria-label="regenerate">
            <img 
                src={`${process.env.PUBLIC_URL}/static/images/icons/reload.png`} 
                alt="Reload Icon" 
                style={{ width: '24px', height: '24px' }} 
            />
        </IconButton>
    </Tooltip>
);

export default ReloadIconButton;
