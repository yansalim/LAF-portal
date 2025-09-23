import { formatDate } from '../../utils/dates';

const CategoryTable = ({ categories = [], onEdit, onToggle, onDelete }) => {
  if (categories.length === 0) {
    return <p className="text-sm text-slate-500">Nenhuma categoria cadastrada.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:hidden">
        {categories.map((category) => (
          <article key={category.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="space-y-2">
              <div>
                <p className="text-xs uppercase text-slate-500">Nome</p>
                <p className="text-base font-semibold text-slate-900">{category.nome}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                <div>
                  <p className="text-xs uppercase text-slate-500">Slug</p>
                  <p>{category.slug}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Status</p>
                  <span
                    className={`mt-1 inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                      category.ativa ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {category.ativa ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs uppercase text-slate-500">Criado em</p>
                  <p>{formatDate(category.criadoEm)}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onEdit(category)}
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onToggle(category.id)}
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                {category.ativa ? 'Inativar' : 'Ativar'}
              </button>
              <button
                type="button"
                onClick={() => onDelete(category.id)}
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                Excluir
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
        <table className="min-w-[640px] divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Nome</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Criado em</th>
            <th className="px-4 py-3 font-semibold text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="px-4 py-3 font-medium text-slate-900">{category.nome}</td>
              <td className="px-4 py-3 text-slate-600">{category.slug}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                    category.ativa
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {category.ativa ? 'Ativa' : 'Inativa'}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">{formatDate(category.criadoEm)}</td>
              <td className="px-4 py-3 text-right text-sm">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(category)}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggle(category.id)}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    {category.ativa ? 'Inativar' : 'Ativar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(category.id)}
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

export default CategoryTable;
