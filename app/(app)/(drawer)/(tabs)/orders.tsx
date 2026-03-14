import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Chip, FAB, List, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOrders } from '@/hooks/useOrders';
import type { Order, OrderStatus } from '@/types/models';

const formatIDR = (value: number | string) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    parseFloat(String(value))
  );

const statusMode = (status: OrderStatus): 'outlined' | 'flat' => {
  if (status === 'PENDING') return 'outlined';
  return 'flat';
};

export default function OrdersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useOrders();
  const orders = data?.pages.flatMap((p) => p.data) ?? [];

  if (isPending) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
        <FAB icon="plus" style={styles.fab} onPress={() => router.push('/(app)/order/create')} />
      </SafeAreaView>
    );
  }

  if (isError || (!isPending && !orders.length)) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 40 }}>📋</Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
            No orders
          </Text>
        </View>
        <FAB icon="plus" style={styles.fab} onPress={() => router.push('/(app)/order/create')} />
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: Order }) => (
    <List.Item
      title={item.customer?.name ?? `Order ${item.id.slice(0, 8)}`}
      description={`ID: ${item.id.slice(0, 8)}... • ${formatIDR(item.totalPrice)}`}
      onPress={() => router.push(`/(app)/order/${item.id}`)}
      right={() => (
        <View style={styles.chipContainer}>
          <Chip
            mode={statusMode(item.status)}
            compact
            style={styles.chip}
          >
            {item.status}
          </Chip>
        </View>
      )}
      style={{ backgroundColor: theme.colors.surface }}
    />
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />}
        contentContainerStyle={styles.list}
        onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={styles.footer} color={theme.colors.primary} /> : null}
      />
      <FAB icon="plus" style={styles.fab} onPress={() => router.push('/(app)/order/create')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: 88 },
  chipContainer: { justifyContent: 'center', paddingRight: 8 },
  chip: { alignSelf: 'center' },
  separator: { height: StyleSheet.hairlineWidth },
  fab: { position: 'absolute', right: 16, bottom: 16 },
  footer: { paddingVertical: 16 },
});
