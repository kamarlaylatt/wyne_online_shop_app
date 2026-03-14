import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const stats = [
  { label: 'Total Orders', value: '—', icon: '📋' },
  { label: 'Paid Orders', value: '—', icon: '💰' },
  { label: 'Inventory Items', value: '—', icon: '📦' },
  { label: 'Total Customers', value: '—', icon: '👥' },
];

export default function DashboardScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={[styles.heading, { color: theme.colors.onBackground }]}>
          Dashboard
        </Text>
        <View style={styles.grid}>
          {stats.map((stat) => (
            <Card key={stat.label} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.cardContent}>
                <Text style={styles.icon}>{stat.icon}</Text>
                <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                  {stat.value}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {stat.label}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16 },
  heading: { fontWeight: '700', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%' },
  cardContent: { alignItems: 'center', padding: 16, gap: 4 },
  icon: { fontSize: 28 },
});
