import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppContext } from '../store/appContext';

const ProtectedRoute = ({ roles, children }) => {
  const location = useLocation();
  const { session, currentUser } = useAppContext();

  if (!session || !currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (currentUser.role === 'leitor') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(currentUser.role)) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (children) {
    return children;
  }

  return <Outlet />;
};

export default ProtectedRoute;
