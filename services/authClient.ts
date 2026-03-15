import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const baseUrl = Constants.expoConfig?.extra?.apiBaseUrl ?? 'http://localhost:3000';

export const authClient = createAuthClient({
  baseURL: baseUrl,
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
