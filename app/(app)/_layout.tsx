import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

export default function AppLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.onPrimary,
      }}
    >
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="order/[id]" options={{ title: 'Order Detail' }} />
      <Stack.Screen name="order/create" options={{ title: 'New Order' }} />
      <Stack.Screen name="purchase-item/[id]" options={{ title: 'Item Detail' }} />
      <Stack.Screen name="purchase-item/create" options={{ title: 'New Item' }} />
      <Stack.Screen name="supplier/[id]" options={{ title: 'Supplier Detail' }} />
      <Stack.Screen name="supplier/create" options={{ title: 'New Supplier' }} />
      <Stack.Screen name="customer/[id]" options={{ title: 'Customer Detail' }} />
      <Stack.Screen name="customer/create" options={{ title: 'New Customer' }} />
    </Stack>
  );
}
