import { Link } from 'react-router-dom';
import { formatDateTime } from '../../utils/dates';
import { useAppContext } from '../../store/appContext';

// Barra superior do admin com info de usuário e acesso rápido ao site público.
const AdminHeader = ({ onToggleNav = () => {} }) => {
  const { currentUser, logout } = useAppContext();
  const nowLabel = formatDateTime(new Date());

  return (
    <header className="border-b border-slate-200 bg-white px-3 py-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4">
        <div className="flex w-full items-center justify-between gap-4 sm:w-auto">
          <div className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-sm sm:w-auto sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0 sm:text-slate-900 sm:shadow-none">
            <h1 className="text-base font-semibold sm:text-lg">Portal Gerencial</h1>
            <p className="text-xs text-white/80 sm:text-slate-500">Fuso horário: America/Sao_Paulo • {nowLabel}</p>
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
            className="w-full rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary-500 hover:text-primary-600 sm:w-auto"
          >
            Ver site público
          </Link>
          {currentUser && (
            <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:flex-row sm:items-center">
              <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-slate-700 sm:w-auto sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-right sm:text-slate-900">
                <p className="text-sm font-semibold">{currentUser.nome}</p>
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
