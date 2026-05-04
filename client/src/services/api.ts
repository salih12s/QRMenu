import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

const AUTH_STORAGE_KEY = 'ugurum.auth';

export function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed.token ?? null;
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: unknown) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getStoredUser<T = unknown>(): T | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { user?: T };
    return parsed.user ?? null;
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401) {
      clearStoredAuth();
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  },
);
