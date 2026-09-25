import type { ReactNode } from 'react';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T extends { _id?: string; id?: string }>({
  columns,
  rows,
  emptyTitle = 'No records yet',
  emptyDescription = 'Nothing to show for the current filters.',
  selectable = false,
  selectedIds = [],
  onToggle,
  onToggleAll,
}: {
  columns: Column<T>[];
  rows: T[];
  emptyTitle?: string;
  emptyDescription?: string;
  selectable?: boolean;
  selectedIds?: string[];
  onToggle?: (id: string) => void;
  onToggleAll?: () => void;
}) {
  const rowId = (row: T) => String(row._id || row.id || '');
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(rowId(row)));

  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-surface-raised text-xs font-medium uppercase tracking-wide text-slate-400">
            {selectable ? (
              <th className="w-12 px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={onToggleAll} aria-label="Select all" />
              </th>
            ) : null}
            {columns.map((column) => (
              <th key={column.key} className={`px-4 py-3 font-medium ${column.className || ''}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const id = rowId(row);
            return (
              <tr key={id || index} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                {selectable ? (
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(id)}
                      onChange={() => onToggle?.(id)}
                      aria-label="Select row"
                    />
                  </td>
                ) : null}
                {columns.map((column) => (
                  <td key={column.key} className={`px-4 py-3.5 align-middle text-ink-800 ${column.className || ''}`}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
