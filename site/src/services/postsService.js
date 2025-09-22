import api from './apiClient';

const statusToFrontend = {
  DRAFT: 'rascunho',
  PUBLISHED: 'publicado',
  SCHEDULED: 'agendado',
};

const statusToBackend = {
  rascunho: 'DRAFT',
  publicado: 'PUBLISHED',
  agendado: 'SCHEDULED',
};

const normalizeBackendStatus = (status) => {
  if (!status) {
    return 'DRAFT';
  }
  if (statusToBackend[status]) {
    return statusToBackend[status];
  }

  const value = String(status).toUpperCase();
  if (statusToFrontend[value]) {
    return value;
  }

  const lastSegment = value.split('.').pop();
  if (lastSegment && statusToFrontend[lastSegment]) {
    return lastSegment;
  }

  return 'DRAFT';
};

const normalizeFrontendStatus = (status) => {
  if (!status) {
    return 'rascunho';
  }
  if (statusToFrontend[status]) {
    return statusToFrontend[status];
  }

  const value = String(status).toUpperCase();
  if (statusToFrontend[value]) {
    return statusToFrontend[value];
  }

  const lastSegment = value.split('.').pop();
  if (lastSegment && statusToFrontend[lastSegment]) {
    return statusToFrontend[lastSegment];
  }

  return status.toString().toLowerCase();
};

const mapCategory = (category) => ({
  id: category?.id,
  nome: category?.name,
  slug: category?.slug,
});

const mapAuthor = (author) => ({
  id: author?.id,
  nome: author?.name,
  email: author?.email,
});

const mapPost = (post) => ({
  id: post.id,
  slug: post.slug,
  titulo: post.title,
  resumo: post.excerpt,
  capaUrl: post.cover_image_url,
  conteudoMarkdown: post.content_markdown,
  status: normalizeFrontendStatus(post.status),
  categoria: mapCategory(post.category),
  categoriaId: post.category?.id,
  categoriaNome: post.category?.name,
  autor: mapAuthor(post.author),
  autorId: post.author?.id,
  autorNome: post.author?.name,
  publicadoEm: post.published_at,
  criadoEm: post.created_at,
  atualizadoEm: post.updated_at,
});

const toPayload = (data) => ({
  slug: data.slug,
  title: data.titulo ?? data.title,
  excerpt: data.resumo ?? data.excerpt,
  cover_image_url: data.capaUrl ?? data.cover_image_url,
  content_markdown: data.conteudoMarkdown ?? data.content_markdown,
  status: normalizeBackendStatus(data.status),
  category_id: data.categoriaId ?? data.category_id,
  author_id: data.autorId ?? data.author_id,
  published_at: data.publicadoEm ?? data.published_at,
});

export const fetchPosts = async (params = {}) => {
  const response = await api.get('/posts', { params });
  const { data, page, page_size: pageSize, total } = response.data;
  return {
    data: data.map(mapPost),
    page,
    pageSize,
    total,
  };
};

export const fetchPost = async (identifier) => {
  const response = await api.get(`/posts/${identifier}`);
  return mapPost(response.data.data);
};

export const createPost = async (payload) => {
  const response = await api.post('/posts', toPayload(payload));
  return mapPost(response.data.data);
};

export const updatePost = async (id, payload) => {
  const response = await api.put(`/posts/${id}`, toPayload(payload));
  return mapPost(response.data.data);
};

export const deletePost = async (id) => {
  await api.delete(`/posts/${id}`);
};

export const publishPost = async (id) => {
  const response = await api.post(`/posts/${id}/publish`);
  return mapPost(response.data.data);
};

export const schedulePost = async (id, publishedAt) => {
  const response = await api.post(`/posts/${id}/schedule`, { published_at: publishedAt });
  return mapPost(response.data.data);
};

export const fetchPublicFeed = async (params = {}) => {
  const response = await api.get('/public/feed', { params });
  const { data, page, page_size: pageSize, total } = response.data;
  return {
    data: data.map(mapPost),
    page,
    pageSize,
    total,
  };
};

export const fetchPublicPost = async (slug) => {
  const response = await api.get(`/public/posts/${slug}`);
  return mapPost(response.data.data);
};
