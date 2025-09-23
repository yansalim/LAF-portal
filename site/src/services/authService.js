import api, { clearAuthToken, setAuthToken } from './apiClient';
import { mapUser } from './usersService';
import { getItem, removeItem, setItem } from './storageService';

const SESSION_KEY = 'laf_session';

export const getSession = () => {
  const raw = getItem(SESSION_KEY);
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const session = {
    token: raw.token,
    userId: raw.userId,
    user: raw.user,
  };
  if (session?.token) {
    setAuthToken(session.token);
  }
  return session;
};

export const setSession = (session) => {
  setItem(SESSION_KEY, session);
  setAuthToken(session?.token);
};

export const clearSession = () => {
  removeItem(SESSION_KEY);
  clearAuthToken();
};

export const login = async ({ email, password }) => {
  const response = await api.post('/auth/login', { email, password });
  const { access_token: accessToken, user } = response.data?.data ?? {};
  if (!accessToken || !user) {
    throw new Error('Resposta de autenticação inválida');
  }

  const session = {
    token: accessToken,
    userId: user.id,
    user: mapUser(user),
  };
  setSession(session);
  return { session, user: session.user };
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // ignore
  }
  clearSession();
};

export const fetchCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return mapUser(response.data?.data);
};
