import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { SearchInput } from '../../components/common/SearchInput';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ListingToolbar } from '../../components/common/ListingToolbar';
import { DeleteAction, EditAction, TableActions } from '../../components/common/TableActions';
import { Modal } from '../../components/common/Modal';
import { BusyOverlay, InlineSpinner, LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useRowSelection } from '../../hooks/useRowSelection';
import { useListParams } from '../../hooks/useListParams';
import {
  useBulkDeletePaymentMethodsMutation,
  useCreatePaymentMethodMutation,
  useGetPaymentMethodsQuery,
  useUpdatePaymentMethodMutation,
} from '../../api/paymentMethodsApi';
import type { ExportColumn } from '../../utils/export';

const emptyForm = { name: '', isActive: true };

export default function PaymentMethods() {
  const { page, setPage, limit, setLimit, search, setSearch, query } = useListParams();
  const { data, isLoading } = useGetPaymentMethodsQuery(query);
  const [createMethod, { isLoading: creating }] = useCreatePaymentMethodMutation();
  const [updateMethod, { isLoading: updating }] = useUpdatePaymentMethodMutation();
  const [bulkDeleteMethods, { isLoading: deleting }] = useBulkDeletePaymentMethodsMutation();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [form, setForm] = useState(emptyForm);
  const rows = data?.data || [];
  const selection = useRowSelection(rows.map((row: any) => row._id));
  const exportRows = selection.selected.length ? rows.filter((row: any) => selection.selected.includes(row._id)) : rows;
  const exportColumns: ExportColumn<any>[] = [
    { header: 'Payment method', value: (row) => row.name },
    { header: 'Status', value: (row) => (row.isActive ? 'Active' : 'Inactive') },
  ];
  const saving = creating || updating;

  const closeModal = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div>
      <PageHeader
        title="Payment Methods"
        subtitle="Create the payment methods used on sales and expenses."
        actions={
          <button
            className="btn-primary"
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Method
          </button>
        }
      />

      <div className="card p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput value={search} onChange={setSearch} placeholder="Search payment methods" />
          <ListingToolbar
            title="Payment Methods"
            fileName="sns-payment-methods"
            columns={exportColumns}
            rows={exportRows}
            selectedCount={selection.selected.length}
            deleting={deleting}
            onDeleteSelected={() => setDeleteIds(selection.selected)}
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
              emptyTitle="No payment methods yet"
              emptyDescription="Add a method to use it when recording sales and expenses."
              columns={[
                { key: 'name', header: 'Method', render: (row: any) => <span className="font-normal">{row.name}</span> },
                {
                  key: 'status',
                  header: 'Status',
                  render: (row: any) => (
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-normal ${
                        row.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {row.isActive ? 'Active' : 'Inactive'}
                    </span>
                  ),
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (row: any) => (
                    <TableActions>
                      <EditAction
                        onClick={() => {
                          setEditingId(row._id);
                          setForm({ name: row.name, isActive: row.isActive !== false });
                          setOpen(true);
                        }}
                      />
                      <DeleteAction onClick={() => setDeleteIds([row._id])} />
                    </TableActions>
                  ),
                },
              ]}
            />
            <Pagination meta={data?.meta} onPageChange={setPage} onLimitChange={setLimit} />
          </>
        )}
      </div>

      <Modal
        open={open}
        title={editingId ? 'Edit payment method' : 'Add payment method'}
        description="This name appears on the Add Sale and Add Expense forms."
        onClose={closeModal}
      >
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              if (editingId) {
                await updateMethod({ id: editingId, data: form }).unwrap();
                toast.success('Payment method updated');
              } else {
                await createMethod(form).unwrap();
                toast.success('Payment method created');
              }
              closeModal();
            } catch (error: any) {
              toast.error(error?.data?.message || 'Unable to save payment method');
            }
          }}
        >
          <label className="block text-sm font-medium text-slate-300">
            Method name
            <input
              className="soft-input mt-1.5"
              placeholder="Card"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
            />
            Active
          </label>
          <div className="flex justify-end gap-2">
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
                'Create method'
              )}
            </button>
          </div>
        </form>
      </Modal>

      <BusyOverlay show={deleting} label="Deleting payment methods..." />
      <ConfirmDialog
        open={deleteIds.length > 0}
        title={deleteIds.length > 1 ? 'Delete selected methods' : 'Delete payment method'}
        description="Methods used on existing sales or expenses cannot be deleted."
        onClose={() => setDeleteIds([])}
        onConfirm={async () => {
          try {
            await bulkDeletePaymentMethods(deleteIds).unwrap();
            toast.success(deleteIds.length > 1 ? 'Selected methods deleted' : 'Payment method deleted');
            selection.clear();
            setDeleteIds([]);
          } catch (error: any) {
            toast.error(error?.data?.message || 'Unable to delete payment methods');
          }
        }}
      />
    </div>
  );
}
