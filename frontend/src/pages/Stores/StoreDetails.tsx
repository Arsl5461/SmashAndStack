import { Link, useParams } from 'react-router-dom';
import { useGetStoreQuery, useGetStoreUsersQuery } from '../../api/storesApi';
import { useGetOverviewQuery } from '../../api/dashboardApi';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DashboardStats } from '../../components/dashboard/DashboardStats';
import { RevenueExpenseChart } from '../../components/dashboard/RevenueExpenseChart';
import { formatDate } from '../../utils/cn';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../constants/permissions';

export default function StoreDetails() {
  const { id = '' } = useParams();
  const { can, isSuperAdmin } = usePermissions();
  const { data, isLoading } = useGetStoreQuery(id);
  const canReadUsers = isSuperAdmin || can(PERMISSIONS.USERS_READ);
  const users = useGetStoreUsersQuery(id, { skip: !canReadUsers });
  const overview = useGetOverviewQuery({ range: '30d', storeId: id });
  const store = data?.data;

  if (isLoading) return <LoadingSpinner />;
  if (!store) return null;

  return (
    <div>
      <PageHeader
        title={store.name}
        subtitle={`${store.storeCode} · ${store.city || ''} ${store.state || ''}`}
        actions={
          can(PERMISSIONS.STORES_UPDATE) ? (
            <Link to={`/stores/${store._id}/edit`} className="btn-primary">
              Edit Store
            </Link>
          ) : null
        }
      />
      <div className="mb-5 flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-emerald-500/15 px-3 py-1 font-medium text-emerald-400">{store.status}</span>
        <span className="rounded-full bg-surface-raised px-3 py-1 text-slate-300">Opened {formatDate(store.openingDate)}</span>
        <span className="rounded-full bg-surface-raised px-3 py-1 text-slate-300">Manager {store.manager?.name || 'Unassigned'}</span>
      </div>
      {overview.data?.data ? (
        <div className="space-y-5">
          <DashboardStats summary={overview.data.data.summary} />
          <RevenueExpenseChart data={overview.data.data.revenueVsExpense} />
        </div>
      ) : null}
      {canReadUsers ? (
        <div className="card mt-5 p-5">
          <h3 className="mb-3 text-lg font-normal">Assigned users</h3>
          <div className="space-y-2">
            {(users.data?.data || []).map((user: any) => (
              <div key={user._id} className="flex justify-between rounded-xl bg-white/[0.04] px-3 py-2 text-sm">
                <span>{user.name}</span>
                <span className="text-slate-500">{user.roleId?.name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
