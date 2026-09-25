import axios from 'axios';
import { createApi } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { logout } from '../features/auth/authSlice';
import { setSelectedStore } from '../features/auth/storeContextSlice';

function resolveApiUrl() {
  const backendUrl = String(import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
  if (backendUrl) return `${backendUrl}/api/v1`;
  if (import.meta.env.VITE_API_URL) return String(import.meta.env.VITE_API_URL).replace(/\/$/, '');
  return '/api/v1';
}

const API_URL = resolveApiUrl();

export const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken() {
  const response = await axios.post(
    `${API_URL}/auth/refresh-token`,
    {},
    { withCredentials: true }
  );
  return response.data?.data?.accessToken as string;
}

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sns_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const storeId = localStorage.getItem('sns_store_id');
  if (storeId) {
    config.headers['X-Store-Id'] = storeId;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const publicAuth = ['/auth/login', '/auth/forgot-password', '/auth/verify-otp', '/auth/reset-password'];
    const isPublicAuth = publicAuth.some((path) => String(original.url || '').includes(path));
    if (error.response?.status === 401 && !original._retry && !isPublicAuth) {
      original._retry = true;
      try {
        refreshPromise = refreshPromise || refreshAccessToken();
        const token = await refreshPromise;
        refreshPromise = null;
        if (token) {
          localStorage.setItem('sns_access_token', token);
          original.headers.Authorization = `Bearer ${token}`;
          return axiosClient(original);
        }
      } catch {
        refreshPromise = null;
        localStorage.removeItem('sns_access_token');
      }
    }
    return Promise.reject(error);
  }
);

const axiosBaseQuery =
  (): BaseQueryFn<{ url: string; method?: string; data?: unknown; params?: Record<string, unknown> }> =>
  async ({ url, method = 'GET', data, params }, api) => {
    try {
      const state = api.getState() as {
        auth: { accessToken: string | null };
        storeContext: { selectedStoreId: string | null };
      };
      const response = await axiosClient.request({
        url,
        method,
        data,
        params: {
          ...params,
          storeId: params?.storeId ?? state.storeContext.selectedStoreId ?? undefined,
        },
        headers: {
          Authorization: state.auth.accessToken ? `Bearer ${state.auth.accessToken}` : undefined,
        },
      });
      return { data: response.data };
    } catch (error) {
      const err = error as { response?: { status: number; data: { message?: string; user?: unknown; accessToken?: string } } };
      if (err.response?.status === 401) {
        const token = (api.getState() as { auth?: { accessToken?: string | null } }).auth?.accessToken;
        if (token) {
          api.dispatch(logout());
          api.dispatch(setSelectedStore(null));
          api.dispatch(api.util.resetApiState());
        }
      }
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data,
        },
      };
    }
  };

export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    'Auth',
    'Dashboard',
    'Store',
    'Sale',
    'Expense',
    'ExpenseCategory',
    'PaymentMethod',
    'User',
    'Role',
    'Report',
    'Settings',
  ],
  endpoints: () => ({}),
});

export { setCredentials };
