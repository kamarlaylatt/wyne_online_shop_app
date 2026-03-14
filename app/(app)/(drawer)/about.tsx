import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
  const theme = useTheme();
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={{ fontSize: 64, textAlign: 'center' }}>🛒</Text>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.primary }]}>
          Wyne Online Shop
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Admin Management App
        </Text>
        <Divider style={styles.divider} />
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Version 1.0.0
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
          Manage suppliers, inventory, orders, and customers from one place.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  title: { fontWeight: '700', textAlign: 'center' },
  subtitle: { textAlign: 'center' },
  divider: { width: '60%', marginVertical: 16 },
});
