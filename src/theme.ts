import { createTheme, PaletteMode, ThemeOptions } from '@mui/material';

const getDesignTokens = (mode: PaletteMode, highContrast: boolean): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: highContrast ? (mode === 'light' ? '#1E1B8F' : '#A5B4FC') : '#4F46E5',
      light: '#818CF8',
      dark: '#3730A3',
      contrastText: highContrast ? (mode === 'light' ? '#FFFFFF' : '#000000') : '#FFFFFF',
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
            default: highContrast ? '#FFFFFF' : '#F8FAFC',
            paper: '#FFFFFF',
          },
          // Only set text/divider when highContrast is on — MUI's createTheme
          // doesn't fall back to its defaults for a key that's present but
          // explicitly undefined, so setting these unconditionally as
          // `highContrast ? {...} : undefined` wipes out theme.palette.text
          // entirely in normal mode and crashes anything reading .primary off it.
          ...(highContrast && { text: { primary: '#000000', secondary: '#1A1A1A' }, divider: '#000000' }),
        }
      : {
          background: {
            default: highContrast ? '#000000' : '#0F172A',
            paper: highContrast ? '#000000' : '#1E293B',
          },
          ...(highContrast && { text: { primary: '#FFFFFF', secondary: '#EDEDED' }, divider: '#FFFFFF' }),
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
          ...(highContrast && { border: '1px solid currentColor' }),
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
          ...(highContrast && { border: '1px solid currentColor' }),
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          ...(highContrast && { border: '1px solid currentColor' }),
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          transition: 'box-shadow 0.3s ease, background-color 0.3s ease',
          ...(highContrast && { borderBottom: '1px solid currentColor' }),
        },
      },
    },
    ...(highContrast && {
      MuiButtonBase: {
        defaultProps: {
          disableRipple: false,
        },
        styleOverrides: {
          root: {
            '&.Mui-focusVisible': {
              outline: '3px solid currentColor',
              outlineOffset: '2px',
            },
          },
        },
      },
    }),
  },
});

export const getAppTheme = (mode: PaletteMode, highContrast = false) =>
  createTheme(getDesignTokens(mode, highContrast));
