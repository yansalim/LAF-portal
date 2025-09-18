import { getItem, setItem } from './storageService';
import { seedUsers } from './seedData';
import { generateId } from '../utils/id';

const USERS_KEY = 'laf_users';
const FULL_ACCESS_ROLES = new Set(['admin', 'secretaria']);
const TJD_CATEGORY_SLUG = 'comunicados-tjd';

const ensureSeed = () => {
  const existing = getItem(USERS_KEY);
  if (!existing || !Array.isArray(existing) || existing.length === 0) {
    setItem(USERS_KEY, seedUsers);
    return seedUsers;
  }
  return existing;
};

const normalizeEmail = (email) => email?.trim().toLowerCase() ?? '';

const serializeAllowedCategories = (value) => (value && value.length > 0 ? value : undefined);

const sanitizeAllowedCategories = (role, allowedCategorySlugs = []) => {
  if (FULL_ACCESS_ROLES.has(role) || role === 'leitor') {
    return undefined;
  }

  if (role === 'tjd') {
    return [TJD_CATEGORY_SLUG];
  }

  const array = Array.isArray(allowedCategorySlugs) ? allowedCategorySlugs : [];
  const unique = Array.from(new Set(array.filter(Boolean)));

  if (role === 'editor' && unique.length === 0) {
    throw new Error('Selecione pelo menos uma categoria para o papel de editor.');
  }

  return unique;
};

export const getUsers = () => ensureSeed();

export const getUserById = (id) => getUsers().find((user) => user.id === id);

export const getUserByEmail = (email) =>
  getUsers().find((user) => user.email.toLowerCase() === email.toLowerCase());

export const createUser = (data) => {
  const users = ensureSeed();
  const nome = data.nome?.trim();
  if (!nome) throw new Error('Informe o nome do usuário.');

  const email = normalizeEmail(data.email);
  if (!email) throw new Error('Informe um e-mail válido.');

  if (users.some((user) => user.email === email)) {
    throw new Error('E-mail já cadastrado.');
  }

  const role = data.role ?? 'leitor';
  const senha = data.senha?.trim() || '123456';
  if (!senha) throw new Error('Informe uma senha.');

  const allowedCategorySlugs = sanitizeAllowedCategories(role, data.allowedCategorySlugs);
  const timestamp = new Date().toISOString();

  const newUser = {
    id: generateId('user'),
    nome,
    email,
    role,
    senha,
    allowedCategorySlugs: serializeAllowedCategories(allowedCategorySlugs),
    criadoEm: timestamp,
    atualizadoEm: timestamp,
  };

  setItem(USERS_KEY, [...users, newUser]);
  return newUser;
};

export const updateUser = (id, data) => {
  const users = ensureSeed();
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) throw new Error('Usuário não encontrado.');

  const current = users[index];
  const nome = (data.nome ?? current.nome)?.trim();
  if (!nome) throw new Error('Informe o nome do usuário.');

  const role = data.role ?? current.role;
  const email = data.email ? normalizeEmail(data.email) : current.email;
  if (!email) throw new Error('Informe um e-mail válido.');

  if (users.some((user) => user.id !== id && user.email === email)) {
    throw new Error('E-mail já cadastrado.');
  }

  const allowedCategorySlugs = sanitizeAllowedCategories(
    role,
    data.allowedCategorySlugs ?? current.allowedCategorySlugs ?? [],
  );

  const senha = data.senha?.trim();

  const updatedUser = {
    ...current,
    ...data,
    id: current.id,
    nome,
    role,
    email,
    senha: senha ? senha : current.senha,
    allowedCategorySlugs: serializeAllowedCategories(allowedCategorySlugs),
    atualizadoEm: new Date().toISOString(),
  };

  const nextUsers = [...users];
  nextUsers[index] = updatedUser;
  setItem(USERS_KEY, nextUsers);
  return updatedUser;
};

export const deleteUser = (id) => {
  const users = ensureSeed().filter((user) => user.id !== id);
  setItem(USERS_KEY, users);
  return users;
};
