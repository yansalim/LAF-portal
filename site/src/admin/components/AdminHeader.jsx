import { Link } from 'react-router-dom';
import { formatDateTime } from '../../utils/dates';
import { useAppContext } from '../../store/appContext';

// Barra superior do admin com info de usuário e acesso rápido ao site público.
const AdminHeader = ({ onToggleNav = () => {} }) => {
  const { currentUser, logout } = useAppContext();
  const nowLabel = formatDateTime(new Date());

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div className="flex w-full items-center justify-between gap-4 sm:w-auto">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Portal Gerencial</h1>
          <p className="text-xs text-slate-500">Fuso horário: America/Sao_Paulo • {nowLabel}</p>
        </div>
        <button
          type="button"
          onClick={onToggleNav}
          className="inline-flex flex-col items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 sm:hidden"
          aria-label="Abrir menu"
        >
          <span className="block h-0.5 w-5 rounded bg-current" />
          <span className="block h-0.5 w-5 rounded bg-current" />
          <span className="block h-0.5 w-5 rounded bg-current" />
        </button>
      </div>

      <div className="flex w-full flex-col items-start gap-4 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
        <Link
          to="/"
          className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 transition hover:border-primary-500 hover:text-primary-600"
        >
          Ver site público
        </Link>
        {currentUser && (
          <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="text-left sm:text-right">
              <p className="text-sm font-semibold text-slate-900">{currentUser.nome}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">{currentUser.role}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 sm:w-auto"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
