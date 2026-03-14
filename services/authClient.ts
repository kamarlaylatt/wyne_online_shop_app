import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000',
  basePath: '/api/admin/auth',
  plugins: [
    expoClient({
      scheme: 'wyneonlineshopapp',
      storagePrefix: 'wyne-admin',
      storage: SecureStore,
      cookiePrefix: 'admin',  // must match server's advanced.cookiePrefix
    }),
  ],
});
