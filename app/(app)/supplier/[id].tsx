import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
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
import { useSupplier, useUpdateSupplier, useDeleteSupplier } from '@/hooks/useSuppliers';

export default function SupplierDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { data: supplier, isPending, isError } = useSupplier(id);
  const { mutate: updateSupplier, isPending: updating } = useUpdateSupplier(id);
  const { mutate: deleteSupplier, isPending: deleting } = useDeleteSupplier(id);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  const initializeEditForm = () => {
    if (supplier) {
      setName(supplier.name);
      setPhone(supplier.phone ?? '');
      setEmail(supplier.email ?? '');
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
      setSnackMessage('Supplier name is required.');
      return;
    }

    updateSupplier(
      {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setSnackMessage('Supplier updated successfully.');
        },
        onError: (err: any) => {
          console.error('[supplier update error]', err?.response?.data);
          setSnackMessage(err?.response?.data?.message ?? 'Failed to update supplier.');
        },
      }
    );
  };

  const handleDelete = () => {
    setDeleteDialogVisible(false);
    deleteSupplier(undefined, {
      onSuccess: () => {
        router.back();
      },
      onError: (err: any) => {
        setSnackMessage(err?.response?.data?.message ?? 'Failed to delete supplier.');
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

  if (isError || !supplier) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <Text variant="titleMedium" style={{ color: theme.colors.error }}>
            Failed to load supplier
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
            {isEditing ? 'Edit Supplier' : supplier.name}
          </Text>
          {!isEditing && (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              ID: {supplier.id}
            </Text>
          )}
        </View>
        <IconButton icon={isEditing ? 'close' : 'pencil'} onPress={handleEditToggle} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {isEditing ? (
          <>
            <TextInput
              label="Supplier Name *"
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
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              mode="outlined"
              style={styles.input}
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
            <View style={styles.section}>
              <Text variant="titleSmall" style={{ color: theme.colors.onBackground }}>
                Phone
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {supplier.phone ?? '—'}
              </Text>
            </View>

            <View style={styles.section}>
              <Text variant="titleSmall" style={{ color: theme.colors.onBackground }}>
                Email
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {supplier.email ?? '—'}
              </Text>
            </View>

            {supplier._count && (
              <View style={styles.section}>
                <Text variant="titleSmall" style={{ color: theme.colors.onBackground }}>
                  Purchase Items
                </Text>
                <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                  {supplier._count.purchaseItems}
                </Text>
              </View>
            )}

            <Divider style={styles.divider} />

            <Button
              mode="outlined"
              onPress={() => setDeleteDialogVisible(true)}
              textColor={theme.colors.error}
              loading={deleting}
              disabled={deleting}
            >
              Delete Supplier
            </Button>
          </>
        )}
      </ScrollView>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
        <Dialog.Title>Delete Supplier?</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            Are you sure you want to delete &quot;{supplier.name}&quot;? This action cannot be undone.
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
  input: { marginBottom: 8 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 24 },
  actionBtn: { flex: 1 },
});
