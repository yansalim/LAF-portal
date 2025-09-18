import { getUserByEmail } from './usersService';
import { getItem, removeItem, setItem } from './storageService';
import { generateId } from '../utils/id';

const SESSION_KEY = 'laf_session';
const SESSION_HOURS = 12;

export const getSession = () => getItem(SESSION_KEY);

export const setSession = (session) => setItem(SESSION_KEY, session);

export const clearSession = () => removeItem(SESSION_KEY);

export const login = ({ email, password }) => {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) throw new Error('Informe o e-mail');

  const user = getUserByEmail(normalizedEmail);
  if (!user || user.senha !== password) {
    throw new Error('Credenciais inválidas');
  }

  const expires = new Date();
  expires.setHours(expires.getHours() + SESSION_HOURS);

  const session = {
    token: generateId('token'),
    userId: user.id,
    expiraEm: expires.toISOString(),
  };

  setSession(session);
  return { session, user };
};

export const logout = () => {
  clearSession();
};
