import { useState } from 'react';
import { useGetProfitLossQuery } from '../../api/dashboardApi';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ProfitLossChart } from '../../components/dashboard/ProfitLossChart';
import { formatCurrency } from '../../utils/cn';
import { useStoreContext } from '../../hooks/usePermissions';

export default function ProfitLoss() {
  const [range, setRange] = useState('30d');
  const { selectedStoreId } = useStoreContext();
  const groupBy = range === 'ytd' || range === '6m' ? 'month' : range === '3m' ? 'week' : 'day';
  const { data, isLoading } = useGetProfitLossQuery({ range, storeId: selectedStoreId || undefined, groupBy });
  const report = data?.data as any;

  return (
    <div>
      <PageHeader
        title="Profit & Loss"
        subtitle="Net profit is calculated from aggregated sales minus aggregated expenses."
        actions={
          <select className="soft-input w-40" value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="7d">Daily / 7 days</option>
            <option value="30d">Monthly window</option>
            <option value="3m">Quarter</option>
            <option value="ytd">Yearly</option>
          </select>
        }
      />
      {isLoading ? <LoadingSpinner /> : null}
      {report ? (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ['Gross Revenue', report.summary.grossRevenue],
              ['Total Expenses', report.summary.totalExpenses],
              ['Net Profit', report.summary.netProfit],
              ['Profit Margin', `${report.summary.profitMargin}%`],
            ].map(([label, value]) => (
              <div key={label} className="card p-5">
                <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-normal">{typeof value === 'number' ? formatCurrency(value) : value}</p>
              </div>
            ))}
          </div>
          <ProfitLossChart data={report.series || []} groupBy={report.range?.groupBy || groupBy} />
        </div>
      ) : null}
    </div>
  );
}
