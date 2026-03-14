import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOrders } from '@/hooks/useOrders';
import { usePurchaseItems } from '@/hooks/useInventory';
import { useCustomers } from '@/hooks/useCustomers';

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: ordersData, isPending: ordersLoading } = useOrders();
  const { data: purchaseItemsData, isPending: itemsLoading } = usePurchaseItems();
  const { data: customers, isPending: customersLoading } = useCustomers();

  const isLoading = ordersLoading || itemsLoading || customersLoading;

  const orders = ordersData?.pages.flatMap((p) => p.data) ?? [];
  const purchaseItems = purchaseItemsData?.pages.flatMap((p) => p.data) ?? [];

  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID').length;
  const inventoryItems = purchaseItems.length;
  const totalCustomers = customers?.length ?? 0;

  const stats = [
    { label: 'Total Orders', value: isLoading ? null : String(totalOrders), icon: '📋' },
    { label: 'Paid Orders', value: isLoading ? null : String(paidOrders), icon: '💰' },
    { label: 'Inventory Items', value: isLoading ? null : String(inventoryItems), icon: '📦' },
    { label: 'Total Customers', value: isLoading ? null : String(totalCustomers), icon: '👥' },
  ];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} style={styles.scrollView}>
        <Text variant="headlineSmall" style={[styles.heading, { color: theme.colors.onBackground }]}>
          Dashboard
        </Text>
        <View style={styles.grid}>
          {stats.map((stat) => (
            <Card key={stat.label} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.cardContent}>
                <Text style={styles.icon}>{stat.icon}</Text>
                {stat.value === null ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                    {stat.value}
                  </Text>
                )}
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {stat.label}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => router.push('/(app)/order/create')}
          style={styles.createBtn}
        >
          Create Order
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'column' },
  scrollView: { flex: 1 },
  content: { padding: 16 },
  heading: { fontWeight: '700', marginBottom: 16 },
  buttonContainer: { padding: 16, paddingBottom: 8 },
  createBtn: {},
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%' },
  cardContent: { alignItems: 'center', padding: 16, gap: 4 },
  icon: { fontSize: 28 },
});
