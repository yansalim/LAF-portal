import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

// Layout padrão das páginas administrativas com sidebar + conteúdo central.
const AdminLayout = ({ title, description, children, actions }) => (
  <div className="flex min-h-screen bg-slate-100">
    <AdminSidebar />
    <div className="flex flex-1 flex-col">
      <AdminHeader />
      <main className="flex-1 px-4 py-6 sm:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>}
            {description && <p className="text-sm text-slate-500">{description}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
        <div className="space-y-6">{children}</div>
      </main>
    </div>
  </div>
);

export default AdminLayout;
