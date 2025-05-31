import {createTheme, responsiveFontSizes} from '@material-ui/core/styles';

let theme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#4C7D9F', //dark blue color
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ecbc5c', //yellow
    }, 
    background: {
      default: '#F6F8FA', //light blue-white
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#555',
    },
  },
  typography: {
    fontFamily: "'Titillium Web', Inter, Roboto, sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: '3rem',
    },
    body1: {
      fontSize: '1rem',
    },
  },

  props: {
  MuiButton: {
    variant: 'contained',  
    color: 'primary',     
    },
  },
  overrides: {
    MuiButton: {
      containedPrimary: {
        backgroundColor: '#4C7D9F', 
        color: '#ffffff',
        fontWeight: 600,
        '&:hover': {
          backgroundColor: '#44708F', 
        },
        '&:disabled': {
          backgroundColor: '#e0e0e0', 
          color: '#9e9e9e',
        },
      },
    },
  },

});


theme = responsiveFontSizes(theme);
export {theme};