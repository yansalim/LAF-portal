import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import PostTable from '../components/PostTable';
import { useAppContext } from '../../store/appContext';

const PostsList = () => {
  const navigate = useNavigate();
  const {
    posts,
    categories,
    currentUser,
    allowedCategorySlugs,
    deletePost,
    updatePostStatus,
  } = useAppContext();
  const [statusFilter, setStatusFilter] = useState('todos');
  const [categoryFilter, setCategoryFilter] = useState('todas');

  const categoryById = useMemo(() => {
    const map = new Map();
    categories.forEach((category) => {
      map.set(category.id, category);
    });
    return map;
  }, [categories]);

  const canSeeAll = ['admin', 'secretaria'].includes(currentUser?.role);

  const scopedPosts = useMemo(() => {
    if (canSeeAll) return posts;
    return posts.filter((post) => {
      const category = categoryById.get(post.categoriaId);
      if (!category) return false;
      return allowedCategorySlugs.includes(category.slug);
    });
  }, [allowedCategorySlugs, canSeeAll, categoryById, posts]);

  const filteredPosts = useMemo(() => {
    return scopedPosts.filter((post) => {
      const matchStatus =
        statusFilter === 'todos' ? true : post.status === statusFilter;
      const category = categoryById.get(post.categoriaId);
      const matchCategory =
        categoryFilter === 'todas'
          ? true
          : category?.slug === categoryFilter;
      return matchStatus && matchCategory;
    });
  }, [scopedPosts, statusFilter, categoryFilter, categoryById]);

  const handleEdit = (post) => {
    navigate(`/admin/posts/${post.id}/editar`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Excluir este post?')) {
      deletePost(id);
    }
  };

  const handleChangeStatus = (id, status, publicadoEm) => {
    updatePostStatus(id, status, publicadoEm);
  };

  const actions = (
    <Link
      to="/admin/posts/novo"
      className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
    >
      Novo post
    </Link>
  );

  return (
    <AdminLayout
      title="Publicações"
      description="Gerencie todo o conteúdo do portal."
      actions={actions}
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3">
            <div>
              <label htmlFor="status" className="text-xs uppercase text-slate-500">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              >
                <option value="todos">Todos</option>
                <option value="publicado">Publicado</option>
                <option value="agendado">Agendado</option>
                <option value="rascunho">Rascunho</option>
              </select>
            </div>
            <div>
              <label htmlFor="categoria" className="text-xs uppercase text-slate-500">
                Categoria
              </label>
              <select
                id="categoria"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              >
                <option value="todas">Todas</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <PostTable
          posts={filteredPosts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onChangeStatus={handleChangeStatus}
        />
      </section>
    </AdminLayout>
  );
};

export default PostsList;
