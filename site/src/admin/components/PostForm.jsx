import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../store/appContext';
import { slugify } from '../../utils/slugify';

const statusOptions = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'publicado', label: 'Publicado' },
  { value: 'agendado', label: 'Agendado' },
];

const formatDateTimeLocal = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const zoned = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return zoned.toISOString().slice(0, 16);
};

const parseDateTimeLocal = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

const defaultValues = {
  titulo: '',
  slug: '',
  resumo: '',
  categoriaId: '',
  capaUrl: '',
  conteudoMarkdown: '',
  status: 'rascunho',
  publicadoEm: '',
  destaque: false,
};

// Formulário reutilizável para criar/editar posts já aplicando regras de RBAC e validações básicas.
const PostForm = ({ initialValues, onSubmit }) => {
  const navigate = useNavigate();
  const { allowedCategories, currentUser } = useAppContext();

  const resolvedInitialValues = useMemo(
    () => ({
      ...defaultValues,
      ...(initialValues || {}),
      publicadoEm: initialValues?.publicadoEm
        ? formatDateTimeLocal(initialValues.publicadoEm)
        : '',
    }),
    [
      initialValues?.id ?? null,
      initialValues?.titulo ?? '',
      initialValues?.slug ?? '',
      initialValues?.resumo ?? '',
      initialValues?.categoriaId ?? '',
      initialValues?.capaUrl ?? '',
      initialValues?.conteudoMarkdown ?? '',
      initialValues?.status ?? '',
      initialValues?.publicadoEm ?? '',
      initialValues?.destaque ?? false,
      initialValues?.categoriaNome ?? '',
      initialValues?.autorId ?? '',
      initialValues?.autorNome ?? '',
    ],
  );

  const [form, setForm] = useState(resolvedInitialValues);
  const [errors, setErrors] = useState({});

  const canPublish = form.status === 'publicado' || form.status === 'agendado';
  const availableCategories = useMemo(() => allowedCategories, [allowedCategories]);
  const isSubmitDisabled = availableCategories.length === 0;

  useEffect(() => {
    if (!form.categoriaId && availableCategories.length > 0) {
      setForm((prev) => ({ ...prev, categoriaId: availableCategories[0].id }));
    }
  }, [availableCategories, form.categoriaId]);

  useEffect(() => {
    setForm(resolvedInitialValues);
  }, [resolvedInitialValues]);

  const validate = () => {
    const nextErrors = {};
    if (!form.titulo.trim()) nextErrors.titulo = 'Informe um título';
    if (!form.resumo.trim()) nextErrors.resumo = 'Informe um resumo';
    if (!form.categoriaId) nextErrors.categoriaId = 'Selecione uma categoria';

    if (canPublish && !form.publicadoEm) {
      nextErrors.publicadoEm = 'Informe data e hora de publicação';
    }

    if (form.categoriaId && availableCategories.length > 0) {
      const isAllowed = availableCategories.some((category) => category.id === form.categoriaId);
      if (!isAllowed) {
        nextErrors.categoriaId = 'Você não tem acesso a esta categoria';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const selectedCategory = availableCategories.find((category) => category.id === form.categoriaId);
    const slug = form.slug ? slugify(form.slug) : slugify(form.titulo);

    const payload = {
      ...(initialValues || {}),
      ...form,
      slug,
      categoriaNome: selectedCategory?.nome ?? initialValues?.categoriaNome,
      autorId: initialValues?.autorId ?? currentUser?.id,
      autorNome: initialValues?.autorNome ?? currentUser?.nome,
      publicadoEm: canPublish ? parseDateTimeLocal(form.publicadoEm) : undefined,
    };

    await onSubmit(payload);
    navigate('/admin/posts');
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label htmlFor="titulo" className="text-sm font-semibold text-slate-700">
              Título
            </label>
            <input
              id="titulo"
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              required
            />
            {errors.titulo && <p className="mt-1 text-xs text-red-600">{errors.titulo}</p>}
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
              placeholder="ex: comunicado-importante"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label htmlFor="resumo" className="text-sm font-semibold text-slate-700">
              Resumo (meta description)
            </label>
            <textarea
              id="resumo"
              name="resumo"
              value={form.resumo}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              required
            />
            {errors.resumo && <p className="mt-1 text-xs text-red-600">{errors.resumo}</p>}
          </div>

          <div>
            <label htmlFor="conteudoMarkdown" className="text-sm font-semibold text-slate-700">
              Conteúdo (Markdown)
            </label>
            <textarea
              id="conteudoMarkdown"
              name="conteudoMarkdown"
              value={form.conteudoMarkdown}
              onChange={handleChange}
              rows={12}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
        </div>

        <aside className="space-y-6">
          <div>
            <label htmlFor="categoriaId" className="text-sm font-semibold text-slate-700">
              Categoria
            </label>
            <select
              id="categoriaId"
              name="categoriaId"
              value={form.categoriaId}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              required
            >
              <option value="" disabled>
                Selecione
              </option>
              {availableCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nome}
                </option>
              ))}
            </select>
            {errors.categoriaId && <p className="mt-1 text-xs text-red-600">{errors.categoriaId}</p>}
            {availableCategories.length === 0 && (
              <p className="mt-2 text-xs text-amber-600">
                Seu perfil não possui categorias disponíveis para publicação.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="capaUrl" className="text-sm font-semibold text-slate-700">
              URL da capa
            </label>
            <input
              id="capaUrl"
              name="capaUrl"
              value={form.capaUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label htmlFor="status" className="text-sm font-semibold text-slate-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="publicadoEm" className="text-sm font-semibold text-slate-700">
              Data de publicação
            </label>
            <input
              id="publicadoEm"
              name="publicadoEm"
              type="datetime-local"
              value={form.publicadoEm}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
            {errors.publicadoEm && <p className="mt-1 text-xs text-red-600">{errors.publicadoEm}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="destaque"
              name="destaque"
              type="checkbox"
              checked={Boolean(form.destaque)}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="destaque" className="text-sm text-slate-600">
              Destacar post no site público
            </label>
          </div>
        </aside>
      </div>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => navigate('/admin/posts')}
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 sm:w-auto"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
        >
          Salvar post
        </button>
      </div>
    </form>
  );
};

export default PostForm;
