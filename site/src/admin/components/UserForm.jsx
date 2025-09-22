import { useEffect, useMemo, useState } from 'react';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrador' },
  { value: 'secretaria', label: 'Secretaria' },
  { value: 'tjd', label: 'TJD' },
  { value: 'editor', label: 'Editor' },
  { value: 'leitor', label: 'Leitor' },
];

const TJD_CATEGORY_SLUG = 'comunicados-tjd';

const defaultValues = {
  nome: '',
  email: '',
  senha: '',
  role: 'editor',
  allowedCategorySlugs: [],
};

// Formulário de usuários permite atribuir papéis e permissões por categoria para editores/TJD.
const UserForm = ({
  categories = [],
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
  errorMessage,
}) => {
  const resolvedInitialValues = useMemo(
    () => ({
      ...defaultValues,
      ...(initialValues || {}),
      senha: '',
      allowedCategorySlugs: initialValues?.allowedCategorySlugs ?? [],
    }),
    [
      initialValues?.id ?? null,
      initialValues?.nome ?? '',
      initialValues?.email ?? '',
      initialValues?.role ?? '',
      Array.isArray(initialValues?.allowedCategorySlugs)
        ? initialValues?.allowedCategorySlugs.join('|')
        : '',
    ],
  );

  const [form, setForm] = useState(resolvedInitialValues);
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(initialValues?.id);
  const visibleCategories = useMemo(() => {
    const mapped = categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      nome: category.nome,
    }));

    if (!mapped.some((category) => category.slug === TJD_CATEGORY_SLUG)) {
      mapped.push({
        id: TJD_CATEGORY_SLUG,
        slug: TJD_CATEGORY_SLUG,
        nome: 'Comunicados TJD',
      });
    }

    return mapped;
  }, [categories]);

  useEffect(() => {
    setForm(resolvedInitialValues);
    setErrors({});
  }, [resolvedInitialValues]);

  const updateAllowedCategoriesForRole = (role, currentSlugs = []) => {
    if (role === 'tjd') {
      return [TJD_CATEGORY_SLUG];
    }
    if (role === 'editor') {
      return currentSlugs;
    }
    return [];
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'role') {
      const nextRole = value;
      setForm((prev) => ({
        ...prev,
        role: nextRole,
        allowedCategorySlugs: updateAllowedCategoriesForRole(nextRole, prev.allowedCategorySlugs),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryToggle = (slug) => {
    setForm((prev) => {
      if (prev.role === 'tjd') {
        return { ...prev, allowedCategorySlugs: [TJD_CATEGORY_SLUG] };
      }

      const set = new Set(prev.allowedCategorySlugs ?? []);
      if (set.has(slug)) {
        set.delete(slug);
      } else {
        set.add(slug);
      }
      return { ...prev, allowedCategorySlugs: Array.from(set) };
    });
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.nome.trim()) nextErrors.nome = 'Informe o nome';
    if (!form.email.trim()) nextErrors.email = 'Informe o e-mail';
    if (!isEditing && !form.senha.trim()) nextErrors.senha = 'Defina uma senha';

    if (form.role === 'editor' && (!form.allowedCategorySlugs || form.allowedCategorySlugs.length === 0)) {
      nextErrors.allowedCategorySlugs = 'Selecione ao menos uma categoria';
    }

    if (form.role === 'tjd' && !form.allowedCategorySlugs.includes(TJD_CATEGORY_SLUG)) {
      nextErrors.allowedCategorySlugs = 'Perfil TJD precisa da categoria Comunicados TJD';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      nome: form.nome.trim(),
      email: form.email.trim(),
      allowedCategorySlugs:
        form.role === 'editor' || form.role === 'tjd' ? form.allowedCategorySlugs : undefined,
    };

    if (!payload.senha?.trim()) {
      delete payload.senha;
    }

    onSubmit(payload);
  };

  const shouldRenderCategories = form.role === 'editor' || form.role === 'tjd';
  const isTjd = form.role === 'tjd';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="nome" className="text-sm font-semibold text-slate-700">
            Nome
          </label>
          <input
            id="nome"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            required
          />
          {errors.nome && <p className="mt-1 text-xs text-red-600">{errors.nome}</p>}
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-semibold text-slate-700">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            required
            autoComplete="username"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="role" className="text-sm font-semibold text-slate-700">
            Papel
          </label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="senha" className="text-sm font-semibold text-slate-700">
            Senha {isEditing ? '(deixe em branco para manter)' : ''}
          </label>
          <input
            id="senha"
            name="senha"
            type="password"
            value={form.senha}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            placeholder={isEditing ? '••••••••' : 'mínimo 6 caracteres'}
            autoComplete={isEditing ? 'new-password' : 'new-password'}
          />
          {errors.senha && <p className="mt-1 text-xs text-red-600">{errors.senha}</p>}
        </div>
      </div>

      {shouldRenderCategories && (
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-700">Categorias permitidas</p>
          <p className="text-xs text-slate-500">
            {isTjd
              ? 'Perfis TJD publicam exclusivamente em Comunicados TJD.'
              : 'Selecione as categorias em que o usuário poderá publicar.'}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {visibleCategories.map((category) => {
              const isTjdCategory = category.slug === TJD_CATEGORY_SLUG;
              const disabled = isTjd && !isTjdCategory;
              const checked = form.allowedCategorySlugs?.includes(category.slug) || (isTjd && isTjdCategory);
              return (
                <label
                  key={category.id}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                    disabled ? 'border-slate-100 text-slate-400' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    value={category.slug}
                    checked={checked}
                    disabled={disabled}
                    onChange={() => handleCategoryToggle(category.slug)}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  {category.nome}
                </label>
              );
            })}
          </div>
          {errors.allowedCategorySlugs && (
            <p className="mt-2 text-xs text-red-600">{errors.allowedCategorySlugs}</p>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
        >
          Cancelar
        </button>
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

export default UserForm;
