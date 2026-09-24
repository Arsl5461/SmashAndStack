import { useState } from 'react';
import { FileDown } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useGetTenderTypesQuery } from '../../api/dashboardApi';
import { useStoreContext } from '../../hooks/usePermissions';
import { formatCurrencyExact, formatDate } from '../../utils/cn';
import { exportMonthlyReportPdf } from '../../utils/export';
import { currentMonth, monthLabel, TenderTypesTable, type TenderReport } from './TenderTypesTable';

export default function TenderTypes() {
  const [month, setMonth] = useState(currentMonth);
  const { selectedStoreId, stores } = useStoreContext();
  const { data, isLoading } = useGetTenderTypesQuery({
    month,
    storeId: selectedStoreId || undefined,
  });
  const report = data?.data as TenderReport | undefined;
  const storeName = stores.find((store) => store._id === selectedStoreId)?.name || 'All Stores';

  const exportPdf = () => {
    if (!report) return;
    exportMonthlyReportPdf({
      title: `Tender Types — ${monthLabel(month)}`,
      subtitle: 'Sales, refunds, and amount collected by payment method.',
      storeLabel: storeName,
      generatedAt: `Generated ${formatDate(new Date())}`,
      columns: ['Tender Types', 'Sales Total', 'Refund Total', 'Amount Collected'],
      rows: [
        ...report.rows.map((row) => [
          row.tenderType,
          formatCurrencyExact(row.salesTotal),
          formatCurrencyExact(row.refundTotal),
          formatCurrencyExact(row.amountCollected),
        ]),
        [
          'Total',
          formatCurrencyExact(report.totals.salesTotal),
          formatCurrencyExact(report.totals.refundTotal),
          formatCurrencyExact(report.totals.amountCollected),
        ],
      ],
    });
  };

  return (
    <div>
      <PageHeader
        title="Tender Types"
        subtitle={`Payment totals for ${monthLabel(month)}.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
              Month
              <input
                className="bg-transparent outline-none"
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
              />
            </label>
            <button className="btn-primary" type="button" disabled={!report} onClick={exportPdf}>
              <FileDown className="h-4 w-4" />
              Export to PDF
            </button>
          </div>
        }
      />

      {isLoading ? <LoadingSpinner /> : null}
      {report ? <TenderTypesTable report={report} /> : null}
    </div>
  );
}
