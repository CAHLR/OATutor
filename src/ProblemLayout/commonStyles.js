const styles = theme => ({
  card: {
    width: '65%',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 20
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
    backgroundColor: '#8c94ff',
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
    marginLeft: 10
  },

  stepBody: {
    //textAlign: 'center',
    fontSize: 20,
    marginTop: 10,
    marginBottom: 30,
    marginLeft: 10
  },

  inputField: {
    width: '100%',
    textAlign: 'center',
    //marginLeft: '19em'

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
    marginRight: '4.3em'
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
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Titillium Web, sans-serif',
  },
  titleCard: {
    width: '75%',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingBottom: 0,
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

});

export default styles;