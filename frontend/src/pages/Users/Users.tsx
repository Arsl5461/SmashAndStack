import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { SearchInput } from '../../components/common/SearchInput';
import {
  useBulkDeleteUsersMutation,
  useCreateUserMutation,
  useGetRolesQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
} from '../../api/usersApi';
import { useGetStoresQuery } from '../../api/storesApi';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ListingToolbar } from '../../components/common/ListingToolbar';
import { DeleteAction, EditAction, TableActions } from '../../components/common/TableActions';
import { BusyOverlay, InlineSpinner, LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { useRowSelection } from '../../hooks/useRowSelection';
import { usePermissions } from '../../hooks/usePermissions';
import { useListParams } from '../../hooks/useListParams';
import { formatDate } from '../../utils/cn';
import { PERMISSIONS } from '../../constants/permissions';
import type { ExportColumn } from '../../utils/export';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  roleId: '',
  stores: [] as string[],
};

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';
}

function roleTone(slug = '') {
  if (slug === 'SUPER_ADMIN') return 'bg-rose-50 text-rose-700';
  if (slug === 'MANAGER') return 'bg-orange-50 text-orange-700';
  if (slug === 'ACCOUNTANT') return 'bg-sky-50 text-sky-700';
  return 'bg-slate-100 text-slate-700';
}

