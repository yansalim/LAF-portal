import { useEffect, useState } from 'react';

const defaultValues = {
  nome: '',
  slug: '',
  descricao: '',
  ativa: true,
};

// Formulário simples de categoria com validação de slug único realizada na store.
const CategoryForm = ({ onSubmit, initialValues = {}, submitLabel = 'Salvar' }) => {
  const [form, setForm] = useState({ ...defaultValues, ...initialValues });

  useEffect(() => {
    setForm({ ...defaultValues, ...initialValues });
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nome" className="text-sm font-semibold text-slate-700">
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          required
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>
      <div>
        <label htmlFor="slug" className="text-sm font-semibold text-slate-700">
          Slug (opcional)
        </label>
        <input
          id="slug"
          name="slug"
          value={form.slug}
          onChange={handleChange}
          placeholder="ex: comunicados"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>
      <div>
        <label htmlFor="descricao" className="text-sm font-semibold text-slate-700">
          Descrição
        </label>
        <textarea
          id="descricao"
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="ativa"
          name="ativa"
          type="checkbox"
          checked={Boolean(form.ativa)}
          onChange={handleChange}
          className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="ativa" className="text-sm text-slate-600">
          Categoria ativa
        </label>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
