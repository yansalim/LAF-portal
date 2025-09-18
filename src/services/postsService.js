import { getItem, setItem } from './storageService';
import { seedPosts } from './seedData';
import { generateId } from '../utils/id';
import { compareByPublishedDesc } from '../utils/dates';

const POSTS_KEY = 'laf_posts';

const ensureSeed = () => {
  const existing = getItem(POSTS_KEY);
  if (!existing || !Array.isArray(existing) || existing.length === 0) {
    setItem(POSTS_KEY, seedPosts);
    return seedPosts;
  }
  return existing;
};

export const getPosts = () => ensureSeed().sort((a, b) => compareByPublishedDesc(a, b));

export const getPostById = (id) => ensureSeed().find((post) => post.id === id);

export const getPostBySlug = (slug) => ensureSeed().find((post) => post.slug === slug);

export const getPostsByCategoryId = (categoryId) =>
  ensureSeed().filter((post) => post.categoriaId === categoryId);

export const savePost = (data) => {
  const posts = ensureSeed();
  const index = posts.findIndex((post) => post.id === data.id);
  const timestamp = new Date().toISOString();

  if (index >= 0) {
    const updated = {
      ...posts[index],
      ...data,
      atualizadoEm: timestamp,
    };
    const next = [...posts];
    next[index] = updated;
    setItem(POSTS_KEY, next);
    return updated;
  }

  const newPost = {
    ...data,
    id: generateId('post'),
    criadoEm: timestamp,
    atualizadoEm: timestamp,
  };
  setItem(POSTS_KEY, [...posts, newPost]);
  return newPost;
};

export const deletePost = (id) => {
  const posts = ensureSeed().filter((post) => post.id !== id);
  setItem(POSTS_KEY, posts);
  return posts;
};

export const updatePostStatus = (id, status, publicadoEm) => {
  const post = getPostById(id);
  if (!post) throw new Error('Post não encontrado');

  const shouldRequireDate = status === 'publicado' || status === 'agendado';
  const nextPublicadoEm = shouldRequireDate
    ? publicadoEm ?? post.publicadoEm ?? new Date().toISOString()
    : undefined;

  return savePost({
    ...post,
    status,
    publicadoEm: nextPublicadoEm,
  });
};

export const upsertManyPosts = (posts) => setItem(POSTS_KEY, posts);