export default function Users() {
  const { user, can } = usePermissions();
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const { page, setPage, limit, setLimit, search, setSearch, query } = useListParams(20, [status]);
  const { data, isLoading } = useGetUsersQuery({
    ...query,
    status: status === 'ALL' ? undefined : status,
  });
  const totals = useGetUsersQuery({ page: 1, limit: 1 });
  const activeTotals = useGetUsersQuery({ page: 1, limit: 1, status: 'ACTIVE' });
  const inactiveTotals = useGetUsersQuery({ page: 1, limit: 1, status: 'INACTIVE' });
  const roles = useGetRolesQuery();
  const storesQuery = useGetStoresQuery({ limit: 100, sortBy: 'name', sortOrder: 'asc' });
  const stores = storesQuery.data?.data?.items || [];
  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [bulkDeleteUsers, { isLoading: deleting }] = useBulkDeleteUsersMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [form, setForm] = useState(emptyForm);
  const rows = data?.data || [];
  const selection = useRowSelection(rows.map((row: any) => row._id));
  const exportRows = selection.selected.length ? rows.filter((row: any) => selection.selected.includes(row._id)) : rows;
  const exportColumns: ExportColumn<any>[] = [
    { header: 'Name', value: (row) => row.name },
    { header: 'Email', value: (row) => row.email },
    { header: 'Role', value: (row) => row.roleId?.name || '' },
    { header: 'Stores', value: (row) => (row.stores || []).map((store: any) => store.name).join(', ') },
    { header: 'Status', value: (row) => (row.isActive ? 'Active' : 'Inactive') },
    { header: 'Last login', value: (row) => formatDate(row.lastLogin) },
  ];
  const roleOptions = roles.data?.data || [];
  const saving = creating || updating;

  const summary = useMemo(
    () => [
      { label: 'Team members', value: totals.data?.meta?.total || 0 },
      { label: 'Active', value: activeTotals.data?.meta?.total || 0 },
      { label: 'Inactive', value: inactiveTotals.data?.meta?.total || 0 },
    ],
    [totals.data?.meta?.total, activeTotals.data?.meta?.total, inactiveTotals.data?.meta?.total]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (row: any) => {
    setEditingId(row._id);
    setForm({
      name: row.name || '',
      email: row.email || '',
      password: '',
      roleId: row.roleId?._id || '',
      stores: (row.stores || []).map((store: any) => store._id),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const toggleStore = (storeId: string) => {
    setForm((current) => ({
      ...current,
      stores: current.stores.includes(storeId)
        ? current.stores.filter((id) => id !== storeId)
        : [...current.stores, storeId],
    }));
  };

  const saveUser = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.roleId) {
      toast.error('Name, email, and role are required');
      return;
    }
    try {
      if (editingId) {
        await updateUser({
          id: editingId,
          data: {
            name: form.name.trim(),
            email: form.email.trim(),
            roleId: form.roleId,
            stores: form.stores,
            defaultStore: form.stores[0] || null,
          },
        }).unwrap();
        toast.success('User updated');
      } else {
        if (form.password.length < 8) {
          toast.error('Password must be at least 8 characters');
          return;
        }
        await createUser({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          roleId: form.roleId,
          stores: form.stores,
          defaultStore: form.stores[0] || undefined,
        }).unwrap();
        toast.success('User created');
      }
      closeModal();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Unable to save user');
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage team access, roles, and store assignments."
        actions={
          can(PERMISSIONS.USERS_CREATE) ? (
            <button className="btn-primary" type="button" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add User
            </button>
          ) : null
        }
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <div key={item.label} className="card p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
            <p className="mt-2 text-2xl font-normal text-brand-red">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput value={search} onChange={setSearch} placeholder="Search name or email" />
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`rounded-lg px-3 py-1.5 text-xs font-normal capitalize ${
                    status === value ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-500 hover:text-ink-900'
                  }`}
                  onClick={() => setStatus(value)}
                >
                  {value === 'ALL' ? 'All' : value === 'ACTIVE' ? 'Active' : 'Inactive'}
                </button>
              ))}
            </div>
          </div>
          <ListingToolbar
            title="Users"
            fileName="sns-users"
            columns={exportColumns}
            rows={exportRows}
            selectedCount={selection.selected.length}
            deleting={deleting}
            onDeleteSelected={can(PERMISSIONS.USERS_DELETE) ? () => setDeleteIds(selection.selected) : undefined}
          />
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <DataTable
              rows={rows}
              selectable
              selectedIds={selection.selected}
              onToggle={selection.toggle}
              onToggleAll={selection.toggleAll}
              emptyTitle="No users found"
              emptyDescription="Try another search, or add a team member to get started."
              columns={[
                {
                  key: 'name',
                  header: 'User',
                  render: (row: any) => (
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-blue text-xs font-normal text-white">
                        {initials(row.name)}
                      </span>
                      <div>
                        <p className="font-normal text-ink-900">{row.name}</p>
                        <p className="text-xs text-slate-500">{row.email}</p>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'role',
                  header: 'Role',
                  render: (row: any) => (
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-normal ${roleTone(row.roleId?.slug)}`}>
                      {row.roleId?.name || '—'}
                    </span>
                  ),
                },
                {
                  key: 'stores',
                  header: 'Store access',
                  render: (row: any) => {
                    const assigned = row.stores || [];
                    if (!assigned.length) return <span className="text-slate-400">No stores</span>;
                    const visible = assigned.slice(0, 2);
                    const extra = assigned.length - visible.length;
                    return (
                      <div className="flex flex-wrap gap-1.5">
                        {visible.map((store: any) => (
                          <span key={store._id} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            {store.name}
                          </span>
                        ))}
                        {extra > 0 ? (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">+{extra}</span>
                        ) : null}
                      </div>
                    );
                  },
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (row: any) => (
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-normal ${
                        row.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {row.isActive ? 'Active' : 'Inactive'}
                    </span>
                  ),
                },
                {
                  key: 'login',
                  header: 'Last login',
                  render: (row: any) => <span className="text-slate-600">{formatDate(row.lastLogin)}</span>,
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (row: any) => {
                    const isSelf = String(row._id) === String(user?.id);
                    return (
                      <TableActions>
                        {can(PERMISSIONS.USERS_UPDATE) ? <EditAction onClick={() => openEdit(row)} /> : null}
                        {can(PERMISSIONS.USERS_UPDATE) ? (
                          <button
                            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-normal text-slate-600 hover:bg-slate-50"
                            type="button"
                            disabled={isSelf}
                            onClick={() => updateUser({ id: row._id, data: { isActive: !row.isActive } })}
                          >
                            {row.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        ) : null}
                        {can(PERMISSIONS.USERS_DELETE) && !isSelf ? (
                          <DeleteAction onClick={() => setDeleteIds([row._id])} />
                        ) : null}
                      </TableActions>
                    );
                  },
                },
              ]}
            />
            <Pagination meta={data?.meta} onPageChange={setPage} onLimitChange={setLimit} />
          </>
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editingId ? 'Edit user' : 'Add user'}
        description={
          editingId
            ? 'Update this team member’s role and store access.'
            : 'Create a team member and assign their role and stores.'
        }
        onClose={closeModal}
        wide
      >
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            await saveUser();
          }}
        >
          <label className="text-sm font-medium text-slate-700">
            Full name
            <input
              className="soft-input mt-1.5"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Maya Johnson"
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Email
            <input
              className="soft-input mt-1.5"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="user@smashandstack.com"
              required
            />
          </label>
          {!editingId ? (
            <label className="text-sm font-medium text-slate-700">
              Temporary password
              <input
                className="soft-input mt-1.5"
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder="At least 8 characters"
                required
              />
            </label>
          ) : null}
          <label className={`text-sm font-medium text-slate-700 ${editingId ? 'md:col-span-2' : ''}`}>
            Role
            <select
              className="soft-input mt-1.5"
              value={form.roleId}
              onChange={(event) => setForm({ ...form, roleId: event.target.value })}
              required
            >
              <option value="">Select role</option>
              {roleOptions.map((role: any) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-slate-700">Store access</p>
            <p className="mt-1 text-xs text-slate-500">Choose the branches this user can work with.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {stores.map((store: any) => {
                const checked = form.stores.includes(store._id);
                return (
                  <label
                    key={store._id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm ${
                      checked ? 'border-brand-red/30 bg-rose-50/70' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggleStore(store._id)} />
                    <span>
                      <span className="block font-medium text-ink-900">{store.name}</span>
                      <span className="block text-xs text-slate-500">{store.storeCode}</span>
                    </span>
                  </label>
                );
              })}
              {!stores.length ? <p className="text-sm text-slate-500">No stores available yet.</p> : null}
            </div>
          </div>
          <div className="flex justify-end gap-2 md:col-span-2">
            <button className="btn-secondary" type="button" onClick={closeModal}>
              Cancel
            </button>
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? (
                <>
                  <InlineSpinner className="border-white/30 border-t-white" />
                  Saving...
                </>
              ) : editingId ? (
                'Save changes'
              ) : (
                'Create user'
              )}
            </button>
          </div>
        </form>
      </Modal>

      <BusyOverlay show={deleting} label="Deleting users..." />
      <ConfirmDialog
        open={deleteIds.length > 0}
        title={deleteIds.length > 1 ? 'Delete selected users' : 'Delete user'}
        description="This permanently removes the selected team members."
        onClose={() => setDeleteIds([])}
        onConfirm={async () => {
          try {
            await bulkDeleteUsers(deleteIds).unwrap();
            toast.success(deleteIds.length > 1 ? 'Selected users deleted' : 'User deleted');
            selection.clear();
            setDeleteIds([]);
          } catch (error: any) {
            toast.error(error?.data?.message || 'Unable to delete users');
          }
        }}
      />
    </div>
  );
}
