import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, List, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCustomers } from '@/hooks/useCustomers';
import type { Customer } from '@/types/models';

export default function CustomersScreen() {
  const theme = useTheme();
  const { data: customers, isPending, isError } = useCustomers();

  if (isPending) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !customers?.length) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 40 }}>👥</Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
            No customers
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: Customer }) => (
    <List.Item
      title={item.name}
      description={`${item.phone ?? '—'} • ${item.address ?? '—'}`}
      left={(props) => <List.Icon {...props} icon="account" />}
      style={{ backgroundColor: theme.colors.surface }}
    />
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={customers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: 16 },
  separator: { height: StyleSheet.hairlineWidth },
});
