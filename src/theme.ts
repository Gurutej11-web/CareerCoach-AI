import { createTheme, PaletteMode, ThemeOptions } from '@mui/material';

const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: '#4F46E5',
      light: '#818CF8',
      dark: '#3730A3',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#06B6D4',
      light: '#67E8F9',
      dark: '#0E7490',
      contrastText: '#FFFFFF',
    },
    ...(mode === 'light'
      ? {
          background: {
            default: '#F8FAFC',
            paper: '#FFFFFF',
          },
        }
      : {
          background: {
            default: '#0F172A',
            paper: '#1E293B',
          },
        }),
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' as const },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(79, 70, 229, 0.35)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          transition: 'box-shadow 0.3s ease, background-color 0.3s ease',
        },
      },
    },
  },
});

export const getAppTheme = (mode: PaletteMode) => createTheme(getDesignTokens(mode));
