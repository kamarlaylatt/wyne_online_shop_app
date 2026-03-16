import React, { useState } from 'react';
import { FlatList, Modal, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ActivityIndicator,
  Badge,
  Button,
  Chip,
  Dialog,
  FAB,
  IconButton,
  List,
  Portal,
  Surface,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOrders, useOrderPreload } from '@/hooks/useOrders';
import type { Order, OrderStatus, PaymentStatus, Customer, PurchaseItem } from '@/types/models';
import type { OrderFilters } from '@/services/api';

const formatIDR = (value: number | string) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    parseFloat(String(value))
  );

const statusMode = (status: OrderStatus): 'outlined' | 'flat' => {
  if (status === 'PENDING') return 'outlined';
  return 'flat';
};

const getTodayRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fromCreatedAt = today.toISOString();

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const toCreatedAt = tomorrow.toISOString();

  return { fromCreatedAt, toCreatedAt };
};

const formatTodayLabel = () => {
  const today = new Date();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const date = today.getDate().toString().padStart(2, '0');
  return `Today, ${month}/${date}`;
};

export default function OrdersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [appliedFilters, setAppliedFilters] = useState<OrderFilters>({});
  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useOrders(appliedFilters);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter dialog state
  const [filterVisible, setFilterVisible] = useState(false);
  const [draftStatus, setDraftStatus] = useState<OrderStatus | undefined>();
  const [draftPayment, setDraftPayment] = useState<PaymentStatus | undefined>();
  const [draftOrderId, setDraftOrderId] = useState('');
  const [draftCustomer, setDraftCustomer] = useState<Customer | null>(null);
  const [draftPurchaseItem, setDraftPurchaseItem] = useState<PurchaseItem | null>(null);
  const [draftFromDate, setDraftFromDate] = useState<Date | null>(null);
  const [draftToDate, setDraftToDate] = useState<Date | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState<'from' | 'to' | null>(null);

  // Picker modals
  const [customerPickerVisible, setCustomerPickerVisible] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [purchaseItemPickerVisible, setPurchaseItemPickerVisible] = useState(false);
  const [purchaseItemSearch, setPurchaseItemSearch] = useState('');

  const { data: preload } = useOrderPreload({ enabled: filterVisible });
  const customers = preload?.customers ?? [];
  const purchaseItems = preload?.purchaseItems ?? [];

  const filteredCustomers = customerSearch.trim()
    ? customers.filter((c) => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone?.includes(customerSearch))
    : customers;
  const filteredPurchaseItems = purchaseItemSearch.trim()
    ? purchaseItems.filter((pi) => pi.name.toLowerCase().includes(purchaseItemSearch.toLowerCase()))
    : purchaseItems;

  const orders = data?.pages.flatMap((p) => p.data) ?? [];
  const isTodayActive = Boolean(appliedFilters.fromCreatedAt);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const openFilterDialog = () => {
    setDraftStatus(appliedFilters.status);
    setDraftPayment(appliedFilters.paymentStatus);
    setDraftOrderId(appliedFilters.id || '');
    setDraftCustomer(null);
    setDraftPurchaseItem(null);
    setDraftFromDate(appliedFilters.fromCreatedAt ? new Date(appliedFilters.fromCreatedAt) : null);
    setDraftToDate(appliedFilters.toCreatedAt ? new Date(appliedFilters.toCreatedAt) : null);
    setFilterVisible(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setDatePickerVisible(null);
    }
    if (selectedDate && datePickerVisible) {
      if (datePickerVisible === 'from') {
        setDraftFromDate(selectedDate);
      } else {
        setDraftToDate(selectedDate);
      }
    }
  };

  const formatDateDisplay = (date: Date | null) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const applyFilters = () => {
    const newFilters: OrderFilters = {};
    if (draftStatus) newFilters.status = draftStatus;
    if (draftPayment) newFilters.paymentStatus = draftPayment;
    if (draftOrderId.trim()) newFilters.id = draftOrderId.trim();
    if (draftCustomer) newFilters.customerId = draftCustomer.id;
    if (draftPurchaseItem) newFilters.purchaseItemId = draftPurchaseItem.id;
    if (draftFromDate) newFilters.fromCreatedAt = draftFromDate.toISOString();
    if (draftToDate) newFilters.toCreatedAt = draftToDate.toISOString();
    setAppliedFilters(newFilters);
    setFilterVisible(false);
  };

  const resetFilters = () => {
    setDraftStatus(undefined);
    setDraftPayment(undefined);
    setDraftOrderId('');
    setDraftCustomer(null);
    setDraftPurchaseItem(null);
    setDraftFromDate(null);
    setDraftToDate(null);
  };

  const toggleToday = () => {
    if (isTodayActive) {
      setAppliedFilters((prev) => {
        const next = { ...prev };
        delete next.fromCreatedAt;
        delete next.toCreatedAt;
        return next;
      });
    } else {
      const { fromCreatedAt, toCreatedAt } = getTodayRange();
      setAppliedFilters((prev) => ({
        ...prev,
        fromCreatedAt,
        toCreatedAt,
      }));
    }
  };

  const clearAllFilters = () => {
    setAppliedFilters({});
  };

  const activeFilterCount = (appliedFilters.status ? 1 : 0) + (appliedFilters.paymentStatus ? 1 : 0);

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
    const hasActiveFilters = Object.keys(appliedFilters).length > 0;
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 40 }}>📋</Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
            {hasActiveFilters ? 'No orders match filters' : 'No orders'}
          </Text>
          {hasActiveFilters && (
            <Button
              mode="text"
              onPress={clearAllFilters}
              style={{ marginTop: 16 }}
            >
              Clear Filters
            </Button>
          )}
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
      {/* Toolbar: Today chip + Filter icon + Clear button */}
      <View style={[styles.toolbar, { backgroundColor: theme.colors.surface }]}>
        <Chip
          selected={isTodayActive}
          onPress={toggleToday}
          mode={isTodayActive ? 'flat' : 'outlined'}
          style={styles.todayChip}
        >
          {formatTodayLabel()}
        </Chip>
        <View style={{ flex: 1 }} />
        <Badge
          size={20}
          visible={activeFilterCount > 0}
          style={styles.badge}
        >
          {activeFilterCount}
        </Badge>
        <IconButton
          icon="filter"
          onPress={openFilterDialog}
          mode="contained-tonal"
        />
        {Object.keys(appliedFilters).length > 0 && (
          <IconButton
            icon="close"
            onPress={clearAllFilters}
            mode="contained-tonal"
            iconColor={theme.colors.error}
          />
        )}
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />}
        contentContainerStyle={styles.list}
        onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={styles.footer} color={theme.colors.primary} /> : null}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      />
      <FAB icon="plus" style={styles.fab} onPress={() => router.push('/(app)/order/create')} />

      {/* Filter Dialog */}
      <Portal>
        <Dialog visible={filterVisible} onDismiss={() => setFilterVisible(false)} style={styles.dialog}>
          <View style={styles.dialogHeader}>
            <Dialog.Title>Filter Orders</Dialog.Title>
            <IconButton icon="close" onPress={() => setFilterVisible(false)} />
          </View>
          <Dialog.Content style={styles.dialogContentContainer}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.dialogContent}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                Status
              </Text>
              <View style={styles.chipRow}>
                <Chip
                  selected={!draftStatus}
                  onPress={() => setDraftStatus(undefined)}
                  mode={!draftStatus ? 'flat' : 'outlined'}
                  size="small"
                  style={styles.filterChip}
                >
                  All
                </Chip>
                {(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'] as OrderStatus[]).map((s) => (
                  <Chip
                    key={s}
                    selected={draftStatus === s}
                    onPress={() => setDraftStatus(s)}
                    mode={draftStatus === s ? 'flat' : 'outlined'}
                    size="small"
                    style={styles.filterChip}
                  >
                    {s}
                  </Chip>
                ))}
              </View>

              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
                Payment Status
              </Text>
              <View style={styles.chipRow}>
                <Chip
                  selected={!draftPayment}
                  onPress={() => setDraftPayment(undefined)}
                  mode={!draftPayment ? 'flat' : 'outlined'}
                  size="small"
                  style={styles.filterChip}
                >
                  All
                </Chip>
                {(['UNPAID', 'PAID', 'REFUNDED'] as PaymentStatus[]).map((p) => (
                  <Chip
                    key={p}
                    selected={draftPayment === p}
                    onPress={() => setDraftPayment(p)}
                    mode={draftPayment === p ? 'flat' : 'outlined'}
                    size="small"
                    style={styles.filterChip}
                  >
                    {p}
                  </Chip>
                ))}
              </View>

              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
                Order ID
              </Text>
              <TextInput
                placeholder="Enter order ID"
                value={draftOrderId}
                onChangeText={setDraftOrderId}
                mode="outlined"
                dense
                style={styles.dialogInput}
              />

              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
                Customer
              </Text>
              <TouchableRipple
                onPress={() => { setCustomerSearch(''); setCustomerPickerVisible(true); }}
                style={[styles.picker, { borderColor: theme.colors.outline }]}
              >
                <Text style={{ color: draftCustomer ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}>
                  {draftCustomer ? draftCustomer.name : 'Select customer…'}
                </Text>
              </TouchableRipple>

              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
                Purchase Item
              </Text>
              <TouchableRipple
                onPress={() => { setPurchaseItemSearch(''); setPurchaseItemPickerVisible(true); }}
                style={[styles.picker, { borderColor: theme.colors.outline }]}
              >
                <Text style={{ color: draftPurchaseItem ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}>
                  {draftPurchaseItem ? draftPurchaseItem.name : 'Select purchase item…'}
                </Text>
              </TouchableRipple>

              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
                From Date
              </Text>
              <View style={styles.dateInputRow}>
                <TouchableRipple
                  onPress={() => setDatePickerVisible('from')}
                  style={[styles.picker, styles.flex1, { borderColor: theme.colors.outline }]}
                >
                  <Text style={{ color: draftFromDate ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}>
                    {formatDateDisplay(draftFromDate)}
                  </Text>
                </TouchableRipple>
                {draftFromDate && (
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={() => setDraftFromDate(null)}
                    style={styles.clearDateBtn}
                  />
                )}
              </View>

              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
                To Date
              </Text>
              <View style={styles.dateInputRow}>
                <TouchableRipple
                  onPress={() => setDatePickerVisible('to')}
                  style={[styles.picker, styles.flex1, { borderColor: theme.colors.outline }]}
                >
                  <Text style={{ color: draftToDate ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}>
                    {formatDateDisplay(draftToDate)}
                  </Text>
                </TouchableRipple>
                {draftToDate && (
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={() => setDraftToDate(null)}
                    style={styles.clearDateBtn}
                  />
                )}
              </View>
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={resetFilters}>Reset</Button>
            <Button mode="contained" onPress={applyFilters}>Apply</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Customer Picker Modal */}
      <Modal
        visible={customerPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomerPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]} elevation={4}>
            <Text variant="titleMedium" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              Select Customer
            </Text>
            <TextInput
              placeholder="Search by name or phone…"
              value={customerSearch}
              onChangeText={setCustomerSearch}
              mode="outlined"
              dense
              left={<TextInput.Icon icon="magnify" />}
              style={{ marginHorizontal: 16, marginBottom: 8 }}
            />
            <ScrollView keyboardShouldPersistTaps="handled">
              {filteredCustomers.map((c) => (
                <TouchableRipple
                  key={c.id}
                  onPress={() => { setDraftCustomer(c); setCustomerPickerVisible(false); }}
                  style={styles.modalItem}
                >
                  <View>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>{c.name}</Text>
                    {c.phone && <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{c.phone}</Text>}
                  </View>
                </TouchableRipple>
              ))}
              {filteredCustomers.length === 0 && (
                <Text style={{ padding: 16, color: theme.colors.onSurfaceVariant }}>No customers found</Text>
              )}
            </ScrollView>
            <Button onPress={() => setCustomerPickerVisible(false)} style={{ margin: 8 }}>Cancel</Button>
          </Surface>
        </View>
      </Modal>

      {/* Purchase Item Picker Modal */}
      <Modal
        visible={purchaseItemPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPurchaseItemPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]} elevation={4}>
            <Text variant="titleMedium" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              Select Purchase Item
            </Text>
            <TextInput
              placeholder="Search by name…"
              value={purchaseItemSearch}
              onChangeText={setPurchaseItemSearch}
              mode="outlined"
              dense
              left={<TextInput.Icon icon="magnify" />}
              style={{ marginHorizontal: 16, marginBottom: 8 }}
            />
            <ScrollView keyboardShouldPersistTaps="handled">
              {filteredPurchaseItems.map((pi) => (
                <TouchableRipple
                  key={pi.id}
                  onPress={() => { setDraftPurchaseItem(pi); setPurchaseItemPickerVisible(false); }}
                  style={styles.modalItem}
                >
                  <View>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>{pi.name}</Text>
                  </View>
                </TouchableRipple>
              ))}
              {filteredPurchaseItems.length === 0 && (
                <Text style={{ padding: 16, color: theme.colors.onSurfaceVariant }}>No purchase items found</Text>
              )}
            </ScrollView>
            <Button onPress={() => setPurchaseItemPickerVisible(false)} style={{ margin: 8 }}>Cancel</Button>
          </Surface>
        </View>
      </Modal>

      {/* Date Picker */}
      {datePickerVisible && (
        <DateTimePicker
          value={datePickerVisible === 'from' ? draftFromDate || new Date() : draftToDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          onTouchCancel={() => setDatePickerVisible(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  toolbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  todayChip: { marginLeft: 0 },
  badge: { position: 'absolute', left: 100 },
  list: { paddingBottom: 88 },
  chipContainer: { justifyContent: 'center', paddingRight: 8 },
  chip: { alignSelf: 'center' },
  separator: { height: StyleSheet.hairlineWidth },
  fab: { position: 'absolute', right: 16, bottom: 16 },
  footer: { paddingVertical: 16 },
  // Dialog styles
  dialog: { maxHeight: '80%' },
  dialogHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 8 },
  dialogContentContainer: { maxHeight: 400 },
  dialogContent: { paddingBottom: 16 },
  dialogActions: { paddingHorizontal: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  filterChip: { marginRight: 4, marginBottom: 4 },
  dialogInput: { marginTop: 8, marginBottom: 16 },
  picker: { borderWidth: 1, borderRadius: 4, padding: 14, marginBottom: 16 },
  dateInputRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, marginBottom: 16 },
  flex1: { flex: 1 },
  clearDateBtn: { marginTop: 8 },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  modalSheet: { borderRadius: 12, maxHeight: '70%', overflow: 'hidden' },
  modalTitle: { padding: 16, paddingBottom: 8 },
  modalItem: { padding: 16 },
});
