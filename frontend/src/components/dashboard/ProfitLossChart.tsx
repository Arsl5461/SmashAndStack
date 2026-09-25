import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DashboardOverview } from '../../types';
import { formatCurrency } from '../../utils/cn';
import { formatAxisDate, formatAxisMoney } from './RevenueExpenseChart';

export function ProfitLossChart({
  data,
  groupBy,
}: {
  data: DashboardOverview['profitLossData'];
  groupBy?: string;
}) {
  const chartData = data.map((row) => ({
    ...row,
    label: formatAxisDate(row.period, groupBy),
  }));

  return (
    <div className="card p-5">
      <h3 className="mb-4 text-lg font-normal">Profit & Loss</h3>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A3340" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#8B95A5' }} minTickGap={28} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#8B95A5' }} tickFormatter={formatAxisMoney} axisLine={false} tickLine={false} width={48} />
            <Tooltip
              contentStyle={{ background: '#1B232E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              labelStyle={{ color: '#E8EDF4' }}
              itemStyle={{ color: '#C5CDD8' }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#E31B23" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expenses" fill="#C9A227" radius={[6, 6, 0, 0]} />
            <Bar dataKey="netProfit" fill="#22C55E" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
