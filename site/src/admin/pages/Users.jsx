import { useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import UserForm from '../components/UserForm';
import { useAppContext } from '../../store/appContext';
import { formatDateTime } from '../../utils/dates';

const roleLabels = {
  admin: 'Administrador',
  secretaria: 'Secretaria',
  tjd: 'TJD',
  editor: 'Editor',
  leitor: 'Leitor',
};

const Users = () => {
  const { users, categories, createUser, updateUser, deleteUser, currentUser } = useAppContext();
  const [mode, setMode] = useState('create');
  const [editingUser, setEditingUser] = useState(null);
  const [formVersion, setFormVersion] = useState(0);
  const [formError, setFormError] = useState('');

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [categories],
  );

  const usersOrdered = useMemo(
    () => [...users].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [users],
  );

  const categoryBySlug = useMemo(() => {
    const map = new Map();
    categories.forEach((category) => {
      map.set(category.slug, category.nome);
    });
    return map;
  }, [categories]);

  const resetForm = () => {
    setEditingUser(null);
    setMode('create');
    setFormVersion((value) => value + 1);
    setFormError('');
  };

  const handleSubmit = async (payload) => {
    try {
      setFormError('');
      if (mode === 'edit' && editingUser) {
        await updateUser(editingUser.id, payload);
      } else {
        await createUser(payload);
      }
      resetForm();
    } catch (error) {
      setFormError(error.message ?? 'Não foi possível salvar o usuário.');
    }
  };

  const handleEdit = (user) => {
    setFormError('');
    setMode('edit');
    setEditingUser(user);
    setFormVersion((value) => value + 1);
  };

  const handleDelete = async (user) => {
    if (currentUser?.id === user.id) {
      window.alert('Você não pode remover o próprio usuário logado.');
      return;
    }

    if (window.confirm(`Excluir o usuário ${user.nome}?`)) {
      try {
        await deleteUser(user.id);
      } catch (error) {
        window.alert(error.message ?? 'Não foi possível excluir este usuário.');
      }
    }
  };

  const allowedCategoriesLabel = (user) => {
    if (['admin', 'secretaria'].includes(user.role)) {
      return 'Todas as categorias';
    }

    if (user.role === 'leitor') {
      return 'Sem acesso ao portal';
    }

    if (user.allowedCategorySlugs && user.allowedCategorySlugs.length > 0) {
      return user.allowedCategorySlugs
        .map((slug) => categoryBySlug.get(slug) ?? slug)
        .join(', ');
    }

    if (user.role === 'tjd') {
      return 'Comunicados TJD';
    }

    return 'Nenhuma';
  };

  const formKey = editingUser ? `edit-${editingUser.id}-${formVersion}` : `create-${formVersion}`;
  const formInitialValues = editingUser ? editingUser : { role: 'editor', allowedCategorySlugs: [] };
  const formLabel = editingUser ? 'Editar usuário' : 'Novo usuário';
  const submitLabel = editingUser ? 'Atualizar usuário' : 'Criar usuário';

  return (
    <AdminLayout title="Usuários" description="Gerencie perfis e permissões do portal.">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{formLabel}</h3>
            {editingUser && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-primary-600 hover:underline"
              >
                Cancelar edição
              </button>
            )}
          </div>
          <UserForm
            key={formKey}
            categories={sortedCategories}
            initialValues={formInitialValues}
            submitLabel={submitLabel}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            errorMessage={formError}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <h3 className="text-lg font-semibold text-slate-900">Usuários cadastrados</h3>
            <p className="text-sm text-slate-500">Total: {usersOrdered.length}</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-[720px] divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">E-mail</th>
                  <th className="px-4 py-3 font-semibold">Papel</th>
                  <th className="px-4 py-3 font-semibold">Categorias</th>
                  <th className="px-4 py-3 font-semibold">Atualizado</th>
                  <th className="px-4 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {usersOrdered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                      Nenhum usuário cadastrado.
                    </td>
                  </tr>
                ) : (
                  usersOrdered.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{user.nome}</td>
                      <td className="px-4 py-3 text-slate-600">{user.email}</td>
                      <td className="px-4 py-3 text-slate-600">{roleLabels[user.role] ?? user.role}</td>
                      <td className="px-4 py-3 text-slate-600">{allowedCategoriesLabel(user)}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {user.atualizadoEm ? formatDateTime(user.atualizadoEm) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(user)}
                            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};

export default Users;
