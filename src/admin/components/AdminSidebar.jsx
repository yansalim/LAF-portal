import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/posts', label: 'Publicações' },
  { to: '/admin/posts/novo', label: 'Novo post' },
  { to: '/admin/categorias', label: 'Categorias' },
  { to: '/admin/usuarios', label: 'Usuários' },
];

const AdminSidebar = () => (
  <aside className="hidden w-60 border-r border-slate-200 bg-white py-6 sm:block">
    <nav className="flex flex-col gap-1 px-4">
      {navItems.map((item) => (
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

export default AdminSidebar;
