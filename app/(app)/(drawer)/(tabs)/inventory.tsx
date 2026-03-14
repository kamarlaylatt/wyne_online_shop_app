import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, List, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePurchaseItems } from '@/hooks/useInventory';
import type { PurchaseItem } from '@/types/models';

const formatDate = (str: string) => new Date(str).toLocaleDateString('id-ID');

export default function InventoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = usePurchaseItems();
  const items = data?.pages.flatMap((p) => p.data) ?? [];

  if (isPending) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
        <FAB icon="plus" style={styles.fab} onPress={() => router.push('/(app)/purchase-item/create')} />
      </SafeAreaView>
    );
  }

  if (isError || (!isPending && !items.length)) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 40 }}>📦</Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
            No items
          </Text>
        </View>
        <FAB icon="plus" style={styles.fab} onPress={() => router.push('/(app)/purchase-item/create')} />
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: PurchaseItem }) => (
    <List.Item
      title={item.name}
      description={`Qty: ${item.quantity} • ${item.supplier?.name ?? 'Unknown Supplier'} • ${formatDate(item.purchaseDate)}`}
      onPress={() => router.push(`/(app)/purchase-item/${item.id}`)}
      left={(props) => <List.Icon {...props} icon="package-variant" />}
      style={{ backgroundColor: theme.colors.surface }}
    />
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />}
        contentContainerStyle={styles.list}
        onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={styles.footer} color={theme.colors.primary} /> : null}
      />
      <FAB icon="plus" style={styles.fab} onPress={() => router.push('/(app)/purchase-item/create')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: 88 },
  separator: { height: StyleSheet.hairlineWidth },
  footer: { paddingVertical: 16 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
