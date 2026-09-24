import { Navigate, Outlet } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { PageSkeleton } from '../components/common/LoadingSpinner';

export function PermissionRoute({ permission }: { permission: string }) {
  const { can, user } = usePermissions();
  if (!user) return <PageSkeleton />;
  if (!can(permission)) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function SuperAdminRoute() {
  const { isSuperAdmin, user } = usePermissions();
  if (!user) return <PageSkeleton />;
  if (!isSuperAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
