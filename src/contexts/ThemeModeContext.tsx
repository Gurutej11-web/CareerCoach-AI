import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, PaletteMode } from '@mui/material';
import { getAppTheme } from '../theme';

interface ThemeModeContextType {
  mode: PaletteMode;
  toggleMode: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined);

const STORAGE_KEY = 'careercoach-theme-mode';
const CONTRAST_STORAGE_KEY = 'careercoach-high-contrast';

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem(CONTRAST_STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(CONTRAST_STORAGE_KEY, String(highContrast));
  }, [highContrast]);

  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  const toggleHighContrast = () => setHighContrast((prev) => !prev);

  const theme = useMemo(() => getAppTheme(mode, highContrast), [mode, highContrast]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode, highContrast, toggleHighContrast }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = (): ThemeModeContextType => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
};
