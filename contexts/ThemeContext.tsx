import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3Theme } from 'react-native-paper';
import { getTheme } from '@/theme';

const THEME_KEY = 'wyne-admin-theme';

interface ThemeContextValue {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: MD3Theme;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDarkMode: false,
  toggleTheme: () => {},
  theme: getTheme(false),
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val === 'dark') setIsDarkMode(true);
    });
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme: getTheme(isDarkMode) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
