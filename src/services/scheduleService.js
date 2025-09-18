import { isPastOrNow } from '../utils/dates';

export const isPostVisible = (post, categories = [], now = new Date()) => {
  if (!post) return false;
  const category = categories.find((item) => item.id === post.categoriaId);
  if (!category || !category.ativa) return false;

  if (post.status === 'rascunho') return false;
  if (!post.publicadoEm) return false;

  const publicationDate = new Date(post.publicadoEm);
  if (Number.isNaN(publicationDate.getTime())) return false;

  const reference = now instanceof Date ? now : new Date(now);

  if (!isPastOrNow(publicationDate) && post.status !== 'publicado') {
    return false;
  }

  if (post.status === 'agendado' && publicationDate.getTime() > reference.getTime()) {
    return false;
  }

  return publicationDate.getTime() <= reference.getTime();
};

export const filterVisiblePosts = (posts = [], categories = [], now = new Date()) =>
  posts.filter((post) => isPostVisible(post, categories, now));
