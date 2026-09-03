import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('admin_token');
  const isAuth = Boolean(token && token !== 'undefined' && token !== 'null' && token.trim() !== '');

  if (!isAuth) {
    return <Navigate replace to="/admin/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
