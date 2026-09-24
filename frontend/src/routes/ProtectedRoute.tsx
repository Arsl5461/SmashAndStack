import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';

export function ProtectedRoute() {
  const token = useSelector((state: RootState) => state.auth.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}
