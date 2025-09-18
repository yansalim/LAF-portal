import AdminLayout from '../components/AdminLayout';
import { useAppContext } from '../../store/appContext';

const roleLabels = {
  admin: 'Administrador',
  secretaria: 'Secretaria',
  tjd: 'TJD',
  editor: 'Editor',
  leitor: 'Leitor',
};

const Users = () => {
  const { users, categories } = useAppContext();

  const categoryBySlug = new Map(categories.map((category) => [category.slug, category.nome]));

  return (
    <AdminLayout title="Usuários" description="Perfis habilitados para o portal.">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">E-mail</th>
                <th className="px-4 py-3 font-semibold">Papel</th>
                <th className="px-4 py-3 font-semibold">Categorias permitidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{user.nome}</td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3 text-slate-600">{roleLabels[user.role] ?? user.role}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {user.role === 'admin' || user.role === 'secretaria'
                      ? 'Todas as categorias'
                      : user.allowedCategorySlugs?.length
                        ? user.allowedCategorySlugs
                            .map((slug) => categoryBySlug.get(slug) ?? slug)
                            .join(', ')
                        : 'Restrito'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
};

export default Users;
