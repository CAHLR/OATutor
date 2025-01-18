export const popupStyles = {
    popupContent: {
        background: '#FFF',
        padding: '0px 30px 30px 30px',
        borderRadius: '8px',
        position: 'absolute',
        top: '50%', 
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '1080px',
        maxWidth: '95vw',
        maxHeight: '95vh',
        fontSize: '16px',
        overflowY: 'scroll',
        scrollbarWidth: 'none',
        '& ul': {
            paddingLeft: '30px',
            marginTop: '0px',
        },
        '& h2, & h3': {
            marginBottom: '0px',
        },
    },
    button: {
        position: 'absolute',
        top: '5px',
        right: '5px',
        fontSize: '20px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
    },
    iconButton: {
        backgroundColor: '#E5E5E5', 
        color: '#4F4F4F', 
        borderRadius: '50%', 
        padding: '0.5px', 
        fontSize: 24
    }
};