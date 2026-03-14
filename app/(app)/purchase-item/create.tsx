import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Modal, Platform } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Snackbar,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCreatePurchaseItem } from '@/hooks/useInventory';
import { useSuppliers } from '@/hooks/useSuppliers';
import type { Supplier } from '@/types/models';

export default function CreatePurchaseItemScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: suppliers, isPending: suppliersLoading } = useSuppliers();
  const { mutate: createPurchaseItem, isPending: creating } = useCreatePurchaseItem();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [totalPrice, setTotalPrice] = useState('0');
  const [sellPerPrice, setSellPerPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierPickerVisible, setSupplierPickerVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setDatePickerVisible(false);
    }
    if (selectedDate) {
      setPurchaseDate(selectedDate);
    }
  };

  const isValid = () => {
    return (
      name.trim() &&
      selectedSupplier &&
      (parseFloat(quantity) || 0) > 0 &&
      (parseFloat(totalPrice) || 0) > 0
    );
  };

  const handleSubmit = () => {
    if (!isValid()) {
      setSnackMessage('Please fill in all required fields.');
      return;
    }

    createPurchaseItem(
      {
        name: name.trim(),
        quantity: parseFloat(quantity),
        totalPrice: parseFloat(totalPrice),
        supplierId: selectedSupplier!.id,
        purchaseDate: purchaseDate.toISOString(),
        sellPerPrice: sellPerPrice ? parseFloat(sellPerPrice) : undefined,
      },
      {
        onSuccess: (item) => {
          router.replace(`/(app)/purchase-item/${item.id}`);
        },
        onError: (err: any) => {
          setSnackMessage(err?.response?.data?.message ?? 'Failed to create inventory item.');
        },
      }
    );
  };

  if (suppliersLoading) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const suppliersList = suppliers ?? [];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Item Name *
        </Text>
        <TextInput
          label="Product name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Supplier *
        </Text>
        <TouchableRipple
          onPress={() => setSupplierPickerVisible(true)}
          style={[styles.picker, { borderColor: theme.colors.outline }]}
        >
          <Text style={{ color: selectedSupplier ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}>
            {selectedSupplier ? selectedSupplier.name : 'Select supplier…'}
          </Text>
        </TouchableRipple>

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Quantity *
        </Text>
        <TextInput
          label="Quantity"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Total Price *
        </Text>
        <TextInput
          label="Total price (IDR)"
          value={totalPrice}
          onChangeText={setTotalPrice}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Sell Per Price (Optional)
        </Text>
        <TextInput
          label="Unit sell price (IDR)"
          value={sellPerPrice}
          onChangeText={setSellPerPrice}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          helperText="Leave empty to auto-calculate"
        />

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
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

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={creating}
          disabled={creating}
          style={styles.submitBtn}
          contentStyle={styles.submitContent}
        >
          Create Item
        </Button>
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
  sectionTitle: { marginBottom: 8, marginTop: 12 },
  input: { marginBottom: 4 },
  picker: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 14,
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
