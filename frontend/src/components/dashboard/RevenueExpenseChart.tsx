import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';
import type { DashboardOverview } from '../../types';
import { formatCurrencyExact } from '../../utils/cn';

function formatAxisDate(value: string, groupBy?: string) {
  const date = new Date(value);
  if (groupBy === 'month' || groupBy === 'year') return format(date, 'MMM yyyy');
  if (groupBy === 'week') return format(date, 'MMM d');
  return format(date, 'MMM d');
}

function formatAxisMoney(value: number) {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  return `$${Math.round(value)}`;
}

export function RevenueExpenseChart({
  data,
  groupBy,
}: {
  data: DashboardOverview['revenueVsExpense'];
  groupBy?: string;
}) {
  const chartData = data.map((row) => ({
    ...row,
    label: formatAxisDate(row.date, groupBy),
  }));

  return (
    <div className="card flex h-full flex-col p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-normal">Revenue vs Expenses</h3>
          <p className="text-sm text-slate-500">Live aggregation across the selected store context</p>
        </div>
        <div className="hidden items-center gap-4 text-xs font-normal sm:flex">
          <span className="flex items-center gap-1.5 text-brand-red">
            <span className="h-2 w-2 rounded-full bg-brand-red" /> Revenue
          </span>
          <span className="flex items-center gap-1.5 text-brand-orange">
            <span className="h-2 w-2 rounded-full bg-brand-orange" /> Expenses
          </span>
        </div>
      </div>
      <div className="h-[320px] min-h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E31B23" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#E31B23" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2F6BFF" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2F6BFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} minTickGap={28} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatAxisMoney} axisLine={false} tickLine={false} width={48} />
            <Tooltip
              formatter={(value: number, name: string) => [formatCurrencyExact(value), name === 'revenue' ? 'Revenue' : 'Expenses']}
              labelFormatter={(label) => label}
            />
            <Legend formatter={(value) => (value === 'revenue' ? 'Revenue' : 'Expenses')} />
            <Area type="monotone" dataKey="revenue" stroke="#E31B23" fill="url(#rev)" strokeWidth={2.4} dot={false} />
            <Area type="monotone" dataKey="expenses" stroke="#2F6BFF" fill="url(#exp)" strokeWidth={2.4} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export { formatAxisDate, formatAxisMoney };
