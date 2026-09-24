import type { DashboardOverview } from '../../types';
import { formatCurrencyExact, formatDate } from '../../utils/cn';

export function TopExpenses({ rows }: { rows: DashboardOverview['topExpenses'] }) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 text-lg font-normal">Top Expenses</h3>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-3 border-b border-slate-50 pb-3 last:border-0">
            <div>
              <p className="font-medium">{row.title}</p>
              <p className="text-xs text-slate-500">
                {row.category} · {row.store} · {formatDate(row.date)}
              </p>
            </div>
            <p className="font-normal text-brand-red">{formatCurrencyExact(row.amount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
