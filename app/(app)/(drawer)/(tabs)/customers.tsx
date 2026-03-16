import React, { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, List, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCustomers } from '@/hooks/useCustomers';
import type { Customer } from '@/types/models';

export default function CustomersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: customers, isPending, isError, refetch } = useCustomers();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (isPending) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
        <FAB icon="plus" style={styles.fab} onPress={() => router.push('/(app)/customer/create')} />
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
        <FAB icon="plus" style={styles.fab} onPress={() => router.push('/(app)/customer/create')} />
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: Customer }) => (
    <List.Item
      title={item.name}
      description={`${item.phone ?? '—'} • ${item.address ?? '—'}`}
      onPress={() => router.push(`/(app)/customer/${item.id}`)}
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
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      />
      <FAB icon="plus" style={styles.fab} onPress={() => router.push('/(app)/customer/create')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: 88 },
  separator: { height: StyleSheet.hairlineWidth },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
