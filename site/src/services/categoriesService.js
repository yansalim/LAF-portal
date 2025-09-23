import api from './apiClient';

const mapCategory = (category) => ({
  id: category.id,
  nome: category.name,
  slug: category.slug,
  descricao: category.description,
  ativa: category.is_active,
  allowedRoles: category.allowed_roles ?? [],
  criadoEm: category.created_at,
  atualizadoEm: category.updated_at,
});

const toPayload = (data) => ({
  name: data.nome ?? data.name,
  slug: data.slug,
  description: data.descricao ?? data.description,
  is_active: data.ativa ?? data.is_active ?? true,
  allowed_roles: data.allowedRoles ?? data.allowed_roles ?? undefined,
});

export const fetchCategories = async (params = {}) => {
  const response = await api.get('/categories', { params });
  const { data, page, page_size: pageSize, total } = response.data;
  return {
    data: data.map(mapCategory),
    page,
    pageSize,
    total,
  };
};

export const fetchCategory = async (identifier) => {
  const response = await api.get(`/categories/${identifier}`);
  return mapCategory(response.data.data);
};

export const createCategory = async (payload) => {
  const response = await api.post('/categories', toPayload(payload));
  return mapCategory(response.data.data);
};

export const updateCategory = async (id, payload) => {
  const response = await api.put(`/categories/${id}`, toPayload(payload));
  return mapCategory(response.data.data);
};

export const deleteCategory = async (id) => {
  await api.delete(`/categories/${id}`);
};

export const fetchPublicCategories = async () => {
  const response = await api.get('/public/categories');
  return response.data.data.map(mapCategory);
};

export const fetchPublicCategoryBySlug = async (slug) => {
  const response = await api.get(`/public/categories/${slug}`);
  return mapCategory(response.data.data);
};
