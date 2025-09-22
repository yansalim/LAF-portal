import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { fetchPublicCategories } from '../../services/categoriesService';

// Cabeçalho público com filtros rápidos; afasta lógica de filtros da página para manter componentes reutilizáveis.
const PublicHeader = ({ onSearch }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPublicCategories();
        setCategories(data);
      } catch (error) {
        console.error('Erro ao carregar categorias públicas', error);
      }
    };
    load();
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-left"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-600">
              Organização LAF
            </span>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Portal de Notícias
            </h1>
          </button>
        </div>

        <div className="flex w-full flex-nowrap items-center gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-end sm:pb-0">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `whitespace-nowrap rounded-full border px-3 py-1 text-sm font-medium transition ${
                isActive
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-slate-200 text-slate-600 hover:border-primary-400 hover:text-primary-600'
              }`
            }
            end
          >
            Últimas
          </NavLink>
          {categories.map((category) => (
            <NavLink
              key={category.id}
              to={`/categoria/${category.slug}`}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full border px-3 py-1 text-sm font-medium transition ${
                  isActive
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-200 text-slate-600 hover:border-primary-400 hover:text-primary-600'
                }`
              }
            >
              {category.nome}
            </NavLink>
          ))}
          <NavLink
            to="/login"
            className="whitespace-nowrap rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-primary-500 hover:text-primary-600"
          >
            Acessar portal
          </NavLink>
        </div>
      </div>
      {onSearch && (
        <div className="border-t border-slate-100 bg-white/80">
          <div className="mx-auto flex max-w-6xl px-4 py-3">
            <label htmlFor="search" className="sr-only">
              Buscar por título ou resumo
            </label>
            <input
              id="search"
              type="search"
              placeholder="Buscar por título ou resumo"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              onChange={(event) => onSearch(event.target.value)}
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;
