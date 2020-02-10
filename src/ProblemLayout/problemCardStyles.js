import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    card: {
        width: '30em',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: 20
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },

    button: {
        backgroundColor: '#8c94ff',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 10,
        paddingRight: 10,
        width: "20%"
    },

    partHeader: {
        textAlign: 'center',
        fontSize: 20,
        marginTop: 0,
    },

    partBody: {
        textAlign: 'center',
        fontSize: 30,
        marginTop: 10,
        marginBottom: 30
    },

    inputField: {
        width: '7em',
        marginLeft: '10.4em'

    },

    checkImage: {
        width: '3em',
        marginLeft: '0.5em',
        marginRight: '4.3em'
    }


});

export default useStyles;