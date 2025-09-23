import { useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import CategoryForm from '../components/CategoryForm';
import CategoryTable from '../components/CategoryTable';
import { useAppContext } from '../../store/appContext';
import { slugify } from '../../utils/slugify';

const Categories = () => {
  const {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategory,
  } = useAppContext();
  const [editing, setEditing] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const availableSlugs = useMemo(() => {
    const slugs = categories
      .filter((category) => !editing || category.id !== editing.id)
      .map((category) => slugify(category.slug))
      .filter(Boolean);
    return slugs;
  }, [categories, editing]);

  const getErrorMessage = (error, fallback) =>
    error?.response?.data?.error?.message || error?.message || fallback;

  const handleCreate = async (values) => {
    try {
      await createCategory(values);
      setFeedback({ type: 'success', message: 'Categoria criada com sucesso.' });
    } catch (error) {
      console.error('Erro ao criar categoria', error);
      setFeedback({ type: 'error', message: getErrorMessage(error, 'Não foi possível criar a categoria.') });
      throw error;
    }
  };

  const handleUpdate = async (values) => {
    if (!editing) return;
    try {
      await updateCategory(editing.id, values);
      setFeedback({ type: 'success', message: 'Categoria atualizada com sucesso.' });
      setEditing(null);
    } catch (error) {
      console.error('Erro ao atualizar categoria', error);
      setFeedback({ type: 'error', message: getErrorMessage(error, 'Não foi possível atualizar a categoria.') });
      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Excluir esta categoria?')) {
      try {
        await deleteCategory(id);
        setFeedback({ type: 'success', message: 'Categoria excluída.' });
        if (editing?.id === id) setEditing(null);
      } catch (error) {
        console.error('Erro ao excluir categoria', error);
        setFeedback({ type: 'error', message: getErrorMessage(error, 'Não foi possível excluir a categoria.') });
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleCategory(id);
      setFeedback({ type: 'success', message: 'Status da categoria atualizado.' });
    } catch (error) {
      console.error('Erro ao alterar status da categoria', error);
      setFeedback({ type: 'error', message: getErrorMessage(error, 'Não foi possível alterar o status da categoria.') });
    }
  };

  const form = editing ? (
    <CategoryForm
      initialValues={editing}
      onSubmit={handleUpdate}
      existingSlugs={availableSlugs}
      submitLabel="Atualizar"
    />
  ) : (
    <CategoryForm
      onSubmit={handleCreate}
      existingSlugs={availableSlugs}
      submitLabel="Criar categoria"
    />
  );

  return (
    <AdminLayout
      title="Categorias"
      description="Organize as categorias disponíveis no site público."
    >
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          {feedback && (
            <div
              className={`mb-4 rounded-lg border px-3 py-2 text-xs font-semibold ${
                feedback.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-600'
              }`}
            >
              {feedback.message}
            </div>
          )}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              {editing ? 'Editar categoria' : 'Nova categoria'}
            </h3>
            {editing && (
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="w-full text-xs font-semibold text-primary-600 hover:underline sm:w-auto"
              >
                Cancelar edição
              </button>
            )}
          </div>
          {form}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <CategoryTable
            categories={categories}
            onEdit={setEditing}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </div>
      </section>
    </AdminLayout>
  );
};

export default Categories;
