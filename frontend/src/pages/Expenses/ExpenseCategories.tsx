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
  useBulkDeleteExpenseCategoriesMutation,
  useCreateExpenseCategoryMutation,
  useGetExpenseCategoriesQuery,
  useUpdateExpenseCategoryMutation,
} from '../../api/expensesApi';
import type { ExportColumn } from '../../utils/export';

const emptyForm = { name: '', isActive: true };

export default function ExpenseCategories() {
  const { page, setPage, limit, setLimit, search, setSearch, query } = useListParams();
  const { data, isLoading } = useGetExpenseCategoriesQuery(query);
  const [createCategory, { isLoading: creating }] = useCreateExpenseCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateExpenseCategoryMutation();
  const [bulkDeleteCategories, { isLoading: deleting }] = useBulkDeleteExpenseCategoriesMutation();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [form, setForm] = useState(emptyForm);
  const rows = data?.data || [];
  const selection = useRowSelection(rows.map((row: any) => row._id));
  const exportRows = selection.selected.length ? rows.filter((row: any) => selection.selected.includes(row._id)) : rows;
  const exportColumns: ExportColumn<any>[] = [
    { header: 'Category', value: (row) => row.name },
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
        title="Expense Categories"
        subtitle="Create the categories used when adding expenses."
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
            Add Category
          </button>
        }
      />

      <div className="card p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput value={search} onChange={setSearch} placeholder="Search categories" />
          <ListingToolbar
            title="Expense Categories"
            fileName="sns-expense-categories"
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
              emptyTitle="No categories yet"
              emptyDescription="Add a category to use it when recording expenses."
              columns={[
                { key: 'name', header: 'Category', render: (row: any) => <span className="font-normal">{row.name}</span> },
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
        title={editingId ? 'Edit category' : 'Add category'}
        description="This name appears in the Add Expense form."
        onClose={closeModal}
      >
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              if (editingId) {
                await updateCategory({ id: editingId, data: form }).unwrap();
                toast.success('Category updated');
              } else {
                await createCategory(form).unwrap();
                toast.success('Category created');
              }
              closeModal();
            } catch (error: any) {
              toast.error(error?.data?.message || 'Unable to save category');
            }
          }}
        >
          <label className="block text-sm font-medium text-slate-700">
            Category name
            <input
              className="soft-input mt-1.5"
              placeholder="Ingredients"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
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
                'Create category'
              )}
            </button>
          </div>
        </form>
      </Modal>

      <BusyOverlay show={deleting} label="Deleting categories..." />
      <ConfirmDialog
        open={deleteIds.length > 0}
        title={deleteIds.length > 1 ? 'Delete selected categories' : 'Delete category'}
        description="Categories used by existing expenses cannot be deleted."
        onClose={() => setDeleteIds([])}
        onConfirm={async () => {
          try {
            await bulkDeleteCategories(deleteIds).unwrap();
            toast.success(deleteIds.length > 1 ? 'Selected categories deleted' : 'Category deleted');
            selection.clear();
            setDeleteIds([]);
          } catch (error: any) {
            toast.error(error?.data?.message || 'Unable to delete categories');
          }
        }}
      />
    </div>
  );
}
