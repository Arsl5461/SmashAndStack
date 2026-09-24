import { useMemo, useState } from 'react';
import { useGetOverviewQuery } from '../../api/dashboardApi';
import { PageHeader } from '../../components/common/PageHeader';
import { DateRangePicker } from '../../components/common/DateRangePicker';
import { ErrorState, SkeletonGrid } from '../../components/common/LoadingSpinner';
import { DashboardStats } from '../../components/dashboard/DashboardStats';
import { RevenueExpenseChart } from '../../components/dashboard/RevenueExpenseChart';
import { ExpenseBreakdownChart } from '../../components/dashboard/ExpenseBreakdownChart';
import { StoreRanking } from '../../components/dashboard/StorePerformanceChart';
import { RecentTransactions } from '../../components/dashboard/RecentTransactions';
import { TopExpenses } from '../../components/dashboard/TopExpenses';
import { useStoreContext } from '../../hooks/usePermissions';

const RANGES = [
  { id: '7d', label: '7 days', groupBy: 'day' },
  { id: '30d', label: '30 days', groupBy: 'day' },
  { id: '3m', label: '3 months', groupBy: 'week' },
  { id: '6m', label: '6 months', groupBy: 'month' },
  { id: 'ytd', label: 'This year', groupBy: 'month' },
];

function customGroupBy(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) return 'day';
  const days = Math.round((new Date(`${endDate}T00:00:00`).getTime() - new Date(`${startDate}T00:00:00`).getTime()) / 86400000);
  if (days > 180) return 'month';
  if (days > 45) return 'week';
  return 'day';
}

export default function Dashboard() {
  const [range, setRange] = useState('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { selectedStoreId } = useStoreContext();
  const isCustom = range === 'custom' && Boolean(startDate && endDate);
  const selectedRange = RANGES.find((item) => item.id === range);
  const groupBy = isCustom ? customGroupBy(startDate, endDate) : selectedRange?.groupBy || 'day';
  const query = useMemo(
    () => ({
      range: isCustom ? 'custom' : range === 'custom' ? '30d' : range,
      groupBy,
      storeId: selectedStoreId || undefined,
      startDate: isCustom ? startDate : undefined,
      endDate: isCustom ? endDate : undefined,
    }),
    [endDate, groupBy, isCustom, range, selectedStoreId, startDate]
  );
  const { data, isLoading, isError } = useGetOverviewQuery(query);
  const overview = data?.data;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Live multi-store performance for Smash & Stack."
        actions={
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <div className="flex flex-wrap gap-2">
              {RANGES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setRange(item.id);
                    setStartDate('');
                    setEndDate('');
                  }}
                  className={`rounded-full px-3 py-2 text-sm font-normal ${
                    range === item.id ? 'bg-brand-red text-white' : 'border-2 border-brand-blue bg-white text-brand-blue'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(next) => {
                setStartDate(next.startDate || '');
                setEndDate(next.endDate || '');
                if (next.startDate && next.endDate) setRange('custom');
              }}
            />
          </div>
        }
      />

      {isLoading ? <SkeletonGrid count={5} /> : null}
      {isError ? <ErrorState message="Dashboard analytics could not be loaded." /> : null}

      {overview ? (
        <div className="space-y-5">
          <DashboardStats summary={overview.summary} />
          <div className="grid gap-5 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <RevenueExpenseChart data={overview.revenueVsExpense} groupBy={overview.range?.groupBy || groupBy} />
            </div>
            <ExpenseBreakdownChart data={overview.expenseBreakdown} />
          </div>
          <div className="grid gap-5 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <RecentTransactions rows={overview.recentTransactions} />
            </div>
            <div className="space-y-5">
              <StoreRanking data={overview.storePerformance} />
              <TopExpenses rows={overview.topExpenses} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
