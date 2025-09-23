import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import {
  fetchCategories,
  createCategory as createCategoryApi,
  updateCategory as updateCategoryApi,
  deleteCategory as deleteCategoryApi,
  fetchCategory as fetchCategoryApi,
} from '../services/categoriesService';
import {
  fetchPosts,
  createPost as createPostApi,
  updatePost as updatePostApi,
  deletePost as deletePostApi,
  publishPost as publishPostApi,
  schedulePost as schedulePostApi,
  fetchPost as fetchPostApi,
} from '../services/postsService';
import {
  fetchUsers,
  fetchUser as fetchUserApi,
  createUser as createUserApi,
  updateUser as updateUserApi,
  deleteUser as deleteUserApi,
} from '../services/usersService';
import {
  getSession,
  login as loginService,
  logout as logoutService,
  fetchCurrentUser,
} from '../services/authService';

const AppContext = createContext(null);

const initialState = {
  categories: [],
  posts: [],
  users: [],
  session: getSession(),
  currentUser: null,
  loading: {
    categories: false,
    posts: false,
    users: false,
  },
  error: null,
  initializing: true,
};

const ROLE_FULL_ACCESS = new Set(['admin', 'secretaria']);

const actionTypes = {
  SET_SESSION: 'SET_SESSION',
  SET_CURRENT_USER: 'SET_CURRENT_USER',
  SET_CATEGORIES: 'SET_CATEGORIES',
  SET_POSTS: 'SET_POSTS',
  SET_USERS: 'SET_USERS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_INITIALIZING: 'SET_INITIALIZING',
};

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_SESSION:
      return { ...state, session: action.payload };
    case actionTypes.SET_CURRENT_USER:
      return { ...state, currentUser: action.payload };
    case actionTypes.SET_CATEGORIES:
      return { ...state, categories: action.payload };
    case actionTypes.SET_POSTS:
      return { ...state, posts: action.payload };
    case actionTypes.SET_USERS:
      return { ...state, users: action.payload };
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value },
      };
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    case actionTypes.SET_INITIALIZING:
      return { ...state, initializing: action.payload };
    default:
      return state;
  }
};

