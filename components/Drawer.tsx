import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem, DrawerContentComponentProps } from '@react-navigation/drawer';
import { Avatar, Divider, Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { authClient } from '@/services/authClient';

export default function DrawerContent(props: DrawerContentComponentProps) {
  const theme = useTheme();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]}>
        <Avatar.Icon
          size={52}
          icon="account-circle"
          style={{ backgroundColor: theme.colors.primary }}
          color={theme.colors.onPrimary}
        />
        <Text variant="titleMedium" style={[styles.name, { color: theme.colors.onPrimaryContainer }]}>
          {session?.user?.name ?? 'Admin'}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer }}>
          {session?.user?.email ?? ''}
        </Text>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <Divider />
      <DrawerItem
        label="Logout"
        icon={({ color, size }) => (
          <Text style={{ color, fontSize: size }}>⏻</Text>
        )}
        onPress={handleLogout}
        labelStyle={{ color: theme.colors.error }}
        style={styles.logoutItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 48,
    paddingBottom: 16,
    gap: 4,
  },
  name: {
    marginTop: 8,
    fontWeight: '600',
  },
  logoutItem: {
    marginBottom: 8,
  },
});
