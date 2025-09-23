import { formatDateTime } from '../../utils/dates';

const statusStyles = {
  rascunho: 'bg-slate-200 text-slate-700',
  publicado: 'bg-green-100 text-green-700',
  agendado: 'bg-amber-100 text-amber-700',
};

const statusLabels = {
  rascunho: 'Rascunho',
  publicado: 'Publicado',
  agendado: 'Agendado',
};

const PostTable = ({ posts = [], onEdit, onDelete, onChangeStatus }) => {
  if (posts.length === 0) {
    return <p className="text-sm text-slate-500">Nenhum post encontrado.</p>;
  }

  const handleSchedule = (post) => {
    const suggestion = post.publicadoEm
      ? post.publicadoEm.slice(0, 16).replace('T', ' ')
      : '';
    const input = window.prompt(
      'Informe data e hora (AAAA-MM-DD HH:mm) para agendar a publicação',
      suggestion,
    );

    if (!input) return;

    const formatted = input.replace(' ', 'T');
    const date = new Date(formatted);
    if (Number.isNaN(date.getTime())) {
      window.alert('Data inválida.');
      return;
    }

    onChangeStatus(post.id, 'agendado', date.toISOString());
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:hidden">
        {posts.map((post) => (
          <article key={post.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="space-y-2">
              <div>
                <p className="text-xs uppercase text-slate-500">Título</p>
                <p className="text-base font-semibold text-slate-900">{post.titulo}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                <div>
                  <p className="text-xs uppercase text-slate-500">Categoria</p>
                  <p>{post.categoriaNome}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Status</p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[post.status]}`}
                  >
                    {statusLabels[post.status]}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs uppercase text-slate-500">Publicação</p>
                  <p>{post.publicadoEm ? formatDateTime(post.publicadoEm) : '—'}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onEdit(post)}
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onChangeStatus(post.id, 'publicado')}
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-green-200 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-50"
              >
                Publicar
              </button>
              <button
                type="button"
                onClick={() => onChangeStatus(post.id, 'rascunho')}
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Rascunho
              </button>
              <button
                type="button"
                onClick={() => handleSchedule(post)}
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50"
              >
                Agendar
              </button>
              <button
                type="button"
                onClick={() => onDelete(post.id)}
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                Excluir
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
        <table className="min-w-[720px] divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Título</th>
              <th className="px-4 py-3 font-semibold">Categoria</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Publicação</th>
            <th className="px-4 py-3 font-semibold text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {posts.map((post) => (
            <tr key={post.id}>
              <td className="px-4 py-3 font-medium text-slate-900">{post.titulo}</td>
              <td className="px-4 py-3 text-slate-600">{post.categoriaNome}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                    statusStyles[post.status]
                  }`}
                >
                  {statusLabels[post.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {post.publicadoEm ? formatDateTime(post.publicadoEm) : '—'}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(post)}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeStatus(post.id, 'publicado')}
                    className="rounded-lg border border-green-200 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-50"
                  >
                    Publicar agora
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeStatus(post.id, 'rascunho')}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Rascunho
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSchedule(post)}
                    className="rounded-lg border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                  >
                    Agendar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(post.id)}
                    className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
            </tbody>
          </table>
      </div>
    </div>
  );
};

export default PostTable;
