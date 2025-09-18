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

export const getItem = (key, fallback = null) => {
  try {
    const storage = getStorage();
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    console.error('Erro ao ler do localStorage', error);
    return fallback;
  }
};

export const setItem = (key, value) => {
  try {
    const storage = getStorage();
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Erro ao gravar no localStorage', error);
  }
};

export const removeItem = (key) => {
  try {
    const storage = getStorage();
    storage.removeItem(key);
  } catch (error) {
    console.error('Erro ao remover do localStorage', error);
  }
};
