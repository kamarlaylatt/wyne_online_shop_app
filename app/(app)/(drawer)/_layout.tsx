import { Drawer } from 'expo-router/drawer';
import { useTheme } from 'react-native-paper';
import DrawerContent from '@/components/Drawer';

export default function DrawerLayout() {
  const theme = useTheme();

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.onPrimary,
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onSurfaceVariant,
        drawerStyle: { backgroundColor: theme.colors.surface },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{ headerShown: false, title: 'Home', drawerIcon: ({ color }) => null }}
      />
      <Drawer.Screen
        name="suppliers"
        options={{ title: 'Suppliers', drawerIcon: ({ color }) => null }}
      />
      <Drawer.Screen
        name="settings"
        options={{ title: 'Settings', drawerIcon: ({ color }) => null }}
      />
      <Drawer.Screen
        name="about"
        options={{ title: 'About', drawerIcon: ({ color }) => null }}
      />
    </Drawer>
  );
}
