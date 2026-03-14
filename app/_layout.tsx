import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider, useThemeContext } from '@/contexts/ThemeContext';
import { authClient } from '@/services/authClient';

const queryClient = new QueryClient();

function AppContent() {
  const { theme } = useThemeContext();
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const segments = useSegments();
  // Track whether the initial session load is done — subsequent isPending
  // flips (e.g. after signIn refetch) must not unmount <Slot />, otherwise
  // segments resets to [] and the auth guard redirects back to login.
  const [initialLoad, setInitialLoad] = React.useState(true);

  React.useEffect(() => {
    if (!isPending) setInitialLoad(false);
  }, [isPending]);

  React.useEffect(() => {
    if (isPending || initialLoad) return;
    if (segments.length === 0) return; // route transition — don't act
    const inAuthGroup = segments[0] === '(auth)';
    console.log('[auth guard]', { session: session?.user?.email ?? null, inAuthGroup, segments });
    if (!session && !inAuthGroup) {
      console.log('[auth guard] no session → login');
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      console.log('[auth guard] has session → tabs');
      router.replace('/(app)/(drawer)/(tabs)');
    }
  }, [session, isPending, initialLoad, segments, router]);

  if (initialLoad && isPending) {
    return (
      <PaperProvider theme={theme}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <Slot />
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
