const styles = theme => ({
    card: {
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: 32,
    },
    hintCard: {
        width: '40em',
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
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 10,
        paddingRight: 10,
        width: "20%"
    },

    stepHeader: {
        //textAlign: 'center',
        fontSize: 20,
        marginTop: 0,
        marginBottom: 20
        //marginLeft: 10
    },

    stepBody: {
        //textAlign: 'center',
        fontSize: 20,
        marginTop: 10,
        marginLeft: 10
    },

    inputField: {
        width: '100%',
        textAlign: 'center',
        //marginLeft: '19em'

    },

    muiUsedHint: {
        borderWidth: '1px',
        borderColor: 'GoldenRod !important'
    },

    inputHintField: {
        width: '10em',
        //marginLeft: '16em',
    },

    center: {
        marginLeft: '19em',
        marginRight: '19em',
        marginTop: '1em'
    },

    checkImage: {
        width: '3em',
        marginLeft: '0.5em',
    },

    root: {
        flexGrow: 1,
    },

    paper: {
        padding: theme.spacing(3, 2),
    },

    // Problem
    prompt: {
        marginLeft: 0,
        marginRight: 0,
        marginTop: 20,
        marginBottom: 32,
        textAlign: 'left',
        fontSize: 20,
        fontFamily: 'Titillium Web, Inter, sans-serif',
    },
    titleCard: {
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingBottom: 0,
    },
    problemHeader: {
        fontSize: 22,
        fontWeight: 700,
        marginTop: 0,
    },
    problemBody: {
        fontSize: 18,
        marginTop: 0,
    },
    problemStepHeader: {
        fontSize: 25,
        marginTop: 0,
        marginLeft: 10
    },
    problemStepBody: {
        fontSize: 20,
        marginTop: 10,
        marginLeft: 10
    },
    textBox: {
        paddingLeft: 70,
        paddingRight: 70,
    },
    textBoxHeader: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    textBoxLatex: {
        border: "1px solid #c4c4c4",
        borderRadius: "4px",
        '&:hover': {
            border: "1px solid #000000",
        },
        '&:focus-within': {
            border: "2px solid #3f51b5",
        },
        height: 50,
        width: '100%',
        '& > .mq-editable-field': {
            display: 'table',
            tableLayout: 'fixed'
        },
        '& > * > *[mathquill-block-id]': {
            height: 50,
            display: 'table-cell',
            paddingBottom: 5
        }
    },
    textBoxLatexIncorrect: {
        boxShadow: "0 0 0.75pt 0.75pt red",
        '&:focus-within': {
            border: "1px solid red",
        },
    },
    textBoxLatexUsedHint: {
        boxShadow: "0 0 0.75pt 0.75pt GoldenRod",
        '&:focus-within': {
            border: "1px solid GoldenRod",
        },
    },


    toolbarOffset: theme.mixins.toolbar,

    secondBarOffset: {
        top: 56,
        [theme.breakpoints.up("sm")]: {
            top: 64,
        },
        position: 'fixed',
        zIndex: theme.zIndex.appBar,
    },

    drawerPaper: {
        top: 112,
        height: 'calc(100vh - 112px)',
        [theme.breakpoints.up('sm')]: {
            top: 120,
            height: 'calc(100vh - 120px)',
        },
        zIndex: theme.zIndex.drawer,
    },

    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(3),
    }
});

export default styles;
