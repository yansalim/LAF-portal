import { useEffect, useMemo, useState } from 'react';
import { isValidSlug, slugify } from '../../utils/slugify';

const defaultValues = {
  nome: '',
  slug: '',
  descricao: '',
  ativa: true,
};

// Formulário simples de categoria com validação de slug único realizada na store.
const CategoryForm = ({
  onSubmit,
  initialValues,
  submitLabel = 'Salvar',
  existingSlugs = [],
}) => {
  const resolvedInitialValues = useMemo(
    () => ({
      ...defaultValues,
      ...(initialValues || {}),
    }),
    [
      initialValues?.id ?? null,
      initialValues?.nome ?? '',
      initialValues?.slug ?? '',
      initialValues?.descricao ?? '',
      initialValues?.ativa ?? true,
    ],
  );

  const [form, setForm] = useState(resolvedInitialValues);
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [slugDirty, setSlugDirty] = useState(Boolean(initialValues?.slug));

  useEffect(() => {
    setForm(resolvedInitialValues);
    setTouched({});
    setSubmitError('');
    setSubmitSuccess('');
    setSlugDirty(Boolean(initialValues?.slug));
  }, [initialValues?.slug, resolvedInitialValues]);

  const validation = useMemo(() => {
    const errors = {};
    const trimmedName = form.nome.trim();
    const slugSource = form.slug.trim() || form.nome.trim();
    const normalizedSlug = slugify(slugSource);
    const description = form.descricao.trim();

    if (!trimmedName) {
      errors.nome = 'Informe o nome da categoria.';
    }

    if (!normalizedSlug) {
      errors.slug = 'Informe um slug para a categoria.';
    } else if (!isValidSlug(normalizedSlug)) {
      errors.slug = 'Use apenas letras, números e hífens.';
    } else {
      const slugInUse = existingSlugs.some((item) => item === normalizedSlug);
      if (slugInUse) {
        errors.slug = 'Este slug já está em uso.';
      }
    }

    if (!description) {
      errors.descricao = 'Descreva brevemente a categoria.';
    }

    return {
      errors,
      normalizedSlug,
      trimmedName,
      description,
    };
  }, [existingSlugs, form.descricao, form.nome, form.slug]);

  const isValid = Object.keys(validation.errors).length === 0;
  const canSubmit = isValid && !isSubmitting;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (name === 'nome') {
      const nextName = value;
      setForm((prev) => ({
        ...prev,
        nome: nextName,
        slug: slugDirty ? prev.slug : slugify(nextName),
      }));
      return;
    }

    if (name === 'slug') {
      setSlugDirty(true);
      setForm((prev) => ({
        ...prev,
        slug: slugify(value),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched({ nome: true, slug: true, descricao: true });
    setSubmitError('');
    setSubmitSuccess('');

    if (!isValid) {
      return;
    }

    const payload = {
      ...form,
      nome: validation.trimmedName,
      slug: validation.normalizedSlug,
      descricao: validation.description,
    };

    setIsSubmitting(true);
    try {
      await onSubmit(payload);
      setSubmitSuccess(initialValues?.id ? 'Categoria atualizada.' : 'Categoria criada com sucesso.');
      if (!initialValues?.id) {
        setForm(defaultValues);
        setSlugDirty(false);
        setTouched({});
      }
    } catch (error) {
      console.error('Erro ao salvar categoria', error);
      const message = error?.response?.data?.error?.message || 'Não foi possível salvar a categoria.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
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
          onBlur={handleBlur}
          required
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
        {touched.nome && validation.errors.nome && (
          <p className="mt-1 text-xs text-red-600">{validation.errors.nome}</p>
        )}
      </div>
      <div>
        <label htmlFor="slug" className="text-sm font-semibold text-slate-700">
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          value={form.slug}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          placeholder="ex: comunicados"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
        {touched.slug && validation.errors.slug && (
          <p className="mt-1 text-xs text-red-600">{validation.errors.slug}</p>
        )}
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
          onBlur={handleBlur}
          required
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
        {touched.descricao && validation.errors.descricao && (
          <p className="mt-1 text-xs text-red-600">{validation.errors.descricao}</p>
        )}
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
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitLabel}
        </button>
      </div>

      {(submitError || submitSuccess) && (
        <p
          className={`text-xs ${
            submitError ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {submitError || submitSuccess}
        </p>
      )}
    </form>
  );
};

export default CategoryForm;
