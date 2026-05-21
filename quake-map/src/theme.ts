import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff8a5b',
      light: '#ffb48f',
      dark: '#d96234',
      contrastText: '#08131c',
    },
    secondary: {
      main: '#6fd6c2',
      light: '#a9f0e1',
      dark: '#3ca693',
    },
    background: {
      default: '#07141d',
      paper: '#102432',
    },
    text: {
      primary: '#f4f7fb',
      secondary: '#9fb3c8',
    },
    divider: 'rgba(170, 198, 221, 0.14)',
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
    h4: {
      fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.04em',
    },
    h5: {
      fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h6: {
      fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            'radial-gradient(circle at top, rgba(29, 63, 88, 0.65), transparent 34%), linear-gradient(180deg, #07141d 0%, #0b1f2b 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(14px)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 16,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(9, 21, 31, 0.72)',
          borderRadius: 14,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          backdropFilter: 'blur(12px)',
        },
      },
    },
  },
});
