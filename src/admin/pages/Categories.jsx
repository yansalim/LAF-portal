import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import CategoryForm from '../components/CategoryForm';
import CategoryTable from '../components/CategoryTable';
import { useAppContext } from '../../store/appContext';

const Categories = () => {
  const {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategory,
  } = useAppContext();
  const [editing, setEditing] = useState(null);

  const handleCreate = (values) => {
    createCategory(values);
  };

  const handleUpdate = (values) => {
    if (!editing) return;
    updateCategory(editing.id, values);
    setEditing(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Excluir esta categoria?')) {
      deleteCategory(id);
      if (editing?.id === id) setEditing(null);
    }
  };

  const form = editing ? (
    <CategoryForm
      initialValues={editing}
      onSubmit={handleUpdate}
      submitLabel="Atualizar"
    />
  ) : (
    <CategoryForm onSubmit={handleCreate} submitLabel="Criar categoria" />
  );

  return (
    <AdminLayout
      title="Categorias"
      description="Organize as categorias disponíveis no site público."
    >
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              {editing ? 'Editar categoria' : 'Nova categoria'}
            </h3>
            {editing && (
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="text-xs font-semibold text-primary-600 hover:underline"
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
            onToggle={toggleCategory}
            onDelete={handleDelete}
          />
        </div>
      </section>
    </AdminLayout>
  );
};

export default Categories;
