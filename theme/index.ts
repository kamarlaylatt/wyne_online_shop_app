import { MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';
import { colors } from './colors';

export function getTheme(isDark: boolean): MD3Theme {
  if (isDark) {
    return {
      ...MD3DarkTheme,
      colors: {
        ...MD3DarkTheme.colors,
        ...colors.dark,
      },
    };
  }
  return {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      ...colors.light,
    },
  };
}
