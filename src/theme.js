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
      root: {
        height: 42,
        padding: '8px 22px',
        fontFamily: 'Inter',
        fontSize: '15px',
        lineHeight: '26px',
        fontWeight: 600,
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        textTransform: 'none',
      },
      containedPrimary: {
        backgroundColor: '#4C7D9F',
        color: '#fff',
        '&:hover': {
          backgroundColor: '#3F7091',
        },
        '&:active': {
          backgroundColor: '#4C7D9F',
          border: '1px solid #326691',
        },
        '&:disabled': {
          backgroundColor: '#D1D1D1',
          color: '#888',
          boxShadow: 'none',
        },
      },
      
      containedSecondary: {
        backgroundColor: '#FFFFFF', 
        border: '1px solid #81ADCD',
        color: '#3F7092',
        boxShadow: 'none',
        '&:hover': {
          backgroundColor: 'rgba(128, 174, 206, 0.10)',
          boxShadow: 'none',
        },
        '&:active': {
          backgroundColor: '#80AECE40',
          boxShadow: 'none',
        },
        '&:disabled': {
          backgroundColor: 'rgba(0, 0, 0, 0.12)',
          color: 'rgba(0, 0, 0, 0.38)',
          boxShadow: 'none',
        },
      }
    },
}

});

theme = responsiveFontSizes(theme);
export {theme};