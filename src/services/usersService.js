import { getItem, setItem } from './storageService';
import { seedUsers } from './seedData';
import { generateId } from '../utils/id';

const USERS_KEY = 'laf_users';

const ensureSeed = () => {
  const existing = getItem(USERS_KEY);
  if (!existing || !Array.isArray(existing) || existing.length === 0) {
    setItem(USERS_KEY, seedUsers);
    return seedUsers;
  }
  return existing;
};

export const getUsers = () => ensureSeed();

export const getUserById = (id) => getUsers().find((user) => user.id === id);

export const getUserByEmail = (email) =>
  getUsers().find((user) => user.email.toLowerCase() === email.toLowerCase());

export const upsertUser = (user) => {
  const users = getUsers();
  const index = users.findIndex((item) => item.id === user.id);
  const nextUsers = [...users];

  if (index >= 0) {
    nextUsers[index] = { ...users[index], ...user };
  } else {
    const newUser = {
      ...user,
      id: user.id ?? generateId('user'),
    };
    nextUsers.push(newUser);
  }

  setItem(USERS_KEY, nextUsers);
  return nextUsers;
};

export const deleteUser = (id) => {
  const users = getUsers().filter((user) => user.id !== id);
  setItem(USERS_KEY, users);
  return users;
};
