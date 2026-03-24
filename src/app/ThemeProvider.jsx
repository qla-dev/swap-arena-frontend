import React, { createContext, useContext, useMemo } from 'react';

import { colors, spacing, typography, radius, shadows } from '@/theme';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ mode, children }) => {
  const value = useMemo(() => ({
    mode,
    colors: colors[mode] || colors.dark,
    spacing,
    typography,
    radius,
    shadows
  }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return theme;
};
