import axios from 'axios';
import { authClient } from './authClient';

const http = axios.create({
  baseURL: (process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000') + '/api/admin',
  timeout: 15000,
});

http.interceptors.request.use(async (config) => {
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
