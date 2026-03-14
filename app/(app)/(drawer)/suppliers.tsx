import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SuppliersScreen() {
  const theme = useTheme();
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.center}>
        <Text style={{ fontSize: 40 }}>🏭</Text>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
          No suppliers
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
