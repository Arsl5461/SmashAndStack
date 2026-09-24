import { toast } from 'sonner';
import { formatCurrencyExact } from './cn';

export type StatementCategory = {
  name: string;
  amount: number;
  percentOfExpenses: number;
  percentOfSales: number;
  count: number;
  items: Array<{
    date: string;
    payee: string;
    paymentMethod: string;
    description: string;
    amount: number;
    percentOfSales: number;
  }>;
};

export type IncomeExpenseStatement = {
  start: string;
  end: string;
  totalSales: number;
  totalExpenses: number;
  operatingProfit: number;
  profitMargin: number;
  expenseCount: number;
  ratios: {
    foodCost: number;
    payroll: number;
    primeCost: number;
    rentUtilities: number;
    foodCostAmount: number;
    payrollAmount: number;
    primeCostAmount: number;
    rentUtilitiesAmount: number;
  };
  revenueSources: Array<{ name: string; amount: number; percentOfSales: number; count: number }>;
  expenseCategories: StatementCategory[];
  expenseMethods: Array<{ name: string; amount: number; percentOfExpenses: number; count: number }>;
};

function escapeXml(value: string | number) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function money(value: number) {
  return formatCurrencyExact(value || 0);
}

function pct(value: number) {
  return `${(value || 0).toFixed(2)}%`;
}

