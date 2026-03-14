import React from 'react';
import { StyleSheet } from 'react-native';
import { List, Switch, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '@/contexts/ThemeContext';

export default function SettingsScreen() {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useThemeContext();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <List.Section>
        <List.Subheader style={{ color: theme.colors.primary }}>Appearance</List.Subheader>
        <List.Item
          title="Dark Mode"
          description="Switch between light and dark theme"
          left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => (
            <Switch value={isDarkMode} onValueChange={toggleTheme} color={theme.colors.primary} />
          )}
        />
      </List.Section>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
