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
      <Stack.Screen name="purchase-item/[id]" options={{ title: 'Item Detail' }} />
    </Stack>
  );
}
