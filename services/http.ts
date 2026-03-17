import axios from 'axios';
import Constants from 'expo-constants';
import { authClient } from './authClient';

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? Constants.expoConfig?.extra?.apiBaseUrl ?? 'http://157.245.197.26';

const http = axios.create({
  baseURL: baseUrl + '/api/admin',
  timeout: 15000,
});

http.interceptors.request.use(async (config) => {
  console.log('[http]', config.method?.toUpperCase(), baseUrl + config.url);
  const cookies = await authClient.getCookie();
  if (cookies) {
    config.headers['Cookie'] = cookies;
  }
  return config;
});

if (__DEV__) {
  http.interceptors.response.use(
    (res) => res,
    (err) => {
      console.error('[http error]', err?.response?.status, err?.config?.url, err?.message);
      return Promise.reject(err);
    }
  );
}

export default http;
