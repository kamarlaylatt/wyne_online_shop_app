import React, { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Badge, FAB, List, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSuppliers } from '@/hooks/useSuppliers';
import type { Supplier } from '@/types/models';

export default function SuppliersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: suppliers, isPending, isError, refetch } = useSuppliers();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (isPending) {
    return (
      <SafeAreaView edges={['left', 'right']} style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
        <FAB icon="plus" style={styles.fab} onPress={() => router.push('/(app)/supplier/create')} />
      </SafeAreaView>
    );
  }

  if (isError || !suppliers?.length) {
    return (
      <SafeAreaView edges={['left', 'right']} style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 40 }}>🏭</Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
            No suppliers
          </Text>
        </View>
        <FAB icon="plus" style={styles.fab} onPress={() => router.push('/(app)/supplier/create')} />
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: Supplier }) => (
    <List.Item
      title={item.name}
      description={`${item.phone ?? item.email ?? '—'}`}
      onPress={() => router.push(`/(app)/supplier/${item.id}`)}
      left={(props) => <List.Icon {...props} icon="factory" />}
      right={() =>
        item._count != null ? (
          <View style={styles.badgeContainer}>
            <Badge style={{ backgroundColor: theme.colors.primary }}>{item._count.purchaseItems}</Badge>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>items</Text>
          </View>
        ) : null
      }
      style={{ backgroundColor: theme.colors.surface }}
    />
  );

  return (
    <SafeAreaView edges={['left', 'right']} style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={suppliers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      />
      <FAB icon="plus" style={styles.fab} onPress={() => router.push('/(app)/supplier/create')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: 88 },
  separator: { height: StyleSheet.hairlineWidth },
  badgeContainer: { justifyContent: 'center', alignItems: 'center', paddingRight: 8, gap: 2 },
  fab: { position: 'absolute', right: 25, bottom: 70 },
});
