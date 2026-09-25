import { useState } from 'react';
import { Calendar, Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { DataTable } from '../../components/common/DataTable';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import {
  useBulkDeleteExpensesMutation,
  useCreateExpenseMutation,
  useGetExpenseCategoriesQuery,
  useGetExpensesQuery,
} from '../../api/expensesApi';
import { useGetStoresQuery } from '../../api/storesApi';
import { useGetPaymentMethodsQuery } from '../../api/paymentMethodsApi';
import { useStoreContext } from '../../hooks/usePermissions';
import { useListParams } from '../../hooks/useListParams';
import { formatCurrencyExact, formatDate } from '../../utils/cn';
import { clearZeroOnFocus, parseNumericInput, type NumericField } from '../../utils/numberInput';
import { Pagination } from '../../components/common/Pagination';
import { DeleteAction, TableActions, ViewAction } from '../../components/common/TableActions';
import { ListingToolbar } from '../../components/common/ListingToolbar';
import { useRowSelection } from '../../hooks/useRowSelection';
import type { ExportColumn } from '../../utils/export';

const emptyForm: {
  storeId: string;
  title: string;
  category: string;
  amount: NumericField;
  paymentMethod: string;
  expenseDate: string;
} = { storeId: '', title: '', category: '', amount: 0, paymentMethod: '', expenseDate: '' };

function RequiredLabel({ children }: { children: string }) {
  return (
    <span className="mb-1.5 block text-sm font-medium text-slate-300">
      {children} <span className="text-brand-red">*</span>
    </span>
  );
}

function receiptPath(url?: string) {
  if (!url) return '';
  const index = url.indexOf('/uploads/');
  return index >= 0 ? url.slice(index) : url;
}

export default function Expenses() {
  const [open, setOpen] = useState(false);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [viewReceipt, setViewReceipt] = useState<{ title: string; url: string } | null>(null);
  const { selectedStoreId } = useStoreContext();
  const { page, setPage, limit, setLimit, search, setSearch, query } = useListParams(20, [selectedStoreId]);
  const { data, isLoading } = useGetExpensesQuery({ ...query, storeId: selectedStoreId || undefined });
  const storesQuery = useGetStoresQuery({ limit: 100, sortBy: 'name', sortOrder: 'asc' });
  const categoriesQuery = useGetExpenseCategoriesQuery({ limit: 100, status: 'ACTIVE', sortBy: 'name', sortOrder: 'asc' });
  const methodsQuery = useGetPaymentMethodsQuery({ limit: 100, status: 'ACTIVE', sortBy: 'name', sortOrder: 'asc' });
  const stores = storesQuery.data?.data?.items || [];
  const categories = categoriesQuery.data?.data || [];
  const paymentMethods = methodsQuery.data?.data || [];
  const rows = data?.data || [];
  const selection = useRowSelection(rows.map((row: any) => row._id));
  const exportRows = selection.selected.length ? rows.filter((row: any) => selection.selected.includes(row._id)) : rows;
  const exportColumns: ExportColumn<any>[] = [
    { header: 'Title', value: (row) => row.title },
    { header: 'Store', value: (row) => row.storeId?.name || '' },
    { header: 'Category', value: (row) => row.category },
    { header: 'Amount', value: (row) => row.amount },
    { header: 'Date', value: (row) => formatDate(row.expenseDate) },
    { header: 'Receipt', value: (row) => (row.receiptUrl ? 'Yes' : 'No') },
  ];
  const [createExpense] = useCreateExpenseMutation();
  const [bulkDeleteExpenses] = useBulkDeleteExpensesMutation();
  const [form, setForm] = useState(emptyForm);

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Track operating costs by store, category, and date range."
        actions={
          <button className="btn-primary" type="button" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Expense
          </button>
        }
      />
      <div className="card p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput value={search} onChange={setSearch} placeholder="Search expenses" />
          <ListingToolbar
            title="Expenses"
            fileName="sns-expenses"
            columns={exportColumns}
            rows={exportRows}
            selectedCount={selection.selected.length}
            onDeleteSelected={() => setDeleteIds(selection.selected)}
          />
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="mt-4">
            <DataTable
              rows={rows}
              selectable
              selectedIds={selection.selected}
              onToggle={selection.toggle}
              onToggleAll={selection.toggleAll}
              columns={[
                { key: 'title', header: 'Title', render: (row: any) => row.title },
                { key: 'store', header: 'Store', render: (row: any) => row.storeId?.name },
                { key: 'category', header: 'Category', render: (row: any) => row.category },
                { key: 'amount', header: 'Amount', render: (row: any) => formatCurrencyExact(row.amount) },
                { key: 'date', header: 'Date', render: (row: any) => formatDate(row.expenseDate) },
                {
                  key: 'receipt',
                  header: 'Receipt',
                  render: (row: any) =>
                    row.receiptUrl ? (
                      <button
                        type="button"
                        className="text-sm font-medium text-brand-red hover:text-brand-deep"
                        onClick={() => setViewReceipt({ title: row.title, url: receiptPath(row.receiptUrl) })}
                      >
                        View
                      </button>
                    ) : (
                      <span className="text-slate-400">—</span>
                    ),
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (row: any) => (
                    <TableActions>
                      {row.receiptUrl ? (
                        <ViewAction
                          label="View receipt"
                          onClick={() => setViewReceipt({ title: row.title, url: receiptPath(row.receiptUrl) })}
                        />
                      ) : null}
                      <DeleteAction onClick={() => setDeleteIds([row._id])} />
                    </TableActions>
                  ),
                },
              ]}
            />
            <Pagination meta={data?.meta} onPageChange={setPage} onLimitChange={setLimit} />
          </div>
        )}
      </div>
      <Modal
        open={open}
        title="New expense"
        description="Choose a category from Expense Categories, then save the cost."
        onClose={() => {
          setOpen(false);
          setForm(emptyForm);
          setReceipt(null);
        }}
      >
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const storeId = form.storeId || selectedStoreId || stores[0]?._id;
            if (!storeId || !form.title || !form.category || !form.paymentMethod || !form.expenseDate || !form.amount) {
              toast.error('Please fill in all required fields');
              return;
            }
            try {
              const payload = new FormData();
              payload.append('storeId', String(storeId));
              payload.append('title', form.title);
              payload.append('category', form.category);
              payload.append('paymentMethod', form.paymentMethod);
              payload.append('expenseDate', form.expenseDate);
              payload.append('amount', String(form.amount));
              if (receipt) payload.append('receipt', receipt);
              await createExpense(payload).unwrap();
              toast.success('Expense recorded');
              setOpen(false);
              setForm(emptyForm);
              setReceipt(null);
            } catch (error: any) {
              toast.error(error?.data?.message || 'Unable to save expense');
            }
          }}
        >
          <label className="block">
            <RequiredLabel>Store</RequiredLabel>
            <select className="soft-input" value={form.storeId} onChange={(e) => setForm({ ...form, storeId: e.target.value })} required>
              <option value="">Select store</option>
              {stores.map((store: any) => (
                <option key={store._id} value={store._id}>
                  {store.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <RequiredLabel>Title</RequiredLabel>
            <input
              className="soft-input"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </label>
          <label className="block">
            <RequiredLabel>Category</RequiredLabel>
            <select
              className="soft-input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="">Select category</option>
              {categories.map((item: any) => (
                <option key={item._id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          {!categories.length ? (
            <p className="text-xs text-slate-500">Add categories from Expense Categories first.</p>
          ) : null}
          <label className="block">
            <RequiredLabel>Payment method</RequiredLabel>
            <select
              className="soft-input"
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              required
            >
              <option value="">Select payment method</option>
              {paymentMethods.map((item: any) => (
                <option key={item._id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          {!paymentMethods.length ? (
            <p className="text-xs text-slate-500">Add methods from Payment Method first.</p>
          ) : null}
          <label className="block">
            <RequiredLabel>Date</RequiredLabel>
            <span className="soft-input flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-brand-red" />
              <input
                className="w-full bg-transparent outline-none"
                type="date"
                value={form.expenseDate}
                onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                required
              />
            </span>
          </label>
          <label className="block">
            <RequiredLabel>Amount</RequiredLabel>
            <input
              className="soft-input"
              type="number"
              placeholder="Amount"
              value={form.amount}
              onFocus={() => setForm((current) => ({ ...current, amount: clearZeroOnFocus(current.amount) }))}
              onChange={(e) => setForm({ ...form, amount: parseNumericInput(e.target.value) })}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-300">Receipt</span>
            <span className="soft-input flex cursor-pointer items-center gap-2">
              <Upload className="h-4 w-4 shrink-0 text-brand-red" />
              <input
                className="w-full bg-transparent text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-sm file:font-medium file:text-ink-900"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(event) => setReceipt(event.target.files?.[0] || null)}
              />
            </span>
            <p className="mt-1 text-xs text-slate-500">Optional. JPG, PNG, WEBP, or PDF up to 5 MB.</p>
          </label>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" type="button" onClick={() => { setOpen(false); setForm(emptyForm); setReceipt(null); }}>
              Cancel
            </button>
            <button className="btn-primary" type="submit" disabled={!categories.length || !paymentMethods.length}>
              Save
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        open={Boolean(viewReceipt)}
        title={viewReceipt ? `Receipt · ${viewReceipt.title}` : 'Receipt'}
        onClose={() => setViewReceipt(null)}
        wide
      >
        {viewReceipt ? (
          <div className="space-y-3">
            {viewReceipt.url.toLowerCase().includes('.pdf') ? (
              <iframe title="Expense receipt" className="h-[70vh] w-full rounded-xl border border-white/10" src={viewReceipt.url} />
            ) : (
              <img src={viewReceipt.url} alt="Expense receipt" className="max-h-[70vh] w-full rounded-xl object-contain bg-surface-raised" />
            )}
            <a className="text-sm font-medium text-brand-red hover:text-brand-deep" href={viewReceipt.url} target="_blank" rel="noreferrer">
              Open in new tab
            </a>
          </div>
        ) : null}
      </Modal>
      <ConfirmDialog
        open={deleteIds.length > 0}
        title={deleteIds.length > 1 ? 'Delete selected expenses' : 'Delete expense'}
        description="Selected expenses will be removed from profit calculations."
        onClose={() => setDeleteIds([])}
        onConfirm={async () => {
          try {
            await bulkDeleteExpenses(deleteIds).unwrap();
            toast.success(deleteIds.length > 1 ? 'Selected expenses deleted' : 'Expense deleted');
            selection.clear();
            setDeleteIds([]);
          } catch (error: any) {
            toast.error(error?.data?.message || 'Unable to delete expenses');
          }
        }}
      />
    </div>
  );
}
