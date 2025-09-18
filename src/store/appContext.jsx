import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategory,
  getCategoryBySlug,
} from '../services/categoriesService';
import {
  getPosts,
  savePost,
  deletePost,
  updatePostStatus,
  getPostById,
  getPostBySlug,
} from '../services/postsService';
import { getUsers, getUserById } from '../services/usersService';
import { getSession, login, logout } from '../services/authService';
import { filterVisiblePosts } from '../services/scheduleService';
import { slugify, ensureUniqueSlug } from '../utils/slugify';

const AppContext = createContext(null);

const defaultState = {
  categories: [],
  posts: [],
  users: [],
};

const ROLE_FULL_ACCESS = new Set(['admin', 'secretaria']);

const resolveAllowedCategorySlugs = (user, categories) => {
  if (!user) return [];
  if (ROLE_FULL_ACCESS.has(user.role)) {
    return categories.map((category) => category.slug);
  }

  if (user.role === 'tjd') {
    return ['comunicados-tjd'];
  }

  if (user.allowedCategorySlugs && user.allowedCategorySlugs.length > 0) {
    return user.allowedCategorySlugs;
  }

  return [];
};

export const AppProvider = ({ children }) => {
  // Centralizamos os dados numa store em memória para manter o portal responsivo e sincronizado com o localStorage.
  const [state, setState] = useState(defaultState);
  const [session, setSessionState] = useState(() => getSession());
  const [currentUser, setCurrentUser] = useState(null);

  const refreshCategories = useCallback(() => {
    setState((prev) => ({ ...prev, categories: getCategories() }));
  }, []);

  const refreshPosts = useCallback(() => {
    setState((prev) => ({ ...prev, posts: getPosts() }));
  }, []);

  const refreshUsers = useCallback(() => {
    setState((prev) => ({ ...prev, users: getUsers() }));
  }, []);

  useEffect(() => {
    // Inicializamos dados seed logo na montagem para manter a experiência consistente.
    const categories = getCategories();
    const posts = getPosts();
    const users = getUsers();
    setState({ categories, posts, users });
  }, []);

  useEffect(() => {
    if (!session) {
      setCurrentUser(null);
      return;
    }

    const { userId, expiraEm } = session;
    const expiresAt = new Date(expiraEm);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      handleLogout();
      return;
    }

    const user = getUserById(userId);
    setCurrentUser(user ?? null);
  }, [session]);

  useEffect(() => {
    if (session && currentUser) return undefined;

    if (session && !currentUser) {
      const user = getUserById(session.userId);
      setCurrentUser(user ?? null);
    }

    return undefined;
  }, [session, currentUser]);

  const handleLogin = useCallback((credentials) => {
    const { session: newSession, user } = login(credentials);
    setSessionState(newSession);
    setCurrentUser(user);
    return user;
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setSessionState(null);
    setCurrentUser(null);
  }, []);

  const handleCreateCategory = useCallback((payload) => {
    const slug = payload.slug ? slugify(payload.slug) : slugify(payload.nome);
    const existingSlugs = state.categories.map((category) => category.slug);
    const uniqueSlug = ensureUniqueSlug(slug, existingSlugs);

    createCategory({ ...payload, slug: uniqueSlug });
    refreshCategories();
  }, [refreshCategories, state.categories]);

  const handleUpdateCategory = useCallback(
    (id, payload) => {
      const slug = payload.slug ? slugify(payload.slug) : slugify(payload.nome);
      const existingSlugs = state.categories
        .filter((category) => category.id !== id)
        .map((category) => category.slug);
      const uniqueSlug = ensureUniqueSlug(slug, existingSlugs);
      updateCategory(id, { ...payload, slug: uniqueSlug });
      refreshCategories();
    },
    [refreshCategories, state.categories],
  );

  const handleDeleteCategory = useCallback(
    (id) => {
      deleteCategory(id);
      refreshCategories();
    },
    [refreshCategories],
  );

  const handleToggleCategory = useCallback(
    (id) => {
      toggleCategory(id);
      refreshCategories();
    },
    [refreshCategories],
  );

  const handleSavePost = useCallback(
    (payload) => {
      const slug = payload.slug ? slugify(payload.slug) : slugify(payload.titulo);
      const existingSlugs = state.posts
        .filter((post) => post.id !== payload.id)
        .map((post) => post.slug);
      const uniqueSlug = ensureUniqueSlug(slug, existingSlugs);

      savePost({ ...payload, slug: uniqueSlug });
      refreshPosts();
    },
    [refreshPosts, state.posts],
  );

  const handleDeletePost = useCallback(
    (id) => {
      deletePost(id);
      refreshPosts();
    },
    [refreshPosts],
  );

  const handleUpdatePostStatus = useCallback(
    (id, status, publicadoEm) => {
      updatePostStatus(id, status, publicadoEm);
      refreshPosts();
    },
    [refreshPosts],
  );

  const getVisiblePosts = useCallback(
    ({ categorySlug } = {}) => {
      const categories = state.categories;
      const posts = filterVisiblePosts(state.posts, categories);

      if (!categorySlug) {
        return posts;
      }

      const category = categories.find((item) => item.slug === categorySlug);
      if (!category) return [];

      return posts.filter((post) => post.categoriaId === category.id);
    },
    [state.categories, state.posts],
  );

  const getPostBySlugMemo = useCallback((slug) => getPostBySlug(slug), []);

  const allowedCategorySlugs = useMemo(
    () => resolveAllowedCategorySlugs(currentUser, state.categories),
    [currentUser, state.categories],
  );

  const allowedCategories = useMemo(() => {
    if (!currentUser) return [];
    if (ROLE_FULL_ACCESS.has(currentUser.role)) {
      return state.categories;
    }
    return state.categories.filter((category) => allowedCategorySlugs.includes(category.slug));
  }, [allowedCategorySlugs, currentUser, state.categories]);

  const activeCategories = useMemo(
    () => state.categories.filter((category) => category.ativa),
    [state.categories],
  );

  const value = useMemo(
    () => ({
      categories: state.categories,
      activeCategories,
      posts: state.posts,
      users: state.users,
      session,
      currentUser,
      allowedCategorySlugs,
      allowedCategories,
      login: handleLogin,
      logout: handleLogout,
      createCategory: handleCreateCategory,
      updateCategory: handleUpdateCategory,
      deleteCategory: handleDeleteCategory,
      toggleCategory: handleToggleCategory,
      savePost: handleSavePost,
      deletePost: handleDeletePost,
      updatePostStatus: handleUpdatePostStatus,
      refreshPosts,
      refreshCategories,
      refreshUsers,
      getVisiblePosts,
      getPostById,
      getPostBySlug: getPostBySlugMemo,
      getCategoryBySlug,
    }),
    [
      state.categories,
      state.posts,
      state.users,
      session,
      currentUser,
      allowedCategorySlugs,
      allowedCategories,
      activeCategories,
      handleLogin,
      handleLogout,
      handleCreateCategory,
      handleUpdateCategory,
      handleDeleteCategory,
      handleToggleCategory,
      handleSavePost,
      handleDeletePost,
      handleUpdatePostStatus,
      refreshPosts,
      refreshCategories,
      refreshUsers,
      getVisiblePosts,
      getPostBySlugMemo,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de AppProvider');
  }
  return context;
};