function statementDate(value?: string | Date) {
  if (!value) return '—';
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}/${date.getFullYear()}`;
}

function longDate(value?: string | Date) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function tableRows(rows: Array<Array<string | number>>, options?: { total?: boolean }) {
  return rows
    .map((row, index) => {
      const isTotal = Boolean(options?.total && index === rows.length - 1);
      return `<tr class="${isTotal ? 'total' : index % 2 ? 'alt' : ''}">${row
        .map((cell, cellIndex) => `<td class="${cellIndex ? 'num' : ''}">${escapeXml(cell)}</td>`)
        .join('')}</tr>`;
    })
    .join('');
}

export function exportIncomeExpenseStatementPdf(statement: IncomeExpenseStatement, storeLabel: string) {
  const period = `${longDate(statement.start)} - ${longDate(statement.end)}`;
  const revenueRows = [
    ...statement.revenueSources.map((row) => [row.name, money(row.amount), pct(row.percentOfSales)]),
    ['TOTAL SALES', money(statement.totalSales), '100.00%'],
  ];
  const expenseSummaryRows = [
    ...statement.expenseCategories.map((row) => [row.name, money(row.amount), pct(row.percentOfSales)]),
    ['TOTAL EXPENSES', money(statement.totalExpenses), pct(statement.totalSales ? (statement.totalExpenses / statement.totalSales) * 100 : 0)],
  ];
  const analysisRows = [
    ...statement.expenseCategories.map((row) => [
      row.name,
      money(row.amount),
      pct(row.percentOfExpenses),
      pct(row.percentOfSales),
      row.count,
    ]),
    ['TOTAL', money(statement.totalExpenses), '100.00%', pct(statement.totalSales ? (statement.totalExpenses / statement.totalSales) * 100 : 0), statement.expenseCount],
  ];
  const methodRows = [
    ...statement.expenseMethods.map((row) => [row.name, money(row.amount), pct(row.percentOfExpenses), row.count]),
    ['TOTAL', money(statement.totalExpenses), '100.00%', statement.expenseCount],
  ];

  const schedule = statement.expenseCategories
    .map(
      (category) => `
        <section class="block">
          <div class="category-bar">
            <strong>${escapeXml(category.name.toUpperCase())}</strong>
            <span>Subtotal: ${escapeXml(money(category.amount))} | ${escapeXml(pct(category.percentOfSales))} of sales</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Vendor / Payee</th>
                <th>Payment Method</th>
                <th>Description / Notes</th>
                <th class="num">Amount</th>
                <th class="num">% Sales</th>
              </tr>
            </thead>
            <tbody>
              ${category.items
                .map(
                  (item, index) => `
                    <tr class="${index % 2 ? 'alt' : ''}">
                      <td>${escapeXml(statementDate(item.date))}</td>
                      <td>${escapeXml(item.payee)}</td>
                      <td>${escapeXml(item.paymentMethod)}</td>
                      <td>${escapeXml(item.description || '—')}</td>
                      <td class="num">${escapeXml(money(item.amount))}</td>
                      <td class="num">${escapeXml(pct(item.percentOfSales))}</td>
                    </tr>
                  `
                )
                .join('')}
              <tr class="total">
                <td colspan="4">${escapeXml(category.name)} subtotal</td>
                <td class="num">${escapeXml(money(category.amount))}</td>
                <td class="num">${escapeXml(pct(category.percentOfSales))}</td>
              </tr>
            </tbody>
          </table>
        </section>
      `
    )
    .join('');

  const popup = window.open('', '_blank', 'width=1100,height=800');
  if (!popup) {
    toast.error('Allow popups to export PDF');
    return;
  }

  popup.document.write(`
    <html>
      <head>
        <title>Income & Expense Statement | ${escapeXml(period)}</title>
        <style>
          @page { size: letter; margin: 0.55in 0.5in 0.7in; }
          * { box-sizing: border-box; }
          body { font-family: "Segoe UI", Arial, sans-serif; color: #2F6BFF; margin: 0; }
          .header { background: #E31B23; color: #fff; padding: 18px 20px 16px; }
          .header p { margin: 0; }
          .brand { font-size: 22px; font-weight: 800; letter-spacing: 0.04em; }
          .title { margin-top: 4px; font-size: 13px; color: #d1d5db; }
          .badge { display: inline-block; margin-top: 8px; font-size: 10px; letter-spacing: 0.14em; font-weight: 700; color: #FDE68A; }
          .page { page-break-after: always; padding: 0 4px 24px; }
          .page:last-child { page-break-after: auto; }
          h2 { font-size: 16px; margin: 18px 0 6px; }
          .lede { color: #6b7280; font-size: 12px; margin: 0 0 14px; }
          .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
          .kpi { border: 1px solid #e5e7eb; padding: 12px; }
          .kpi span { display: block; font-size: 10px; letter-spacing: 0.08em; color: #6b7280; font-weight: 700; }
          .kpi strong { display: block; margin-top: 6px; font-size: 20px; }
          .ratios { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 12px 0 16px; }
          .ratio { background: #2F6BFF; color: #fff; padding: 10px 12px; }
          .ratio span { display: block; font-size: 10px; letter-spacing: 0.08em; color: #d1d5db; }
          .ratio strong { display: block; margin-top: 4px; font-size: 18px; }
          .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { background: #2F6BFF; color: #fff; text-align: left; padding: 7px 8px; font-size: 10px; letter-spacing: 0.04em; }
          td { border-bottom: 1px solid #e5e7eb; padding: 6px 8px; }
          .alt td { background: #f8fafc; }
          .total td { font-weight: 700; background: #f3f4f6; }
          .num { text-align: right; white-space: nowrap; }
          .result { margin-top: 14px; background: #2F6BFF; color: #fff; padding: 10px 12px; font-size: 12px; display: flex; justify-content: space-between; gap: 12px; }
          .note { font-size: 10px; color: #6b7280; line-height: 1.45; margin-top: 12px; }
          .category-bar { display: flex; justify-content: space-between; gap: 12px; background: #2F6BFF; color: #fff; padding: 8px 10px; font-size: 11px; margin-top: 14px; }
          .block { break-inside: avoid; }
          .footer { position: running(footer); }
          @media print {
            .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            th, .ratio, .result, .category-bar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <section class="page">
          <header class="header">
            <p class="brand">SMASH & STACK</p>
            <p class="title">Income &amp; Expense Statement | ${escapeXml(period)}</p>
            <p class="badge">MANAGEMENT FINANCIAL STATEMENT</p>
          </header>
          <h2>Executive Financial Summary</h2>
          <p class="lede">${escapeXml(storeLabel)} · Prepared from recorded sales and expenses in this period.</p>
          <div class="kpis">
            <div class="kpi"><span>TOTAL SALES</span><strong>${escapeXml(money(statement.totalSales))}</strong></div>
            <div class="kpi"><span>TOTAL EXPENSES</span><strong>${escapeXml(money(statement.totalExpenses))}</strong></div>
            <div class="kpi"><span>ESTIMATED OPERATING PROFIT</span><strong>${escapeXml(money(statement.operatingProfit))}</strong></div>
            <div class="kpi"><span>ESTIMATED PROFIT MARGIN</span><strong>${escapeXml(pct(statement.profitMargin))}</strong></div>
          </div>
          <div class="ratios">
            <div class="ratio"><span>FOOD COST</span><strong>${escapeXml(pct(statement.ratios.foodCost))}</strong></div>
            <div class="ratio"><span>PAYROLL</span><strong>${escapeXml(pct(statement.ratios.payroll))}</strong></div>
            <div class="ratio"><span>PRIME COST</span><strong>${escapeXml(pct(statement.ratios.primeCost))}</strong></div>
            <div class="ratio"><span>RENT &amp; UTILITIES</span><strong>${escapeXml(pct(statement.ratios.rentUtilities))}</strong></div>
          </div>
          <div class="cols">
            <div>
              <h2>Revenue Summary</h2>
              <table>
                <thead><tr><th>Revenue Source</th><th class="num">Amount</th><th class="num">% of Sales</th></tr></thead>
                <tbody>${tableRows(revenueRows, { total: true })}</tbody>
              </table>
            </div>
            <div>
              <h2>Expense Summary</h2>
              <table>
                <thead><tr><th>Expense Category</th><th class="num">Amount</th><th class="num">% of Sales</th></tr></thead>
                <tbody>${tableRows(expenseSummaryRows, { total: true })}</tbody>
              </table>
            </div>
          </div>
          <div class="result">
            <span>Total Sales ${escapeXml(money(statement.totalSales))}</span>
            <span>Less: Total Expenses (${escapeXml(money(statement.totalExpenses))})</span>
            <span>Estimated Operating Profit ${escapeXml(money(statement.operatingProfit))}</span>
          </div>
          <p class="note">Statement basis: Sales are shown as gross receipts by payment method. Expense categories and payment methods come from recorded expenses. Prime cost is food cost plus payroll when those categories exist. This is an internal operating statement and may require accountant adjustments for sales tax, accrual timing, depreciation, owner draws, refunds, chargebacks, or outstanding deposits.</p>
        </section>

        <section class="page">
          <header class="header">
            <p class="brand">SMASH & STACK</p>
            <p class="title">Income &amp; Expense Statement | ${escapeXml(period)}</p>
            <p class="badge">MANAGEMENT FINANCIAL STATEMENT</p>
          </header>
          <h2>Expense Analysis</h2>
          <p class="lede">Category totals, payment-method totals, and counts for this reporting period.</p>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th class="num">Amount</th>
                <th class="num">% Expenses</th>
                <th class="num">% Sales</th>
                <th class="num">Count</th>
              </tr>
            </thead>
            <tbody>${tableRows(analysisRows, { total: true })}</tbody>
          </table>
          <h2>Expense Payments by Method</h2>
          <table>
            <thead>
              <tr>
                <th>Payment Method</th>
                <th class="num">Amount</th>
                <th class="num">% Expenses</th>
                <th class="num">Count</th>
              </tr>
            </thead>
            <tbody>${tableRows(methodRows, { total: true })}</tbody>
          </table>
          <p class="note">Prime cost (food cost plus payroll) equals ${escapeXml(money(statement.ratios.primeCostAmount))}, or ${escapeXml(pct(statement.ratios.primeCost))} of sales. After all listed expenses, estimated operating profit is ${escapeXml(money(statement.operatingProfit))} (${escapeXml(pct(statement.profitMargin))} of sales).</p>
        </section>

        <section class="page">
          <header class="header">
            <p class="brand">SMASH & STACK</p>
            <p class="title">Income &amp; Expense Statement | ${escapeXml(period)}</p>
            <p class="badge">MANAGEMENT FINANCIAL STATEMENT</p>
          </header>
          <h2>Detailed Expense Schedule</h2>
          <p class="lede">All ${statement.expenseCount} expenses, grouped by category. Percentages are calculated against total sales of ${escapeXml(money(statement.totalSales))}.</p>
          ${schedule || '<p class="note">No expenses recorded for this period.</p>'}
          <p class="note">Management note: This statement is prepared from figures in the Smash & Stack platform. It is an internal operating statement and may require accountant adjustments.</p>
        </section>
        <script>window.onload = function () { window.print(); }<\/script>
      </body>
    </html>
  `);
  popup.document.close();
  toast.success('Use the print dialog to save as PDF');
}
