import { Link } from 'react-router-dom';
import { formatDateTime } from '../../utils/dates';
import { useAppContext } from '../../store/appContext';

// Barra superior do admin com info de usuário e acesso rápido ao site público.
const AdminHeader = () => {
  const { currentUser, logout } = useAppContext();
  const nowLabel = formatDateTime(new Date());

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Portal Gerencial</h1>
        <p className="text-xs text-slate-500">Fuso horário: America/Sao_Paulo • {nowLabel}</p>
      </div>
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 transition hover:border-primary-500 hover:text-primary-600"
        >
          Ver site público
        </Link>
        {currentUser && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{currentUser.nome}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">{currentUser.role}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-700"
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
