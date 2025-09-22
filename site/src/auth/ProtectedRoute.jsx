import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppContext } from '../store/appContext';

const ProtectedRoute = ({ roles, children }) => {
  const location = useLocation();
  const { session, currentUser, initializing } = useAppContext();

  if (initializing) {
    return null;
  }

  if (!session || !currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (currentUser.role === 'leitor') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(currentUser.role)) {
    return <Navigate to="/admin" replace />;
  }

  if (children) {
    return children;
  }

  return <Outlet />;
};

export default ProtectedRoute;
