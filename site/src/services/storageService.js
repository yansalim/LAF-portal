import CryptoJS from 'crypto-js';

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const getStorage = () => {
  if (!isBrowser()) {
    return {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    };
  }

  return window.localStorage;
};

const getSessionSecret = () => {
  const secret = import.meta.env.VITE_SESSION_SECRET;
  return typeof secret === 'string' && secret.length > 0 ? secret : 'laf-portal-dev-secret';
};

const encrypt = (value) => {
  const secret = getSessionSecret();
  return CryptoJS.AES.encrypt(JSON.stringify(value), secret).toString();
};

const decrypt = (cipherText) => {
  const secret = getSessionSecret();
  const bytes = CryptoJS.AES.decrypt(cipherText, secret);
  const decoded = bytes.toString(CryptoJS.enc.Utf8);
  if (!decoded) {
    throw new Error('Falha ao decodificar sessão');
  }
  return JSON.parse(decoded);
};

export const getItem = (key, fallback = null) => {
  try {
    const storage = getStorage();
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    return decrypt(raw);
  } catch (error) {
    console.error('Erro ao ler sessão segura', error);
    removeItem(key);
    return fallback;
  }
};

export const setItem = (key, value) => {
  try {
    const storage = getStorage();
    storage.setItem(key, encrypt(value));
  } catch (error) {
    console.error('Erro ao gravar sessão segura', error);
  }
};

export const removeItem = (key) => {
  try {
    const storage = getStorage();
    storage.removeItem(key);
  } catch (error) {
    console.error('Erro ao remover sessão segura', error);
  }
};
