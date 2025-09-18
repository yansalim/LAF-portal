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
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
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
  );
};

export default PostTable;
