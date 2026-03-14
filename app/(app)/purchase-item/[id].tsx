import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePurchaseItem } from '@/hooks/useInventory';

const formatIDR = (value: number | string) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    parseFloat(String(value))
  );

const formatDate = (str: string) => new Date(str).toLocaleDateString('id-ID');

export default function PurchaseItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { data: item, isPending, isError } = usePurchaseItem(id);

  if (isPending) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !item) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <Text variant="titleMedium" style={{ color: theme.colors.error }}>
            Failed to load item
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="titleLarge" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>
          {item.name}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
          ID: {item.id}
        </Text>

        <View style={styles.section}>
          <Text variant="titleSmall" style={{ color: theme.colors.onBackground }}>Quantity</Text>
          <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
            {item.quantity}
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleSmall" style={{ color: theme.colors.onBackground }}>Total Price</Text>
          <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
            {formatIDR(item.totalPrice)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleSmall" style={{ color: theme.colors.onBackground }}>Supplier</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {item.supplier?.name ?? item.supplierId}
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleSmall" style={{ color: theme.colors.onBackground }}>Purchase Date</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {formatDate(item.purchaseDate)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, gap: 4 },
  section: { marginTop: 16, gap: 4 },
});