const resolveAllowedCategorySlugs = (user, categories) => {
  if (!user) return [];
  if (ROLE_FULL_ACCESS.has(user.role)) {
    return categories.map((category) => category.slug);
  }

  if (user.role === 'tjd') {
    return ['tjd'];
  }

  if (user.allowedCategorySlugs && user.allowedCategorySlugs.length > 0) {
    return user.allowedCategorySlugs;
  }

  return [];
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setSessionState = useCallback((session) => {
    dispatch({ type: actionTypes.SET_SESSION, payload: session });
  }, []);

  const setCurrentUserState = useCallback((user) => {
    dispatch({ type: actionTypes.SET_CURRENT_USER, payload: user });
  }, []);

  const setCategoriesState = useCallback((categories) => {
    dispatch({ type: actionTypes.SET_CATEGORIES, payload: categories });
  }, []);

  const setPostsState = useCallback((posts) => {
    dispatch({ type: actionTypes.SET_POSTS, payload: posts });
  }, []);

  const setUsersState = useCallback((users) => {
    dispatch({ type: actionTypes.SET_USERS, payload: users });
  }, []);

  const setLoading = useCallback((key, value) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: { key, value } });
  }, []);

  const setError = useCallback((err) => {
    dispatch({ type: actionTypes.SET_ERROR, payload: err });
  }, []);

  const setInitializing = useCallback((value) => {
    dispatch({ type: actionTypes.SET_INITIALIZING, payload: value });
  }, []);

  const handleLogout = useCallback(async () => {
    await logoutService();
    setSessionState(null);
    setCurrentUserState(null);
    setCategoriesState([]);
    setPostsState([]);
    setUsersState([]);
  }, [setCategoriesState, setCurrentUserState, setPostsState, setSessionState, setUsersState]);

  const loadCurrentUser = useCallback(async () => {
    try {
      const user = await fetchCurrentUser();
      setCurrentUserState(user);
      return user;
    } catch (err) {
      console.error('Erro ao carregar usuário atual', err);
      handleLogout();
      return null;
    }
  }, [handleLogout, setCurrentUserState]);

  const loadCategories = useCallback(async () => {
    if (!state.session?.token) return;
    try {
      setLoading('categories', true);
      const { data } = await fetchCategories({ page_size: 100 });
      setCategoriesState(data);
    } catch (err) {
      console.error('Erro ao carregar categorias', err);
      setError(err);
    } finally {
      setLoading('categories', false);
    }
  }, [setCategoriesState, setError, setLoading, state.session?.token]);

  const loadPosts = useCallback(async () => {
    if (!state.session?.token) return;
    try {
      setLoading('posts', true);
      const { data } = await fetchPosts({ page_size: 100 });
      setPostsState(data);
    } catch (err) {
      console.error('Erro ao carregar posts', err);
      setError(err);
    } finally {
      setLoading('posts', false);
    }
  }, [setError, setLoading, setPostsState, state.session?.token]);

  const loadUsersFor = useCallback(async (actor) => {
    if (!state.session?.token) return;
    if (!actor || !ROLE_FULL_ACCESS.has(actor.role)) {
      setUsersState([]);
      return;
    }
    try {
      setLoading('users', true);
      const { data } = await fetchUsers({ page_size: 100 });
      setUsersState(data);
    } catch (err) {
      console.error('Erro ao carregar usuários', err);
      setError(err);
    } finally {
      setLoading('users', false);
    }
  }, [setError, setLoading, setUsersState, state.session?.token]);

  const loadUsers = useCallback(async () => {
    await loadUsersFor(state.currentUser);
  }, [loadUsersFor, state.currentUser?.id, state.currentUser?.role]);

  useEffect(() => {
    if (!state.session?.token) {
      setInitializing(false);
      return;
    }

    const initialize = async () => {
      try {
        const user = await loadCurrentUser();
        await Promise.all([loadCategories(), loadPosts()]);
        await loadUsersFor(user);
      } finally {
        setInitializing(false);
      }
    };

    initialize();
  }, [state.session?.token, loadCategories, loadPosts, loadUsersFor, loadCurrentUser, setInitializing]);

  const login = useCallback(async (credentials) => {
    const { session: newSession, user } = await loginService(credentials);
    setSessionState(newSession);
    setCurrentUserState(user);
    await Promise.all([loadCategories(), loadPosts(), loadUsersFor(user)]);
    return user;
  }, [loadCategories, loadPosts, loadUsersFor, setCurrentUserState, setSessionState]);

  const createCategory = useCallback(async (payload) => {
    const category = await createCategoryApi(payload);
    await loadCategories();
    return category;
  }, [loadCategories]);

  const updateCategory = useCallback(async (id, payload) => {
    const updated = await updateCategoryApi(id, payload);
    await loadCategories();
    return updated;
  }, [loadCategories]);

  const deleteCategory = useCallback(async (id) => {
    await deleteCategoryApi(id);
    await loadCategories();
  }, [loadCategories]);

  const toggleCategory = useCallback(async (id) => {
    const category = state.categories.find((item) => item.id === id);
    if (!category) return null;
    const updated = await updateCategoryApi(id, { ...category, ativa: !category.ativa });
    await loadCategories();
    return updated;
  }, [loadCategories, state.categories]);

  const savePost = useCallback(async (payload) => {
    const post = payload.id ? await updatePostApi(payload.id, payload) : await createPostApi(payload);
    await loadPosts();
    return post;
  }, [loadPosts]);

  const deletePost = useCallback(async (id) => {
    await deletePostApi(id);
    await loadPosts();
  }, [loadPosts]);

  const updatePostStatus = useCallback(async (id, status, publishedAt) => {
    let updated;
    if (status === 'publicado') {
      updated = await publishPostApi(id);
    } else if (status === 'agendado') {
      updated = await schedulePostApi(id, publishedAt);
    } else {
      updated = await updatePostApi(id, { status });
    }
    await loadPosts();
    return updated;
  }, [loadPosts]);

  const createUser = useCallback(async (payload) => {
    const user = await createUserApi(payload);
    await loadUsersFor(state.currentUser);
    return user;
  }, [loadUsersFor, state.currentUser]);

  const updateUser = useCallback(async (id, payload) => {
    const updated = await updateUserApi(id, payload);
    await loadUsersFor(state.currentUser);
    if (state.currentUser?.id === updated.id) {
      setCurrentUserState(updated);
    }
    return updated;
  }, [loadUsersFor, setCurrentUserState, state.currentUser]);

  const deleteUser = useCallback(async (id) => {
    await deleteUserApi(id);
    await loadUsersFor(state.currentUser);
  }, [loadUsersFor, state.currentUser]);

  const allowedCategorySlugs = useMemo(
    () => resolveAllowedCategorySlugs(state.currentUser, state.categories),
    [state.currentUser, state.categories],
  );

  const allowedCategories = useMemo(() => {
    if (!state.currentUser) return [];
    if (ROLE_FULL_ACCESS.has(state.currentUser.role)) return state.categories;
    return state.categories.filter((category) => allowedCategorySlugs.includes(category.slug));
  }, [allowedCategorySlugs, state.categories, state.currentUser]);

  const value = useMemo(
    () => ({
      categories: state.categories,
      posts: state.posts,
      users: state.users,
      loading: state.loading,
      error: state.error,
      session: state.session,
      currentUser: state.currentUser,
      initializing: state.initializing,
      allowedCategorySlugs,
      allowedCategories,
      login,
      logout: handleLogout,
      refreshCategories: loadCategories,
      refreshPosts: loadPosts,
      refreshUsers: loadUsers,
      createCategory,
      updateCategory,
      deleteCategory,
      toggleCategory,
      fetchCategoryById: fetchCategoryApi,
      savePost,
      deletePost,
      updatePostStatus,
      fetchPostById: fetchPostApi,
      createUser,
      updateUser,
      deleteUser,
      fetchUserById: fetchUserApi,
    }),
    [
      state.categories,
      state.posts,
      state.users,
      state.loading,
      state.error,
      state.session,
      state.currentUser,
      state.initializing,
      allowedCategorySlugs,
      allowedCategories,
      login,
      handleLogout,
      loadCategories,
      loadPosts,
      loadUsers,
      createCategory,
      updateCategory,
      deleteCategory,
      toggleCategory,
      savePost,
      deletePost,
      updatePostStatus,
      createUser,
      updateUser,
      deleteUser,
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
