import { getItem, setItem } from './storageService';
import { seedCategories } from './seedData';
import { generateId } from '../utils/id';

const CATEGORIES_KEY = 'laf_categories';

const ensureSeed = () => {
  const existing = getItem(CATEGORIES_KEY);
  if (!existing || !Array.isArray(existing) || existing.length === 0) {
    setItem(CATEGORIES_KEY, seedCategories);
    return seedCategories;
  }
  return existing;
};

export const getCategories = () => ensureSeed().sort((a, b) => a.nome.localeCompare(b.nome));

export const getCategoryById = (id) => getCategories().find((category) => category.id === id);

export const getCategoryBySlug = (slug) =>
  getCategories().find((category) => category.slug === slug);

export const getActiveCategories = () => getCategories().filter((category) => category.ativa);

export const createCategory = (data) => {
  const categories = ensureSeed();
  const newCategory = {
    ...data,
    id: generateId('cat'),
    criadoEm: new Date().toISOString(),
    ativa: data.ativa ?? true,
  };

  setItem(CATEGORIES_KEY, [...categories, newCategory]);
  return newCategory;
};

export const updateCategory = (id, data) => {
  const categories = ensureSeed();
  const index = categories.findIndex((category) => category.id === id);
  if (index === -1) throw new Error('Categoria não encontrada');

  const updated = { ...categories[index], ...data };
  const nextCategories = [...categories];
  nextCategories[index] = updated;
  setItem(CATEGORIES_KEY, nextCategories);
  return updated;
};

export const toggleCategory = (id) => {
  const category = getCategoryById(id);
  if (!category) throw new Error('Categoria não encontrada');
  return updateCategory(id, { ativa: !category.ativa });
};

export const deleteCategory = (id) => {
  const categories = ensureSeed().filter((category) => category.id !== id);
  setItem(CATEGORIES_KEY, categories);
  return categories;
};
