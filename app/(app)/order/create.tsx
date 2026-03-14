import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Divider,
  IconButton,
  Menu,
  SegmentedButtons,
  Snackbar,
  Surface,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOrderPreload, useCreateOrder } from '@/hooks/useOrders';
import type { Customer, OrderStatus, PaymentStatus, PurchaseItem } from '@/types/models';

type CustomerMode = 'existing' | 'new';

type ItemRow = {
  id: string;
  purchaseItemId: string;
  purchaseItemName: string;
  quantity: string;
  unitPrice: string;
};

const formatIDR = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

export default function CreateOrderScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: preload, isPending: preloadLoading } = useOrderPreload();
  const { mutate: createOrder, isPending: creating } = useCreateOrder();

  // Customer state
  const [customerMode, setCustomerMode] = useState<CustomerMode>('existing');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerPickerVisible, setCustomerPickerVisible] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // Items state
  const [items, setItems] = useState<ItemRow[]>([
    { id: '1', purchaseItemId: '', purchaseItemName: '', quantity: '1', unitPrice: '0' },
  ]);
  const [itemPickerIndex, setItemPickerIndex] = useState<number | null>(null);

  // Order options
  const [status, setStatus] = useState<OrderStatus>('PENDING');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('UNPAID');

  // UI state
  const [snackMessage, setSnackMessage] = useState('');

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        purchaseItemId: '',
        purchaseItemName: '',
        quantity: '1',
        unitPrice: '0',
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, patch: Partial<ItemRow>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const selectPurchaseItem = (rowId: string, pi: PurchaseItem) => {
    const unitPrice = pi.sellPerPrice ?? Math.round(parseFloat(String(pi.totalPrice)) / pi.quantity);
    updateItem(rowId, {
      purchaseItemId: pi.id,
      purchaseItemName: pi.name,
      unitPrice: String(unitPrice),
    });
    setItemPickerIndex(null);
  };

  const total = items.reduce((sum, i) => {
    const qty = parseFloat(i.quantity) || 0;
    const price = parseFloat(i.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const isValid = () => {
    if (customerMode === 'existing' && !selectedCustomer) return false;
    if (customerMode === 'new' && !newName.trim()) return false;
    if (items.length === 0) return false;
    return items.every((i) => i.purchaseItemId && (parseFloat(i.quantity) || 0) > 0);
  };

  const handleSubmit = () => {
    if (!isValid()) {
      setSnackMessage('Please fill in all required fields.');
      return;
    }

    const orderItems = items.map((i) => ({
      purchaseItemId: i.purchaseItemId,
      quantity: parseFloat(i.quantity),
      unitPrice: parseFloat(i.unitPrice),
    }));

    const base = { items: orderItems, status, paymentStatus };
    const body =
      customerMode === 'existing'
        ? { ...base, customerId: selectedCustomer!.id }
        : { ...base, customer: { name: newName.trim(), phone: newPhone.trim() || undefined, address: newAddress.trim() || undefined } };

    createOrder(body, {
      onSuccess: (order) => {
        router.replace(`/(app)/order/${order.id}`);
      },
      onError: (err: any) => {
        setSnackMessage(err?.response?.data?.message ?? 'Failed to create order.');
      },
    });
  };

  if (preloadLoading) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const customers = preload?.customers ?? [];
  const filteredCustomers = customerSearch.trim()
    ? customers.filter((c) => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone?.includes(customerSearch))
    : customers;
  const purchaseItems = preload?.purchaseItems ?? [];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* ── Customer ── */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Customer
        </Text>
        <SegmentedButtons
          value={customerMode}
          onValueChange={(v) => setCustomerMode(v as CustomerMode)}
          buttons={[
            { value: 'existing', label: 'Existing' },
            { value: 'new', label: 'New' },
          ]}
          style={styles.segmented}
        />

        {customerMode === 'existing' ? (
          <TouchableRipple onPress={() => { setCustomerSearch(''); setCustomerPickerVisible(true); }} style={[styles.picker, { borderColor: theme.colors.outline }]}>
            <Text style={{ color: selectedCustomer ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}>
              {selectedCustomer ? `${selectedCustomer.name}${selectedCustomer.phone ? ` • ${selectedCustomer.phone}` : ''}` : 'Select customer…'}
            </Text>
          </TouchableRipple>
        ) : (
          <>
            <TextInput label="Name *" value={newName} onChangeText={setNewName} mode="outlined" style={styles.input} />
            <TextInput label="Phone" value={newPhone} onChangeText={setNewPhone} mode="outlined" style={styles.input} keyboardType="phone-pad" />
            <TextInput label="Address" value={newAddress} onChangeText={setNewAddress} mode="outlined" style={styles.input} />
          </>
        )}

        <Divider style={styles.divider} />

        {/* ── Items ── */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Order Items
        </Text>

        {items.map((row, idx) => {
          const subtotal = (parseFloat(row.quantity) || 0) * (parseFloat(row.unitPrice) || 0);
          return (
            <Surface key={row.id} style={[styles.itemCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
              <View style={styles.itemHeader}>
                <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>Item {idx + 1}</Text>
                {items.length > 1 && (
                  <IconButton icon="close" size={18} onPress={() => removeItem(row.id)} />
                )}
              </View>

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
          <Text variant="titleSmall" style={{ color: theme.colors.onSecondaryContainer }}>Total</Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onSecondaryContainer }}>{formatIDR(total)}</Text>
        </Surface>

        <Divider style={styles.divider} />

        {/* ── Status ── */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Order Status
        </Text>
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

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground, marginTop: 16 }]}>
          Payment Status
        </Text>
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

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={creating}
          disabled={creating}
          style={styles.submitBtn}
          contentStyle={styles.submitContent}
        >
          Create Order
        </Button>
      </ScrollView>

      {/* ── Customer Picker Modal ── */}
      <Modal visible={customerPickerVisible} transparent animationType="fade" onRequestClose={() => setCustomerPickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <Surface style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]} elevation={4}>
            <Text variant="titleMedium" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Select Customer</Text>
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
            <Text variant="titleMedium" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Select Purchase Item</Text>
            <ScrollView>
              {purchaseItems.map((pi) => {
                const displayPrice = pi.sellPerPrice ?? Math.round(parseFloat(String(pi.totalPrice)) / pi.quantity);
                return (
                  <TouchableRipple
                    key={pi.id}
                    onPress={() => {
                      if (itemPickerIndex !== null) {
                        selectPurchaseItem(items[itemPickerIndex].id, pi);
                      }
                    }}
                    style={styles.modalItem}
                  >
                    <View>
                      <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>{pi.name}</Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Stock: {pi.quantity} • {formatIDR(displayPrice)} /unit
                      </Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionTitle: { marginBottom: 8 },
  segmented: { marginBottom: 12 },
  input: { marginBottom: 8 },
  divider: { marginVertical: 16 },
  picker: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 14,
    marginBottom: 8,
  },
  itemCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  spacer: { width: 8 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  addBtn: { marginBottom: 12 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  submitBtn: { marginTop: 24 },
  submitContent: { paddingVertical: 6 },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalSheet: {
    borderRadius: 12,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalTitle: {
    padding: 16,
    paddingBottom: 8,
  },
  modalItem: {
    padding: 16,
  },
});
