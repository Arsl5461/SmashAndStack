import type { DashboardOverview } from '../../types';
import { formatCurrencyExact, formatDate } from '../../utils/cn';
import { DataTable } from '../common/DataTable';

export function RecentTransactions({ rows }: { rows: DashboardOverview['recentTransactions'] }) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 text-lg font-normal">Recent Transactions</h3>
      <DataTable
        rows={rows.slice(0, 5)}
        emptyTitle="No recent transactions"
        emptyDescription="Sales and expenses will appear here as they are recorded."
        columns={[
          { key: 'id', header: 'ID', render: (row) => <span className="font-mono text-xs">{String(row.id).slice(-6)}</span> },
          { key: 'store', header: 'Store', render: (row) => row.store || '—' },
          { key: 'description', header: 'Description', render: (row) => row.description },
          { key: 'category', header: 'Category', render: (row) => row.category },
          {
            key: 'type',
            header: 'Type',
            render: (row) => (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-normal ${
                  row.type === 'INCOME' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-orange-500/15 text-orange-400'
                }`}
              >
                {row.type}
              </span>
            ),
          },
          { key: 'amount', header: 'Amount', render: (row) => formatCurrencyExact(row.amount) },
          { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
          { key: 'status', header: 'Status', render: (row) => row.status },
        ]}
      />
    </div>
  );
}
