import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { DataTable } from '../../components/common/DataTable';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { BusyOverlay, InlineSpinner, LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useBulkDeleteSalesMutation, useCreateSaleMutation, useGetSalesQuery } from '../../api/salesApi';
import { useGetPaymentMethodsQuery } from '../../api/paymentMethodsApi';
import { useStoreContext } from '../../hooks/usePermissions';
import { useListParams } from '../../hooks/useListParams';
import { formatCurrencyExact, formatDate } from '../../utils/cn';
import { clearZeroOnFocus, parseNumericInput, type NumericField } from '../../utils/numberInput';
import { Pagination } from '../../components/common/Pagination';
import { DeleteAction, TableActions } from '../../components/common/TableActions';
import { ListingToolbar } from '../../components/common/ListingToolbar';
import { useRowSelection } from '../../hooks/useRowSelection';
import type { ExportColumn } from '../../utils/export';

export default function Sales() {
  const [open, setOpen] = useState(false);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const { selectedStoreId, stores } = useStoreContext();
  const { page, setPage, limit, setLimit, search, setSearch, query } = useListParams(20, [selectedStoreId]);
  const { data, isLoading } = useGetSalesQuery({ ...query, storeId: selectedStoreId || undefined });
  const rows = data?.data || [];
  const selection = useRowSelection(rows.map((row: any) => row._id));
  const exportRows = selection.selected.length ? rows.filter((row: any) => selection.selected.includes(row._id)) : rows;
  const exportColumns: ExportColumn<any>[] = [
    { header: 'Store', value: (row) => row.storeId?.name || '' },
    { header: 'Customer', value: (row) => row.customerName },
    { header: 'Amount', value: (row) => row.totalAmount },
    { header: 'Payment', value: (row) => row.paymentMethod },
    { header: 'Date', value: (row) => formatDate(row.saleDate) },
  ];
  const methodsQuery = useGetPaymentMethodsQuery({ limit: 100, status: 'ACTIVE', sortBy: 'name', sortOrder: 'asc' });
  const paymentMethods = methodsQuery.data?.data || [];
  const [createSale, { isLoading: creating }] = useCreateSaleMutation();
  const [bulkDeleteSales, { isLoading: deleting }] = useBulkDeleteSalesMutation();
  const [form, setForm] = useState<{
    storeId: string;
    amount: NumericField;
    paymentMethod: string;
    customerName: string;
  }>({ storeId: '', amount: '', paymentMethod: '', customerName: 'Walk-in Guest' });

  return (
    <div>
      <PageHeader
        title="Sales Income"
        subtitle="Record and review store-level sales."
        actions={
          <button className="btn-primary" type="button" onClick={() => setOpen(true)}>
            Add Sale
          </button>
        }
      />
      <div className="card p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput value={search} onChange={setSearch} placeholder="Search customer or reference" />
          <ListingToolbar
            title="Sales Income"
            fileName="sns-sales"
            columns={exportColumns}
            rows={exportRows}
            selectedCount={selection.selected.length}
            deleting={deleting}
            onDeleteSelected={() => setDeleteIds(selection.selected)}
          />
        </div>
        {isLoading ? <LoadingSpinner /> : (
          <div className="mt-4">
            <DataTable
              rows={rows}
              selectable
              selectedIds={selection.selected}
              onToggle={selection.toggle}
              onToggleAll={selection.toggleAll}
              columns={[
                { key: 'store', header: 'Store', render: (row: any) => row.storeId?.name },
                { key: 'customer', header: 'Customer', render: (row: any) => row.customerName },
                { key: 'amount', header: 'Amount', render: (row: any) => formatCurrencyExact(row.totalAmount) },
                { key: 'method', header: 'Payment', render: (row: any) => row.paymentMethod },
                { key: 'date', header: 'Date', render: (row: any) => formatDate(row.saleDate) },
                {
                  key: 'actions',
                  header: '',
                  render: (row: any) => (
                    <TableActions>
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

      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/40 p-4">
          <form
            className="card w-full max-w-lg space-y-3 p-6"
            onSubmit={async (event) => {
              event.preventDefault();
              const storeId = form.storeId || selectedStoreId || stores[0]?._id;
              if (!storeId || !form.paymentMethod || !form.amount) {
                toast.error('Please fill in store, amount, and payment method');
                return;
              }
              try {
                await createSale({
                  storeId,
                  customerName: form.customerName,
                  paymentMethod: form.paymentMethod,
                  totalAmount: Number(form.amount),
                }).unwrap();
                toast.success('Sale recorded');
                setOpen(false);
                setForm({ storeId: '', amount: '', paymentMethod: '', customerName: 'Walk-in Guest' });
              } catch (error: any) {
                toast.error(error?.data?.message || 'Unable to save sale');
              }
            }}
          >
            <h3 className="text-lg font-normal">New sale</h3>
            <select className="soft-input" value={form.storeId} onChange={(e) => setForm({ ...form, storeId: e.target.value })} required>
              <option value="">Select store</option>
              {stores.map((store) => (
                <option key={store._id} value={store._id}>{store.name}</option>
              ))}
            </select>
            <input
              className="soft-input"
              type="number"
              min={0.01}
              step="0.01"
              placeholder="Sale amount"
              value={form.amount}
              onFocus={() => setForm((current) => ({ ...current, amount: clearZeroOnFocus(current.amount) }))}
              onChange={(e) => setForm({ ...form, amount: parseNumericInput(e.target.value) })}
              required
            />
            <select className="soft-input" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} required>
              <option value="">Select payment method</option>
              {paymentMethods.map((method: any) => (
                <option key={method._id} value={method.name}>{method.name}</option>
              ))}
            </select>
            {!paymentMethods.length ? (
              <p className="text-xs text-slate-500">Add methods from Payment Method first.</p>
            ) : null}
            <div className="flex justify-end gap-2">
              <button className="btn-secondary" type="button" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn-primary" type="submit" disabled={creating}>
                {creating ? <><InlineSpinner className="border-white/30 border-t-white" /> Saving...</> : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <BusyOverlay show={creating || deleting} label={deleting ? 'Deleting sales...' : 'Saving sale...'} />
      <ConfirmDialog
        open={deleteIds.length > 0}
        title={deleteIds.length > 1 ? 'Delete selected sales' : 'Delete sale'}
        description="Selected sales will be permanently removed from analytics."
        onClose={() => setDeleteIds([])}
        onConfirm={async () => {
          try {
            await bulkDeleteSales(deleteIds).unwrap();
            toast.success(deleteIds.length > 1 ? 'Selected sales deleted' : 'Sale deleted');
            selection.clear();
            setDeleteIds([]);
          } catch (error: any) {
            toast.error(error?.data?.message || 'Unable to delete sales');
          }
        }}
      />
    </div>
  );
}
