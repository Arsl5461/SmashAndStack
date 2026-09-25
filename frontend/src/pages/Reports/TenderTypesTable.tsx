import { CircleHelp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrencyExact } from '../../utils/cn';

export type TenderRow = {
  tenderType: string;
  salesTotal: number;
  refundTotal: number;
  amountCollected: number;
};

export type TenderReport = {
  month: string;
  rows: TenderRow[];
  totals: { salesTotal: number; refundTotal: number; amountCollected: number };
};

export function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(value: string) {
  const [year, month] = value.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function Hint({ text }: { text: string }) {
  return (
    <span className="inline-flex" title={text}>
      <CircleHelp className="h-3.5 w-3.5 text-slate-400" />
    </span>
  );
}

export function TenderTypesTable({ report }: { report: TenderReport }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-surface-raised text-slate-400">
              <th className="px-5 py-3 text-left font-normal">Tender Types</th>
              <th className="px-5 py-3 text-right font-normal">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Sales Total
                  <Hint text="Gross sales recorded for this payment method in the selected month." />
                </span>
              </th>
              <th className="px-5 py-3 text-right font-normal">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Refund Total
                  <Hint text="Refunded orders for this payment method in the selected month." />
                </span>
              </th>
              <th className="px-5 py-3 text-right font-normal">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Amount Collected
                  <Hint text="Sales total minus refund total." />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {report.rows.length ? (
              report.rows.map((row, index) => (
                <tr key={row.tenderType} className={index % 2 ? 'bg-white/[0.03]' : 'bg-transparent'}>
                  <td className="px-5 py-3.5 font-medium text-ink-900">{row.tenderType}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums">{formatCurrencyExact(row.salesTotal)}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums">{formatCurrencyExact(row.refundTotal)}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums font-medium">
                    {formatCurrencyExact(row.amountCollected)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-slate-500">
                  No tender activity for this month.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/10 bg-surface-raised font-medium text-ink-900">
              <td className="px-5 py-3.5">Total</td>
              <td className="px-5 py-3.5 text-right tabular-nums">{formatCurrencyExact(report.totals.salesTotal)}</td>
              <td className="px-5 py-3.5 text-right tabular-nums">{formatCurrencyExact(report.totals.refundTotal)}</td>
              <td className="px-5 py-3.5 text-right tabular-nums">{formatCurrencyExact(report.totals.amountCollected)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="flex justify-end border-t border-white/10 px-5 py-3">
        <Link className="text-sm font-medium uppercase tracking-wide text-brand-red hover:text-brand-deep" to="/sales">
          Details
        </Link>
      </div>
    </div>
  );
}
