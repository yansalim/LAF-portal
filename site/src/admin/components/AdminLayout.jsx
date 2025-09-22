import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../../store/appContext';
import AdminHeader from './AdminHeader';
import AdminSidebar, { filterNavItemsByRole } from './AdminSidebar';

// Layout padrão das páginas administrativas com sidebar + conteúdo central.
const AdminLayout = ({ title, description, children, actions }) => {
  const { currentUser } = useAppContext();
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = useMemo(
    () => filterNavItemsByRole(currentUser?.role),
    [currentUser?.role],
  );

  const toggleMobileNav = () => {
    setMobileNavOpen((prev) => !prev);
  };

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="relative flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <AdminHeader onToggleNav={toggleMobileNav} />
        <main className="flex-1 overflow-x-hidden px-3 py-6 sm:px-6">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            {(title || description || actions) && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    {title && <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>}
                    {description && <p className="text-sm text-slate-500">{description}</p>}
                  </div>
                  {actions && (
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                      {actions}
                    </div>
                  )}
                </div>
              </section>
            )}
            <div className="space-y-6 pb-12">{children}</div>
          </div>
        </main>
      </div>

      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-40 flex sm:hidden"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Fechar menu"
            className="flex-1 bg-slate-900/40"
            onClick={closeMobileNav}
          />
          <nav className="relative z-50 h-full w-64 shrink-0 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <h2 className="text-sm font-semibold text-slate-900">Menu</h2>
              <button
                type="button"
                onClick={closeMobileNav}
                className="rounded-md px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                Fechar
              </button>
            </div>
            <ul className="flex flex-col gap-1 px-4 py-4">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={closeMobileNav}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        isActive
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`
                    }
                    end={item.to === '/admin'}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
