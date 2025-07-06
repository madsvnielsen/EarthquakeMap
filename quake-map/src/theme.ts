
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark', // or 'light'
    primary: {
      main: '#F9F3EF',
    },
    secondary: {
      main: '#D2C1B6',
    },
    background: {
        default: '#1B3C53',   // <-- Your desired background
        paper: '#456882',     // optional: background for cards/dialogs
      },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    // Customize buttons
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 'bold',
        },
      },
    },

    // Customize slider
    MuiSlider: {
      styleOverrides: {
       
      },
    },

    // Customize date picker (applies to TextField used by DatePicker)
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          color: '#fff',
        },
        
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
        },
      },
    },
  },
});