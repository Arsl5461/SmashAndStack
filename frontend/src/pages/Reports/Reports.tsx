import { useMemo, useState } from 'react';
import { FileDown } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DateRangePicker } from '../../components/common/DateRangePicker';
import { InlineSpinner, LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useGetIncomeExpenseStatementQuery, useGetOverviewQuery, useGetTenderTypesQuery } from '../../api/dashboardApi';
import { useStoreContext } from '../../hooks/usePermissions';
import { formatCurrency } from '../../utils/cn';
import { exportIncomeExpenseStatementPdf, type IncomeExpenseStatement } from '../../utils/statementPdf';
import { RevenueExpenseChart } from '../../components/dashboard/RevenueExpenseChart';
import { ExpenseBreakdownChart } from '../../components/dashboard/ExpenseBreakdownChart';
import { StorePerformanceChart } from '../../components/dashboard/StorePerformanceChart';
import { TenderMixChart } from '../../components/dashboard/TenderMixChart';
import { currentMonth, type TenderReport } from './TenderTypesTable';

function monthBounds(month: string) {
  const [year, monthIndex] = month.split('-').map(Number);
  const lastDay = new Date(year, monthIndex, 0).getDate();
  const pad = (value: number) => String(value).padStart(2, '0');
  return {
    startDate: `${year}-${pad(monthIndex)}-01`,
    endDate: `${year}-${pad(monthIndex)}-${pad(lastDay)}`,
  };
}

function periodLabel(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
}

export default function Reports() {
  const defaults = monthBounds(currentMonth());
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const { selectedStoreId, stores } = useStoreContext();
  const storeId = selectedStoreId || undefined;
  const rangeQuery = useMemo(
    () => ({
      range: 'custom',
      startDate,
      endDate,
      groupBy: 'day',
      storeId,
    }),
    [endDate, startDate, storeId]
  );

  const overviewQuery = useGetOverviewQuery(rangeQuery);
  const tenderQuery = useGetTenderTypesQuery({ startDate, endDate, storeId });
  const statementQuery = useGetIncomeExpenseStatementQuery({ startDate, endDate, storeId });
  const overview = overviewQuery.data?.data;
  const tender = tenderQuery.data?.data as TenderReport | undefined;
  const statement = statementQuery.data?.data as IncomeExpenseStatement | undefined;
  const storeName = stores.find((store) => store._id === selectedStoreId)?.name || 'All Stores';
  const isLoading = overviewQuery.isLoading || statementQuery.isLoading;

  const exportPdf = () => {
    if (!statement) return;
    exportIncomeExpenseStatementPdf(statement, storeName);
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle={`Income & expense statement for ${periodLabel(startDate, endDate)}.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(next) => {
                if (next.startDate) setStartDate(next.startDate);
                if (next.endDate) setEndDate(next.endDate);
              }}
            />
            <button className="btn-primary" type="button" disabled={!statement} onClick={exportPdf}>
              <FileDown className="h-4 w-4" />
              Export to PDF
            </button>
          </div>
        }
      />

      {isLoading ? <LoadingSpinner /> : null}

      {overview ? (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ['Total Sales', statement?.totalSales ?? overview.summary.totalRevenue],
              ['Total Expenses', statement?.totalExpenses ?? overview.summary.totalExpenses],
              ['Operating Profit', statement?.operatingProfit ?? overview.summary.netProfit],
              ['Profit Margin', `${(statement?.profitMargin ?? overview.summary.profitMargin).toFixed(2)}%`],
            ].map(([label, value]) => (
              <div key={label} className="card p-5">
                <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-normal">
                  {typeof value === 'number' ? formatCurrency(value) : value}
                </p>
              </div>
            ))}
          </div>

          <RevenueExpenseChart data={overview.revenueVsExpense || []} groupBy="day" />

          <div className="grid gap-5 xl:grid-cols-2">
            <TenderMixChart rows={tender?.rows || []} />
            <ExpenseBreakdownChart data={overview.expenseBreakdown || []} />
          </div>

          <StorePerformanceChart data={overview.storePerformance || []} />
        </div>
      ) : null}

      {(overviewQuery.isFetching || statementQuery.isFetching) && overview ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <InlineSpinner />
          Updating report...
        </div>
      ) : null}
    </div>
  );
}
