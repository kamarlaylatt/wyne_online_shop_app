import React, { useState } from 'react';
import { Clipboard, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Dialog,
  Divider,
  IconButton,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/useCustomers';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { data: customer, isPending, isError } = useCustomer(id);
  const { mutate: updateCustomer, isPending: updating } = useUpdateCustomer(id);
  const { mutate: deleteCustomer, isPending: deleting } = useDeleteCustomer(id);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  const initializeEditForm = () => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone ?? '');
      setAddress(customer.address ?? '');
    }
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      initializeEditForm();
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setSnackMessage('Customer name is required.');
      return;
    }

    updateCustomer(
      {
        name: name.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setSnackMessage('Customer updated successfully.');
        },
        onError: (err: any) => {
          setSnackMessage(err?.response?.data?.message ?? 'Failed to update customer.');
        },
      }
    );
  };

  const handleDelete = () => {
    setDeleteDialogVisible(false);
    deleteCustomer(undefined, {
      onSuccess: () => {
        router.back();
      },
      onError: (err: any) => {
        setSnackMessage(err?.response?.data?.message ?? 'Failed to delete customer.');
      },
    });
  };

  const handleCopyCustomerId = () => {
    Clipboard.setString(customer.id);
    setSnackMessage('Customer ID copied to clipboard');
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

  if (isError || !customer) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <Text variant="titleMedium" style={{ color: theme.colors.error }}>
            Failed to load customer
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="titleLarge" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>
            {isEditing ? 'Edit Customer' : customer.name}
          </Text>
          {!isEditing && (
            <View style={styles.idRow}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                ID: {customer.id}
              </Text>
              <IconButton icon="content-copy" size={16} onPress={handleCopyCustomerId} />
            </View>
          )}
        </View>
        <IconButton icon={isEditing ? 'close' : 'pencil'} onPress={handleEditToggle} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {isEditing ? (
          <>
            <TextInput
              label="Customer Name *"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Address"
              value={address}
              onChangeText={setAddress}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
            />

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
            {customer.phone && (
              <View style={styles.section}>
                <Text variant="titleSmall" style={{ color: theme.colors.onBackground }}>
                  Phone
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {customer.phone}
                </Text>
              </View>
            )}

            {customer.address && (
              <View style={styles.section}>
                <Text variant="titleSmall" style={{ color: theme.colors.onBackground }}>
                  Address
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {customer.address}
                </Text>
              </View>
            )}

            {(customer.phone || customer.address) && <Divider style={styles.divider} />}

            <Button
              mode="outlined"
              onPress={() => setDeleteDialogVisible(true)}
              textColor={theme.colors.error}
              loading={deleting}
              disabled={deleting}
            >
              Delete Customer
            </Button>
          </>
        )}
      </ScrollView>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
        <Dialog.Title>Delete Customer?</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            Are you sure you want to delete &quot;{customer.name}&quot;? This action cannot be undone.
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
  idRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 0 },
  content: { padding: 16, paddingBottom: 40 },
  section: { marginTop: 16, gap: 4 },
  divider: { marginVertical: 16 },
  input: { marginBottom: 8 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 24 },
  actionBtn: { flex: 1 },
});
