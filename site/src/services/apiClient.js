import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const SESSION_KEY = 'laf_session';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const sessionRaw = window.localStorage.getItem(SESSION_KEY);
  if (sessionRaw) {
    try {
      const session = JSON.parse(sessionRaw);
      if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    } catch (error) {
      // ignore JSON parse errors; session será recriado no login
    }
  }
  return config;
});

export const setAuthToken = (token) => {
  if (!token) return;
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  delete api.defaults.headers.common.Authorization;
};

export default api;
