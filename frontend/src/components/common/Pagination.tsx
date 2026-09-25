import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

function pageWindow(page: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  return [...pages].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b);
}

export function Pagination({
  meta,
  onPageChange,
  onLimitChange,
}: {
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}) {
  const page = meta?.page || 1;
  const limit = meta?.limit || 20;
  const total = meta?.total || 0;
  const totalPages = meta?.totalPages || 1;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const pages = pageWindow(page, totalPages);

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-400">
        Showing <span className="font-medium text-ink-900">{start}</span>–
        <span className="font-medium text-ink-900">{end}</span> of{' '}
        <span className="font-medium text-ink-900">{total}</span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {onLimitChange ? (
          <select
            className="soft-input w-[110px] py-2"
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        ) : null}

        <button
          type="button"
          className="btn-secondary px-3 py-2 disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((value, index) => {
          const previous = pages[index - 1];
          const showEllipsis = previous && value - previous > 1;
          return (
            <span key={value} className="contents">
              {showEllipsis ? <span className="px-1 text-slate-500">…</span> : null}
              <button
                type="button"
                onClick={() => onPageChange(value)}
                className={cn(
                  'min-w-9 rounded-lg px-3 py-2 text-sm font-medium',
                  value === page
                    ? 'bg-brand-red text-white'
                    : 'border border-white/10 bg-surface-raised text-slate-300 hover:bg-white/5'
                )}
              >
                {value}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          className="btn-secondary px-3 py-2 disabled:opacity-40"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
