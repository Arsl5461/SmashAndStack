import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrencyExact } from '../../utils/cn';
import { formatAxisMoney } from './RevenueExpenseChart';
import type { TenderRow } from '../../pages/Reports/TenderTypesTable';

export function TenderMixChart({ rows }: { rows: TenderRow[] }) {
  const data = rows.filter((row) => row.salesTotal > 0 || row.refundTotal > 0 || row.amountCollected > 0);

  return (
    <div className="card flex h-full flex-col p-5">
      <div className="mb-4">
        <h3 className="text-lg font-normal">Tender Mix</h3>
        <p className="text-sm text-slate-500">Sales collected by payment method</p>
      </div>
      <div className="h-[320px] min-h-[320px]">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="tenderType" tick={{ fontSize: 12 }} interval={0} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={formatAxisMoney} axisLine={false} tickLine={false} width={48} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrencyExact(value),
                  name === 'salesTotal' ? 'Sales' : name === 'refundTotal' ? 'Refunds' : 'Collected',
                ]}
              />
              <Bar dataKey="salesTotal" fill="#E31B23" radius={[6, 6, 0, 0]} />
              <Bar dataKey="refundTotal" fill="#94A3B8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">No tender activity this month.</div>
        )}
      </div>
    </div>
  );
}
