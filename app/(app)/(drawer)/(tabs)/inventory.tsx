import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, List, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePurchaseItems } from '@/hooks/useInventory';
import type { PurchaseItem } from '@/types/models';

const formatDate = (str: string) => new Date(str).toLocaleDateString('id-ID');

export default function InventoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: items, isPending, isError } = usePurchaseItems();

  if (isPending) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !items?.length) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 40 }}>📦</Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
            No items
          </Text>
        </View>
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
