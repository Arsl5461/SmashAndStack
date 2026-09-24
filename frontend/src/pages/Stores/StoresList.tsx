import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { DataTable } from '../../components/common/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { BusyOverlay, ErrorState, LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useBulkDeleteStoresMutation, useGetStoresQuery } from '../../api/storesApi';
import { formatCurrency } from '../../utils/cn';
import { PERMISSIONS } from '../../constants/permissions';
import { usePermissions } from '../../hooks/usePermissions';
import { useGetOverviewQuery } from '../../api/dashboardApi';
import { useListParams } from '../../hooks/useListParams';
import { DeleteAction, EditAction, TableActions } from '../../components/common/TableActions';
import { ListingToolbar } from '../../components/common/ListingToolbar';
import { useRowSelection } from '../../hooks/useRowSelection';
import type { ExportColumn } from '../../utils/export';

export default function StoresList() {
  const { page, setPage, limit, setLimit, search, setSearch, query } = useListParams();
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const { can, isSuperAdmin } = usePermissions();
  const { data, isLoading, isError } = useGetStoresQuery(query);
  const overview = useGetOverviewQuery({ range: '30d' });
  const [bulkDeleteStores, { isLoading: deleting }] = useBulkDeleteStoresMutation();
  const stores = data?.data?.items || [];
  const counts = data?.data?.counts;
  const performance = overview.data?.data?.storePerformance || [];

  const withFinance = stores.map((store: any) => {
    const stats = performance.find((row) => String(row.storeId) === String(store._id));
    return { ...store, revenue: stats?.revenue || 0, expenses: stats?.expenses || 0, profit: stats?.profit || 0 };
  });
  const selection = useRowSelection(withFinance.map((store: any) => store._id));
  const exportRows = selection.selected.length
    ? withFinance.filter((store: any) => selection.selected.includes(store._id))
    : withFinance;
  const exportColumns: ExportColumn<any>[] = [
    { header: 'Store', value: (row) => row.name },
    { header: 'Store Code', value: (row) => row.storeCode },
    { header: 'Manager', value: (row) => row.manager?.name || 'Unassigned' },
    { header: 'Location', value: (row) => `${row.city || ''}${row.state ? `, ${row.state}` : ''}` },
    { header: 'Revenue', value: (row) => row.revenue },
    { header: 'Expenses', value: (row) => row.expenses },
    { header: 'Profit', value: (row) => row.profit },
    { header: 'Status', value: (row) => row.status },
  ];

  return (
    <div>
      <PageHeader
        title="Stores"
        subtitle={
          isSuperAdmin
            ? 'Manage all Smash & Stack branches from one place.'
            : 'Only the stores assigned to your account are shown here.'
        }
        actions={
          can(PERMISSIONS.STORES_CREATE) ? (
            <Link to="/stores/new" className="btn-primary">
              + Add New Store
            </Link>
          ) : null
        }
      />

      <div className="mb-5 grid gap-4 md:grid-cols-4">
        {[
          ['Total Stores', counts?.total || 0],
          ['Active Stores', counts?.active || 0],
          ['Inactive Stores', counts?.inactive || 0],
          ['Combined Revenue', formatCurrency(overview.data?.data?.summary.totalRevenue || 0)],
        ].map(([label, value]) => (
          <div key={label} className="card p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-normal">{value}</p>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput value={search} onChange={setSearch} placeholder="Search stores" />
          <ListingToolbar
            title="Stores"
            fileName="sns-stores"
            columns={exportColumns}
            rows={exportRows}
            selectedCount={selection.selected.length}
            deleting={deleting}
            onDeleteSelected={can(PERMISSIONS.STORES_DELETE) ? () => setDeleteIds(selection.selected) : undefined}
          />
        </div>
        {isLoading ? <LoadingSpinner /> : null}
        {isError ? <ErrorState /> : null}
        <DataTable
          rows={withFinance}
          selectable
          selectedIds={selection.selected}
          onToggle={selection.toggle}
          onToggleAll={selection.toggleAll}
          columns={[
            { key: 'name', header: 'Store', render: (row: any) => <span className="font-normal">{row.name}</span> },
            { key: 'code', header: 'Store Code', render: (row: any) => row.storeCode },
            { key: 'manager', header: 'Manager', render: (row: any) => row.manager?.name || 'Unassigned' },
            { key: 'location', header: 'Location', render: (row: any) => `${row.city || ''}${row.state ? `, ${row.state}` : ''}` },
            { key: 'revenue', header: 'Revenue', render: (row: any) => formatCurrency(row.revenue) },
            { key: 'expenses', header: 'Expenses', render: (row: any) => formatCurrency(row.expenses) },
            { key: 'profit', header: 'Profit', render: (row: any) => formatCurrency(row.profit) },
            {
              key: 'status',
              header: 'Status',
              render: (row: any) => (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-normal text-emerald-700">{row.status}</span>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (row: any) => (
                <TableActions>
                  <Link className="text-sm font-medium text-brand-red" to={`/stores/${row._id}`}>
                    View
                  </Link>
                  {can(PERMISSIONS.STORES_UPDATE) ? <EditAction to={`/stores/${row._id}/edit`} /> : null}
                  {can(PERMISSIONS.STORES_DELETE) ? <DeleteAction onClick={() => setDeleteIds([row._id])} /> : null}
                </TableActions>
              ),
            },
          ]}
        />
        <Pagination meta={data?.meta} onPageChange={setPage} onLimitChange={setLimit} />
      </div>

      <BusyOverlay show={deleting} label="Deleting stores..." />
      <ConfirmDialog
        open={deleteIds.length > 0}
        title={deleteIds.length > 1 ? 'Delete selected stores' : 'Delete store'}
        description="Stores with financial history will be deactivated instead of permanently deleted."
        onClose={() => setDeleteIds([])}
        onConfirm={async () => {
          try {
            await bulkDeleteStores(deleteIds).unwrap();
            toast.success(deleteIds.length > 1 ? 'Selected stores updated' : 'Store updated');
            selection.clear();
            setDeleteIds([]);
          } catch (error: any) {
            toast.error(error?.data?.message || 'Unable to delete stores');
          }
        }}
      />
    </div>
  );
}
