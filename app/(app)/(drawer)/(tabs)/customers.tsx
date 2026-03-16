import React, { useState } from 'react';
import { Clipboard, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, IconButton, List, Snackbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCustomers } from '@/hooks/useCustomers';
import type { Customer } from '@/types/models';

export default function CustomersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: customers, isPending, isError, refetch } = useCustomers();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleCopyCustomerId = (id: string) => {
    Clipboard.setString(id);
    setSnackMessage('Customer ID copied to clipboard');
  };

  if (isPending) {
    return (
      <SafeAreaView edges={['left', 'right']} style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
        <FAB icon="plus" style={styles.fab} onPress={() => router.push('/(app)/customer/create')} />
      </SafeAreaView>
    );
  }

  if (isError || !customers?.length) {
    return (
      <SafeAreaView edges={['left', 'right']} style={[styles.root, { backgroundColor: theme.colors.background }]}>
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

  const renderItem = ({ item }: { item: Customer }) => {
    const parts = [];
    if (item.phone) parts.push(item.phone);
    if (item.address) parts.push(item.address);
    const description = parts.length > 0 ? parts.join(' • ') : `ID: ${item.id}`;

    return (
      <List.Item
        title={item.name}
        description={description}
        onPress={() => router.push(`/(app)/customer/${item.id}`)}
        left={(props) => <List.Icon {...props} icon="account" />}
        right={(props) => (
          <IconButton
            {...props}
            icon="content-copy"
            size={20}
            onPress={() => handleCopyCustomerId(item.id)}
          />
        )}
        style={{ backgroundColor: theme.colors.surface }}
      />
    );
  };

  return (
    <SafeAreaView edges={['left', 'right']} style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={customers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      />
      <FAB icon="plus" style={styles.fab} onPress={() => router.push('/(app)/customer/create')} />
      <Snackbar
        visible={!!snackMessage}
        onDismiss={() => setSnackMessage('')}
        duration={4000}
        action={{ label: 'OK', onPress: () => setSnackMessage('') }}
      >
        {snackMessage}
      </Snackbar>
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
