import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { DashboardOverview } from '../../types';
import { formatCurrencyExact } from '../../utils/cn';

const COLORS = ['#E31B23', '#2F6BFF', '#0B1220', '#22C55E', '#3B82F6', '#8B5CF6', '#F59E0B', '#14B8A6', '#EC4899', '#64748B'];

export function ExpenseBreakdownChart({ data }: { data: DashboardOverview['expenseBreakdown'] }) {
  const slices = data.filter((item) => item.amount > 0);

  return (
    <div className="card flex h-full min-h-[420px] flex-col p-5">
      <h3 className="mb-1 text-lg font-normal">Expense Breakdown</h3>
      <p className="mb-3 text-sm text-slate-500">All categories in the selected period</p>
      <div className="h-[200px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={slices} dataKey="amount" nameKey="category" innerRadius={54} outerRadius={82} paddingAngle={2}>
              {slices.map((entry, index) => (
                <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number, name: string) => [formatCurrencyExact(value), name]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {slices.map((item, index) => (
          <div key={item.category} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
              <span className="truncate">{item.category}</span>
            </span>
            <span className="shrink-0 font-normal text-ink-900">
              {formatCurrencyExact(item.amount)}
              <span className="ml-2 font-medium text-slate-400">{item.percentage}%</span>
            </span>
          </div>
        ))}
        {!slices.length ? <p className="text-sm text-slate-400">No expenses in this period.</p> : null}
      </div>
    </div>
  );
}
