// src/lib/api.ts
import { store } from '@/services/store';
import axios from 'axios';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_BASE_URL });

api.interceptors.request.use((config) => {
  const token =
    store.getState().auth.accessToken ??
    (typeof window !== 'undefined' && sessionStorage.getItem('access_token'));
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

export async function sendContactEmail(email: string) {
  return api.post('/api/v1/common/contact', { email });
}
