import { useState } from 'react';
import { Calendar, CheckCircle2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { DataTable } from '../../components/common/DataTable';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { BusyOverlay, InlineSpinner, LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { ListingToolbar } from '../../components/common/ListingToolbar';
import { DeleteAction, EditAction, TableActions } from '../../components/common/TableActions';
import { useStoreContext } from '../../hooks/usePermissions';
import { useListParams } from '../../hooks/useListParams';
import { useRowSelection } from '../../hooks/useRowSelection';
import { formatCurrencyExact, formatDate } from '../../utils/cn';
import { clearZeroOnFocus, parseNumericInput, type NumericField } from '../../utils/numberInput';
import {
  useBulkDeleteMoneyBorrowedMutation,
  useCreateMoneyBorrowedMutation,
  useGetMoneyBorrowedQuery,
  useMarkMoneyBorrowedPaidMutation,
  useUpdateMoneyBorrowedMutation,
} from '../../api/moneyBorrowedApi';
import type { ExportColumn } from '../../utils/export';

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm: {
  storeId: string;
  borrowedFrom: string;
  amount: NumericField;
  borrowedDate: string;
  note: string;
} = {
  storeId: '',
  borrowedFrom: '',
  amount: 0,
  borrowedDate: today(),
  note: '',
};

function RequiredLabel({ children }: { children: string }) {
  return (
    <span className="mb-1.5 block text-sm font-medium text-slate-300">
      {children} <span className="text-brand-red">*</span>
    </span>
  );
}

export default function MoneyBorrowed() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [payId, setPayId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { selectedStoreId, stores } = useStoreContext();
  const { page, setPage, limit, setLimit, search, setSearch, query } = useListParams(20, [selectedStoreId]);
  const { data, isLoading } = useGetMoneyBorrowedQuery({ ...query, storeId: selectedStoreId || undefined });
  const [createBorrowed, { isLoading: creating }] = useCreateMoneyBorrowedMutation();
  const [updateBorrowed, { isLoading: updating }] = useUpdateMoneyBorrowedMutation();
  const [markPaid, { isLoading: marking }] = useMarkMoneyBorrowedPaidMutation();
  const [bulkDelete, { isLoading: deleting }] = useBulkDeleteMoneyBorrowedMutation();
  const rows = data?.data || [];
  const selection = useRowSelection(rows.map((row: any) => row._id));
  const exportRows = selection.selected.length ? rows.filter((row: any) => selection.selected.includes(row._id)) : rows;
  const exportColumns: ExportColumn<any>[] = [
    { header: 'Store', value: (row) => row.storeId?.name || '' },
    { header: 'Borrowed from', value: (row) => row.borrowedFrom },
    { header: 'Amount', value: (row) => row.amount },
    { header: 'Date', value: (row) => formatDate(row.borrowedDate) },
    { header: 'Status', value: (row) => row.status },
    { header: 'Note', value: (row) => row.note || '' },
  ];
  const saving = creating || updating;
  const openTotal = rows
    .filter((row: any) => row.status === 'OPEN')
    .reduce((sum: number, row: any) => sum + Number(row.amount || 0), 0);

  const closeModal = () => {
    setOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm, borrowedDate: today() });
  };

  return (
    <div>
      <PageHeader
        title="Money borrowed"
        subtitle="Track owner or lender advances. Open amounts stay on the final summary until paid off."
        actions={
          <button
            className="btn-primary"
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({
                ...emptyForm,
                storeId: selectedStoreId || '',
                borrowedDate: today(),
              });
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add borrowed money
          </button>
        }
      />

      <div className="mb-5 grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Open on this page</p>
          <p className="mt-2 text-2xl font-medium text-ink-900">{formatCurrencyExact(openTotal)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Records shown</p>
          <p className="mt-2 text-2xl font-medium text-ink-900">{data?.meta?.total || 0}</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput value={search} onChange={setSearch} placeholder="Search lender or note" />
          <ListingToolbar
            title="Money borrowed"
            fileName="sns-money-borrowed"
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
              emptyTitle="No borrowed money yet"
              emptyDescription="Record owner or lender advances to keep them visible until paid off."
              columns={[
                { key: 'store', header: 'Store', render: (row: any) => row.storeId?.name || '—' },
                { key: 'from', header: 'Borrowed from', render: (row: any) => row.borrowedFrom },
                { key: 'amount', header: 'Amount', render: (row: any) => formatCurrencyExact(row.amount) },
                { key: 'date', header: 'Date', render: (row: any) => formatDate(row.borrowedDate) },
                {
                  key: 'status',
                  header: 'Status',
                  render: (row: any) => (
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        row.status === 'OPEN' ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-400'
                      }`}
                    >
                      {row.status === 'OPEN' ? 'Open' : 'Paid'}
                    </span>
                  ),
                },
                { key: 'note', header: 'Note', render: (row: any) => row.note || '—' },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (row: any) => (
                    <TableActions>
                      {row.status === 'OPEN' ? (
                        <>
                          <EditAction
                            onClick={() => {
                              setEditingId(row._id);
                              setForm({
                                storeId: row.storeId?._id || row.storeId || '',
                                borrowedFrom: row.borrowedFrom || '',
                                amount: row.amount,
                                borrowedDate: row.borrowedDate
                                  ? new Date(row.borrowedDate).toISOString().slice(0, 10)
                                  : today(),
                                note: row.note || '',
                              });
                              setOpen(true);
                            }}
                          />
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-surface-raised text-emerald-400 transition hover:bg-emerald-500/10"
                            title="Mark as paid"
                            aria-label="Mark as paid"
                            onClick={() => setPayId(row._id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        </>
                      ) : null}
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
        title={editingId ? 'Edit borrowed money' : 'Add borrowed money'}
        description="This amount stays open on the final summary until it is paid off."
        onClose={closeModal}
      >
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const storeId = form.storeId || selectedStoreId || stores[0]?._id;
            if (!storeId || !form.borrowedFrom.trim() || !form.amount || !form.borrowedDate) {
              toast.error('Please fill in all required fields');
              return;
            }
            const payload = {
              storeId,
              borrowedFrom: form.borrowedFrom.trim(),
              amount: Number(form.amount),
              borrowedDate: form.borrowedDate,
              note: form.note.trim(),
            };
            try {
              if (editingId) {
                await updateBorrowed({ id: editingId, data: payload }).unwrap();
                toast.success('Borrowed money updated');
              } else {
                await createBorrowed(payload).unwrap();
                toast.success('Borrowed money recorded');
              }
              closeModal();
            } catch (error: any) {
              toast.error(error?.data?.message || 'Unable to save borrowed money');
            }
          }}
        >
          <label className="block">
            <RequiredLabel>Store</RequiredLabel>
            <select
              className="soft-input"
              value={form.storeId}
              onChange={(event) => setForm({ ...form, storeId: event.target.value })}
              required
            >
              <option value="">Select store</option>
              {stores.map((store) => (
                <option key={store._id} value={store._id}>
                  {store.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <RequiredLabel>Borrowed from</RequiredLabel>
            <input
              className="soft-input"
              placeholder="Owner, partner, or lender"
              value={form.borrowedFrom}
              onChange={(event) => setForm({ ...form, borrowedFrom: event.target.value })}
              required
            />
          </label>
          <label className="block">
            <RequiredLabel>Amount</RequiredLabel>
            <input
              className="soft-input"
              type="number"
              min={0.01}
              step="0.01"
              value={form.amount}
              onFocus={() => setForm((current) => ({ ...current, amount: clearZeroOnFocus(current.amount) }))}
              onChange={(event) => setForm({ ...form, amount: parseNumericInput(event.target.value) })}
              required
            />
          </label>
          <label className="block">
            <RequiredLabel>Date</RequiredLabel>
            <span className="soft-input flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-brand-red" />
              <input
                className="w-full bg-transparent outline-none"
                type="date"
                value={form.borrowedDate}
                onChange={(event) => setForm({ ...form, borrowedDate: event.target.value })}
                required
              />
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-300">Note</span>
            <input
              className="soft-input"
              placeholder="Optional"
              value={form.note}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
            />
          </label>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" type="button" onClick={closeModal}>
              Cancel
            </button>
            <button className="btn-primary" type="submit" disabled={saving || !stores.length}>
              {saving ? (
                <>
                  <InlineSpinner className="border-white/30 border-t-white" />
                  Saving...
                </>
              ) : editingId ? (
                'Save changes'
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </Modal>

      <BusyOverlay
        show={saving || deleting || marking}
        label={marking ? 'Marking as paid...' : deleting ? 'Deleting...' : 'Saving...'}
      />
      <ConfirmDialog
        open={deleteIds.length > 0}
        title={deleteIds.length > 1 ? 'Delete selected records' : 'Delete borrowed money'}
        description="This permanently removes the selected borrowed money records."
        onClose={() => setDeleteIds([])}
        onConfirm={async () => {
          try {
            await bulkDelete(deleteIds).unwrap();
            toast.success(deleteIds.length > 1 ? 'Selected records deleted' : 'Record deleted');
            selection.clear();
            setDeleteIds([]);
          } catch (error: any) {
            toast.error(error?.data?.message || 'Unable to delete records');
          }
        }}
      />
      <ConfirmDialog
        open={Boolean(payId)}
        title="Mark as paid"
        description="This removes the amount from the open final summary."
        onClose={() => setPayId(null)}
        onConfirm={async () => {
          if (!payId) return;
          try {
            await markPaid(payId).unwrap();
            toast.success('Marked as paid');
            setPayId(null);
          } catch (error: any) {
            toast.error(error?.data?.message || 'Unable to mark as paid');
          }
        }}
      />
    </div>
  );
}
