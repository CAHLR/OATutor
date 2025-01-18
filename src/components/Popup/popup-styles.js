export const popupStyles = {
    popupContent: {
        background: '#FFF',
        padding: '10px 20px 20px 20px',
        borderRadius: '8px',
        position: 'absolute',
        top: '50%', 
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '53%',
        maxHeight: '77%',
        fontSize: '19px',
        overflowY: 'scroll',
        scrollbarWidth: 'none',
        '& ul': {
            paddingLeft: '15px',
        },
        '& h2, & h3': {
            marginBottom: '5px',
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
        fontSize: 18
    }
};