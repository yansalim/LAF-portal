import api from './apiClient';

const normalizeRole = (role) => {
  if (!role) return role;
  return role.startsWith('UserRole.') ? role.replace('UserRole.', '').toLowerCase() : role;
};

export const mapUser = (user) => ({
  id: user.id,
  nome: user.name,
  email: user.email,
  role: normalizeRole(user.role),
  isActive: user.is_active,
  allowedCategorySlugs: user.allowed_category_slugs ?? [],
  criadoEm: user.created_at,
  atualizadoEm: user.updated_at,
});

const toPayload = (data) => ({
  name: data.nome ?? data.name,
  email: data.email,
  password: data.password ?? data.senha,
  role: data.role,
  is_active: data.isActive ?? data.is_active,
  allowed_category_slugs: data.allowedCategorySlugs ?? data.allowed_category_slugs,
});

export const fetchUsers = async (params = {}) => {
  const response = await api.get('/users', { params });
  const { data, page, page_size: pageSize, total } = response.data;
  return {
    data: data.map(mapUser),
    page,
    pageSize,
    total,
  };
};

export const fetchUser = async (id) => {
  const response = await api.get(`/users/${id}`);
  return mapUser(response.data.data);
};

export const createUser = async (payload) => {
  const response = await api.post('/users', toPayload(payload));
  return mapUser(response.data.data);
};

export const updateUser = async (id, payload) => {
  const response = await api.put(`/users/${id}`, toPayload(payload));
  return mapUser(response.data.data);
};

export const deleteUser = async (id) => {
  await api.delete(`/users/${id}`);
};
