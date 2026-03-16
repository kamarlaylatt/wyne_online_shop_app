import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  Button,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCreateCustomer } from '@/hooks/useCustomers';

export default function CreateCustomerScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { mutate: createCustomer, isPending: creating } = useCreateCustomer();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [snackMessage, setSnackMessage] = useState('');

  const isValid = () => {
    return name.trim();
  };

  const handleSubmit = () => {
    if (!isValid()) {
      setSnackMessage('Customer name is required.');
      return;
    }

    createCustomer(
      {
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      },
      {
        onSuccess: (customer) => {
          router.replace(`/(app)/customer/${customer.id}`);
        },
        onError: (err: any) => {
          setSnackMessage(err?.response?.data?.message ?? 'Failed to create customer.');
        },
      }
    );
  };

  return (
    <SafeAreaView edges={['left', 'right']} style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Customer Name *
        </Text>
        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Phone
        </Text>
        <TextInput
          label="Phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          mode="outlined"
          style={styles.input}
        />

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Address
        </Text>
        <TextInput
          label="Address"
          value={address}
          onChangeText={setAddress}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={3}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={creating}
          disabled={creating}
          style={styles.submitBtn}
          contentStyle={styles.submitContent}
        >
          Create Customer
        </Button>
      </ScrollView>

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
  scroll: { padding: 16, paddingBottom: 40 },
  sectionTitle: { marginBottom: 8, marginTop: 12 },
  input: { marginBottom: 4 },
  submitBtn: { marginTop: 24 },
  submitContent: { paddingVertical: 6 },
});
