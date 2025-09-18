export const generateId = (prefix = 'id') => {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return uuid;

  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`;
};
