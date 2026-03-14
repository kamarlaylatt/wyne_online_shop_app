import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Chip,
  Dialog,
  Divider,
  IconButton,
  List,
  Portal,
  SegmentedButtons,
  Snackbar,
  Surface,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrder, useOrderItems, useOrderPreload, useUpdateOrder, useDeleteOrder } from '@/hooks/useOrders';
import type { Customer, OrderStatus, PaymentStatus, PurchaseItem } from '@/types/models';

const formatIDR = (value: number | string) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    parseFloat(String(value))
  );

const formatDate = (str: string) => new Date(str).toLocaleDateString('id-ID');

const statusChipMode = (status: OrderStatus): 'outlined' | 'flat' =>
  status === 'PENDING' ? 'outlined' : 'flat';

const paymentChipMode = (status: PaymentStatus): 'outlined' | 'flat' =>
  status === 'UNPAID' ? 'outlined' : 'flat';

type ItemRow = {
  id: string;
  purchaseItemId: string;
  purchaseItemName: string;
  quantity: string;
  unitPrice: string;
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { data: order, isPending, isError } = useOrder(id);
  const { data: fetchedItems } = useOrderItems(id);
  const { mutate: updateOrder, isPending: saving } = useUpdateOrder(id);
  const { mutate: deleteOrder, isPending: deleting } = useDeleteOrder(id);

  const [editing, setEditing] = useState(false);
  const { data: preload } = useOrderPreload({ enabled: editing });
  const [status, setStatus] = useState<OrderStatus>('PENDING');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('UNPAID');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerPickerVisible, setCustomerPickerVisible] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [items, setItems] = useState<ItemRow[]>([]);
  const [itemPickerIndex, setItemPickerIndex] = useState<number | null>(null);
  const [snackMessage, setSnackMessage] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  // Sync form state whenever order or items data loads
  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setPaymentStatus(order.paymentStatus);
      setSelectedCustomer(order.customer ?? null);
    }
  }, [order]);

  useEffect(() => {
    const source = fetchedItems ?? order?.orderItems ?? [];
    setItems(
      source.map((oi) => ({
        id: oi.id,
        purchaseItemId: oi.purchaseItemId,
        purchaseItemName: oi.purchaseItem?.name ?? oi.purchaseItemId,
        quantity: String(oi.quantity),
        unitPrice: String(oi.unitPrice),
      }))
    );
  }, [fetchedItems, order?.orderItems]);

  const purchaseItems = preload?.purchaseItems ?? [];
  const customers = preload?.customers ?? [];
  const filteredCustomers = customerSearch.trim()
    ? customers.filter((c) => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone?.includes(customerSearch))
    : customers;

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, purchaseItemId: '', purchaseItemName: '', quantity: '1', unitPrice: '0' },
    ]);

  const removeItem = (rowId: string) => setItems((prev) => prev.filter((i) => i.id !== rowId));

  const updateItem = (rowId: string, patch: Partial<ItemRow>) =>
    setItems((prev) => prev.map((i) => (i.id === rowId ? { ...i, ...patch } : i)));

  const selectPurchaseItem = (rowId: string, pi: PurchaseItem) => {
    const unitPrice = Math.round(parseFloat(String(pi.totalPrice)) / pi.quantity);
    updateItem(rowId, { purchaseItemId: pi.id, purchaseItemName: pi.name, unitPrice: String(unitPrice) });
    setItemPickerIndex(null);
  };

  const total = items.reduce((sum, i) => sum + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0), 0);

  const cancelEdit = () => {
    setStatus(order.status);
    setPaymentStatus(order.paymentStatus);
    setSelectedCustomer(order.customer ?? null);
    const source = fetchedItems ?? order.orderItems ?? [];
    setItems(
      source.map((oi) => ({
        id: oi.id,
        purchaseItemId: oi.purchaseItemId,
        purchaseItemName: oi.purchaseItem?.name ?? oi.purchaseItemId,
        quantity: String(oi.quantity),
        unitPrice: String(oi.unitPrice),
      }))
    );
    setEditing(false);
  };

  const handleSave = () => {
    const validItems = items.filter((i) => i.purchaseItemId && (parseFloat(i.quantity) || 0) > 0);
    if (validItems.length === 0) {
      setSnackMessage('At least one valid item is required.');
      return;
    }
    updateOrder(
      {
        customerId: selectedCustomer?.id,
        status,
        paymentStatus,
        items: validItems.map((i) => ({
          purchaseItemId: i.purchaseItemId,
          quantity: parseFloat(i.quantity),
          unitPrice: parseFloat(i.unitPrice),
        })),
      },
      {
        onSuccess: () => setEditing(false),
        onError: (err: any) => setSnackMessage(err?.response?.data?.message ?? 'Failed to save changes.'),
      }
    );
  };

  const handleDelete = () => {
    deleteOrder(undefined, {
      onSuccess: () => {
        setDeleteDialogVisible(false);
        router.back();
      },
      onError: (err: any) => {
        setDeleteDialogVisible(false);
        setSnackMessage(err?.response?.data?.message ?? 'Failed to delete order.');
      },
    });
  };

  if (isPending) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <Text variant="titleMedium" style={{ color: theme.colors.error }}>
            Failed to load order
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <Text variant="titleMedium" style={{ color: theme.colors.error }}>
            Order not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Prefer freshly-fetched items; fall back to what came with the order object
  const resolvedItems = fetchedItems ?? order.orderItems ?? [];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* ── Header ── */}
        <View style={styles.headerRow}>
          <View style={styles.flex1}>
            <Text variant="titleLarge" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>
              Order Detail
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
              ID: {order.id}
            </Text>
          </View>
          {!editing ? (
            <View style={styles.headerButtons}>
              <IconButton icon="pencil" mode="contained-tonal" onPress={() => setEditing(true)} />
              <IconButton icon="delete" mode="contained-tonal" onPress={() => setDeleteDialogVisible(true)} />
            </View>
          ) : (
            <IconButton icon="close" mode="contained-tonal" onPress={cancelEdit} />
          )}
        </View>

        {/* ── Customer ── */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={{ color: theme.colors.onBackground }}>Customer</Text>
          {editing ? (
            <TouchableRipple
              onPress={() => { setCustomerSearch(''); setCustomerPickerVisible(true); }}
              style={[styles.picker, { borderColor: theme.colors.outline, marginTop: 4 }]}
            >
              <Text style={{ color: selectedCustomer ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}>
                {selectedCustomer
                  ? `${selectedCustomer.name}${selectedCustomer.phone ? ` • ${selectedCustomer.phone}` : ''}`
                  : 'Select customer…'}
              </Text>
            </TouchableRipple>
          ) : (
            <>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {order.customer?.name ?? order.customerId}
              </Text>
              {order.customer?.phone && (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{order.customer.phone}</Text>
              )}
            </>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* ── Status ── */}
        <Text variant="titleSmall" style={{ color: theme.colors.onBackground, marginBottom: 8 }}>
          Order Status
        </Text>
        {editing ? (
          <SegmentedButtons
            value={status}
            onValueChange={(v) => setStatus(v as OrderStatus)}
            buttons={[
              { value: 'PENDING', label: 'Pending' },
              { value: 'PROCESSING', label: 'Processing' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
            style={styles.segmented}
          />
        ) : (
          <Chip mode={statusChipMode(order.status)} style={styles.chip}>{order.status}</Chip>
        )}

        <Text variant="titleSmall" style={{ color: theme.colors.onBackground, marginBottom: 8, marginTop: 12 }}>
          Payment Status
        </Text>
        {editing ? (
          <SegmentedButtons
            value={paymentStatus}
            onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}
            buttons={[
              { value: 'UNPAID', label: 'Unpaid' },
              { value: 'PAID', label: 'Paid' },
              { value: 'REFUNDED', label: 'Refunded' },
            ]}
            style={styles.segmented}
          />
        ) : (
          <Chip mode={paymentChipMode(order.paymentStatus)} style={styles.chip}>{order.paymentStatus}</Chip>
        )}

        <Divider style={styles.divider} />

        {/* ── Order Items ── */}
        <Text variant="titleSmall" style={{ color: theme.colors.onBackground, marginBottom: 8 }}>
          Order Items
        </Text>

        {editing ? (
          <>
            {items.map((row, idx) => {
              const subtotal = (parseFloat(row.quantity) || 0) * (parseFloat(row.unitPrice) || 0);
              const selectedItem = purchaseItems.find(pi => pi.id === row.purchaseItemId);
              const orderCount = selectedItem?._count?.orderItems ?? 0;
              const isLowStock = selectedItem && orderCount >= selectedItem.quantity;

              return (
                <Surface key={row.id} style={[styles.itemCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
                  <View style={styles.itemHeader}>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>Item {idx + 1}</Text>
                    {items.length > 1 && (
                      <IconButton icon="close" size={18} onPress={() => removeItem(row.id)} />
                    )}
                  </View>

                  {isLowStock && (
                    <View style={[styles.warningBox, { backgroundColor: theme.colors.errorContainer }]}>
                      <Text variant="labelSmall" style={{ color: theme.colors.onErrorContainer }}>
                        ⚠️ Stock critically low - {orderCount} orders vs {selectedItem.quantity} units
                      </Text>
                    </View>
                  )}

                  <TouchableRipple
                    onPress={() => setItemPickerIndex(idx)}
                    style={[styles.picker, { borderColor: theme.colors.outline }]}
                  >
                    <Text style={{ color: row.purchaseItemName ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}>
                      {row.purchaseItemName || 'Select purchase item…'}
                    </Text>
                  </TouchableRipple>
                  <View style={styles.row}>
                    <TextInput
                      label="Qty"
                      value={row.quantity}
                      onChangeText={(v) => updateItem(row.id, { quantity: v })}
                      mode="outlined"
                      keyboardType="numeric"
                      style={[styles.input, styles.flex1]}
                    />
                    <View style={styles.spacer} />
                    <TextInput
                      label="Unit Price"
                      value={row.unitPrice}
                      onChangeText={(v) => updateItem(row.id, { unitPrice: v })}
                      mode="outlined"
                      keyboardType="numeric"
                      style={[styles.input, styles.flex2]}
                    />
                  </View>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                    Subtotal: {formatIDR(subtotal)}
                  </Text>
                </Surface>
              );
            })}

            <Button icon="plus" mode="outlined" onPress={addItem} style={styles.addBtn}>
              Add Item
            </Button>

            <Surface style={[styles.totalRow, { backgroundColor: theme.colors.secondaryContainer }]} elevation={0}>
              <Text variant="titleSmall" style={{ color: theme.colors.onSecondaryContainer }}>Total (computed)</Text>
              <Text variant="titleMedium" style={{ color: theme.colors.onSecondaryContainer }}>{formatIDR(total)}</Text>
            </Surface>
          </>
        ) : (
          <>
            {resolvedItems.length ? (
              resolvedItems.map((item) => (
                <List.Item
                  key={item.id}
                  title={item.purchaseItem?.name ?? item.purchaseItemId}
                  description={`Qty: ${item.quantity} • Unit: ${formatIDR(item.unitPrice)} • Subtotal: ${formatIDR(item.quantity * item.unitPrice)}`}
                  left={(props) => <List.Icon {...props} icon="cube-outline" />}
                  style={{ backgroundColor: theme.colors.surfaceVariant, borderRadius: 8, marginBottom: 4 }}
                />
              ))
            ) : (
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>No order items</Text>
            )}

            <View style={styles.section}>
              <Text variant="titleSmall" style={{ color: theme.colors.onBackground }}>Total</Text>
              <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                {formatIDR(order.totalPrice)}
              </Text>
            </View>
          </>
        )}

        <View style={styles.section}>
          <Text variant="titleSmall" style={{ color: theme.colors.onBackground }}>Date</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {formatDate(order.createdAt)}
          </Text>
        </View>

        {/* ── Save button ── */}
        {editing && (
          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={styles.saveBtn}
            contentStyle={styles.saveBtnContent}
          >
            Save Changes
          </Button>
        )}
      </ScrollView>

      {/* ── Customer Picker Modal ── */}
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
                  onPress={() => { setSelectedCustomer(c); setCustomerPickerVisible(false); }}
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

      {/* ── Purchase Item Picker Modal ── */}
      <Modal
        visible={itemPickerIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setItemPickerIndex(null)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]} elevation={4}>
            <Text variant="titleMedium" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              Select Purchase Item
            </Text>
            <ScrollView>
              {purchaseItems.map((pi) => {
                const orderCount = pi._count?.orderItems ?? 0;
                const isLowStock = orderCount >= pi.quantity;

                return (
                  <TouchableRipple
                    key={pi.id}
                    onPress={() => {
                      if (itemPickerIndex !== null) selectPurchaseItem(items[itemPickerIndex].id, pi);
                    }}
                    style={styles.modalItem}
                  >
                    <View>
                      <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>{pi.name}</Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Stock: {pi.quantity} • {formatIDR(Math.round(parseFloat(String(pi.totalPrice)) / pi.quantity))} /unit
                      </Text>
                      {isLowStock && (
                        <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: 4 }}>
                          ⚠️ Stock critically low - {orderCount} orders vs {pi.quantity} units
                        </Text>
                      )}
                      {orderCount > 0 && !isLowStock && (
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                          ✓ Used in {orderCount} order{orderCount !== 1 ? 's' : ''}
                        </Text>
                      )}
                    </View>
                  </TouchableRipple>
                );
              })}
              {purchaseItems.length === 0 && (
                <Text style={{ padding: 16, color: theme.colors.onSurfaceVariant }}>No purchase items available</Text>
              )}
            </ScrollView>
            <Button onPress={() => setItemPickerIndex(null)} style={{ margin: 8 }}>Cancel</Button>
          </Surface>
        </View>
      </Modal>

      <Snackbar
        visible={!!snackMessage}
        onDismiss={() => setSnackMessage('')}
        duration={4000}
        action={{ label: 'OK', onPress: () => setSnackMessage('') }}
      >
        {snackMessage}
      </Snackbar>

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Order?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this order? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={handleDelete}
              loading={deleting}
              disabled={deleting}
              textColor={theme.colors.error}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  headerButtons: { flexDirection: 'row', gap: 4 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  section: { marginTop: 16, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  spacer: { width: 8 },
  divider: { marginVertical: 16 },
  segmented: { marginBottom: 4 },
  chip: { alignSelf: 'flex-start' },
  // Edit item rows
  itemCard: { borderRadius: 8, padding: 12, marginBottom: 12 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  warningBox: { borderRadius: 4, padding: 8, marginBottom: 8 },
  picker: { borderWidth: 1, borderRadius: 4, padding: 14, marginBottom: 8 },
  input: { marginBottom: 8 },
  addBtn: { marginBottom: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8 },
  saveBtn: { marginTop: 24 },
  saveBtnContent: { paddingVertical: 6 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  modalSheet: { borderRadius: 12, maxHeight: '70%', overflow: 'hidden' },
  modalTitle: { padding: 16, paddingBottom: 8 },
  modalItem: { padding: 16 },
});
