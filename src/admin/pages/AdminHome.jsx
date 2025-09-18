import { useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAppContext } from '../../store/appContext';
import { formatDateTime } from '../../utils/dates';

const AdminHome = () => {
  const { posts, categories } = useAppContext();

  const metrics = useMemo(() => {
    const published = posts.filter((post) => post.status === 'publicado').length;
    const drafts = posts.filter((post) => post.status === 'rascunho').length;
    const scheduled = posts.filter((post) => post.status === 'agendado').length;
    return {
      total: posts.length,
      published,
      drafts,
      scheduled,
      categories: categories.length,
    };
  }, [posts, categories]);

  const recentDrafts = useMemo(
    () =>
      posts
        .filter((post) => post.status === 'rascunho')
        .sort((a, b) => new Date(b.atualizadoEm) - new Date(a.atualizadoEm))
        .slice(0, 5),
    [posts],
  );

  return (
    <AdminLayout
      title="Visão geral"
      description="Resumo rápido das publicações e atividades recentes."
    >
      <section>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase text-slate-500">Total de posts</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{metrics.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase text-slate-500">Publicados</p>
            <p className="mt-2 text-3xl font-semibold text-green-600">{metrics.published}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase text-slate-500">Agendados</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">{metrics.scheduled}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase text-slate-500">Categorias</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{metrics.categories}</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-900">Últimos rascunhos</h3>
        {recentDrafts.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum rascunho recente.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {recentDrafts.map((post) => (
              <div
                key={post.id}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <p className="text-sm font-semibold text-slate-900">{post.titulo}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>{post.categoriaNome}</span>
                  <span>Atualizado em {formatDateTime(post.atualizadoEm)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  );
};

export default AdminHome;
