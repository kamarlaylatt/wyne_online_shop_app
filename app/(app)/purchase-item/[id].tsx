import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Modal, Platform } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Dialog,
  Divider,
  IconButton,
  Snackbar,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePurchaseItem, useUpdatePurchaseItem, useDeletePurchaseItem } from '@/hooks/useInventory';
import { useSuppliers } from '@/hooks/useSuppliers';
import type { Supplier } from '@/types/models';

const formatIDR = (value: number | string) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    parseFloat(String(value))
  );

const formatDate = (str: string) => new Date(str).toLocaleDateString('id-ID');

export default function PurchaseItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { data: item, isPending, isError } = usePurchaseItem(id);
  const { data: suppliers } = useSuppliers();
  const { mutate: updatePurchaseItem, isPending: updating } = useUpdatePurchaseItem(id);
  const { mutate: deletePurchaseItem, isPending: deleting } = useDeletePurchaseItem(id);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [sellPerPrice, setSellPerPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierPickerVisible, setSupplierPickerVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setDatePickerVisible(false);
    }
    if (selectedDate) {
      setPurchaseDate(selectedDate);
    }
  };

  const initializeEditForm = () => {
    if (item) {
      setName(item.name);
      setQuantity(String(item.quantity));
      setTotalPrice(String(item.totalPrice));
      setSellPerPrice(item.sellPerPrice ? String(item.sellPerPrice) : '');
      setPurchaseDate(new Date(item.purchaseDate));
      if (item.supplier) {
        setSelectedSupplier(item.supplier);
      }
    }
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      initializeEditForm();
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    if (!name.trim() || !selectedSupplier || !quantity || !totalPrice) {
      setSnackMessage('Please fill in all required fields.');
      return;
    }

    updatePurchaseItem(
      {
        name: name.trim(),
        quantity: parseFloat(quantity),
        totalPrice: parseFloat(totalPrice),
        supplierId: selectedSupplier.id,
        purchaseDate: purchaseDate.toISOString(),
        sellPerPrice: sellPerPrice ? parseFloat(sellPerPrice) : null,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setSnackMessage('Item updated successfully.');
        },
        onError: (err: any) => {
          setSnackMessage(err?.response?.data?.message ?? 'Failed to update item.');
        },
      }
    );
  };

  const handleDelete = () => {
    setDeleteDialogVisible(false);
    deletePurchaseItem(undefined, {
      onSuccess: () => {
        router.back();
      },
      onError: (err: any) => {
        setSnackMessage(err?.response?.data?.message ?? 'Failed to delete item.');
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

  const suppliersList = suppliers ?? [];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="titleLarge" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>
            {isEditing ? 'Edit Item' : item.name}
          </Text>
          {!isEditing && (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              ID: {item.id}
            </Text>
          )}
        </View>
        <IconButton icon={isEditing ? 'close' : 'pencil'} onPress={handleEditToggle} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {isEditing ? (
          <>
            <TextInput
              label="Item Name *"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
            />

            <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onBackground }]}>
              Supplier *
            </Text>
            <TouchableRipple
              onPress={() => setSupplierPickerVisible(true)}
              style={[styles.picker, { borderColor: theme.colors.outline }]}
            >
              <Text style={{ color: selectedSupplier ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}>
                {selectedSupplier?.name ?? 'Select supplier…'}
              </Text>
            </TouchableRipple>

            <TextInput
              label="Quantity *"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Total Price (IDR) *"
              value={totalPrice}
              onChangeText={setTotalPrice}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Sell Per Price (IDR)"
              value={sellPerPrice}
              onChangeText={setSellPerPrice}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              helperText="Leave empty to use calculated value"
            />

            <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onBackground }]}>
              Purchase Date *
            </Text>
            <TouchableRipple
              onPress={() => setDatePickerVisible(true)}
              style={[styles.picker, { borderColor: theme.colors.outline }]}
            >
              <Text style={{ color: theme.colors.onSurface }}>
                {purchaseDate.toLocaleDateString('id-ID')}
              </Text>
            </TouchableRipple>

            <View style={styles.actionRow}>
              <Button
                mode="contained"
                onPress={handleSave}
                loading={updating}
                disabled={updating}
                style={styles.actionBtn}
              >
                Save Changes
              </Button>
              <Button mode="outlined" onPress={() => setIsEditing(false)} disabled={updating} style={styles.actionBtn}>
                Cancel
              </Button>
            </View>
          </>
        ) : (
          <>
            <View style={styles.section}>
              <Text variant="titleSmall" style={{ color: theme.colors.onBackground }}>
                Quantity
              </Text>
              <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                {item.quantity}
              </Text>
            </View>

            <View style={styles.section}>
              <Text variant="titleSmall" style={{ color: theme.colors.onBackground }}>
                Total Price
              </Text>
              <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                {formatIDR(item.totalPrice)}
              </Text>
            </View>

            {item.sellPerPrice && (
              <View style={styles.section}>
                <Text variant="titleSmall" style={{ color: theme.colors.onBackground }}>
                  Unit Sell Price
                </Text>
                <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                  {formatIDR(item.sellPerPrice)}
                </Text>
              </View>
            )}

            <View style={styles.section}>
              <Text variant="titleSmall" style={{ color: theme.colors.onBackground }}>
                Supplier
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {item.supplier?.name ?? item.supplierId}
              </Text>
            </View>

            <View style={styles.section}>
              <Text variant="titleSmall" style={{ color: theme.colors.onBackground }}>
                Purchase Date
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {formatDate(item.purchaseDate)}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <Button
              mode="outlined"
              onPress={() => setDeleteDialogVisible(true)}
              textColor={theme.colors.error}
              loading={deleting}
              disabled={deleting}
            >
              Delete Item
            </Button>
          </>
        )}
      </ScrollView>

      {/* ── Date Picker ── */}
      {datePickerVisible && (
        <DateTimePicker
          value={purchaseDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          onTouchCancel={() => setDatePickerVisible(false)}
        />
      )}

      {/* ── Supplier Picker Modal ── */}
      <Modal visible={supplierPickerVisible} transparent animationType="fade" onRequestClose={() => setSupplierPickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]}>
            <Text variant="titleMedium" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              Select Supplier
            </Text>
            <ScrollView>
              {suppliersList.map((s) => (
                <TouchableRipple
                  key={s.id}
                  onPress={() => {
                    setSelectedSupplier(s);
                    setSupplierPickerVisible(false);
                  }}
                  style={styles.modalItem}
                >
                  <View>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                      {s.name}
                    </Text>
                    {s.phone && <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{s.phone}</Text>}
                  </View>
                </TouchableRipple>
              ))}
              {suppliersList.length === 0 && (
                <Text style={{ padding: 16, color: theme.colors.onSurfaceVariant }}>No suppliers available</Text>
              )}
            </ScrollView>
            <Button onPress={() => setSupplierPickerVisible(false)} style={{ margin: 8 }}>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
        <Dialog.Title>Delete Item?</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            Are you sure you want to delete &quot;{item.name}&quot;? This action cannot be undone.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
          <Button textColor={theme.colors.error} onPress={handleDelete} loading={deleting} disabled={deleting}>
            Delete
          </Button>
        </Dialog.Actions>
      </Dialog>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: { padding: 16, paddingBottom: 40 },
  section: { marginTop: 16, gap: 4 },
  divider: { marginVertical: 16 },
  label: { marginBottom: 8, marginTop: 12 },
  input: { marginBottom: 8 },
  picker: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 14,
    marginBottom: 8,
  },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 24 },
  actionBtn: { flex: 1 },
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
