import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../../store/appContext';

export const NAV_ITEMS = [
  {
    to: '/admin',
    label: 'Dashboard',
    roles: ['admin', 'secretaria', 'editor', 'tjd'],
  },
  {
    to: '/admin/posts',
    label: 'Publicações',
    roles: ['admin', 'secretaria', 'editor', 'tjd'],
  },
  {
    to: '/admin/posts/novo',
    label: 'Novo post',
    roles: ['admin', 'secretaria', 'editor', 'tjd'],
  },
  {
    to: '/admin/categorias',
    label: 'Categorias',
    roles: ['admin', 'secretaria', 'editor'],
  },
  {
    to: '/admin/usuarios',
    label: 'Usuários',
    roles: ['admin'],
  },
];

export const filterNavItemsByRole = (role) => {
  if (!role) {
    return [];
  }
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
};

const AdminSidebar = () => {
  const { currentUser } = useAppContext();

  const items = useMemo(
    () => filterNavItemsByRole(currentUser?.role),
    [currentUser?.role],
  );

  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white py-6 sm:block">
      <nav className="flex flex-col gap-1 px-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                isActive ? 'bg-primary-100 text-primary-700' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
            end={item.to === '/admin'}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
