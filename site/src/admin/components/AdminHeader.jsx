import { Link } from 'react-router-dom';
import { formatDateTime } from '../../utils/dates';
import { useAppContext } from '../../store/appContext';

// Barra superior do admin com info de usuário e acesso rápido ao site público.
const AdminHeader = ({ onToggleNav = () => {} }) => {
  const { currentUser, logout } = useAppContext();
  const nowLabel = formatDateTime(new Date());

  return (
    <header className="border-b border-slate-200 bg-white px-3 py-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-slate-500">Fuso horário: America/Sao_Paulo • {nowLabel}</p>
            <h1 className="text-xl font-semibold text-slate-900">Portal Gerencial</h1>
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

        <div className="grid gap-3 sm:grid-cols-[auto_auto] sm:justify-end">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary-500 hover:text-primary-600"
          >
            Ver site público
          </Link>
          {currentUser && (
            <div className="flex flex-col items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 sm:flex-row sm:items-center sm:gap-4 sm:bg-white sm:shadow-sm">
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
      </div>
    </header>
  );
};

export default AdminHeader;
