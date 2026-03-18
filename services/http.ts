import axios from 'axios';
import Constants from 'expo-constants';
import { authClient } from './authClient';

const baseUrl = Constants.expoConfig?.extra?.apiBaseUrl ?? 'https://wyne-online-shop-management.vercel.app';

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
