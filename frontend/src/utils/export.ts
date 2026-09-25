import { toast } from 'sonner';

export interface ExportColumn<T> {
  header: string;
  value: (row: T) => string | number;
}

function toMatrix<T>(columns: ExportColumn<T>[], rows: T[]) {
  return {
    headers: columns.map((column) => column.header),
    data: rows.map((row) => columns.map((column) => column.value(row))),
  };
}

function download(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeXml(value: string | number) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function exportToExcel<T>(fileName: string, columns: ExportColumn<T>[], rows: T[]) {
  if (!rows.length) {
    toast.error('Nothing to export');
    return;
  }

  const { headers, data } = toMatrix(columns, rows);
  const headerRow = `<tr>${headers.map((header) => `<th>${escapeXml(header)}</th>`).join('')}</tr>`;
  const bodyRows = data
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeXml(cell)}</td>`).join('')}</tr>`)
    .join('');
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8" /></head><body><table>${headerRow}${bodyRows}</table></body></html>`;
  download(
    `${fileName}.xls`,
    new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
  );
  toast.success('Excel file downloaded');
}

export function exportToPdf<T>(
  fileName: string,
  title: string,
  columns: ExportColumn<T>[],
  rows: T[],
  options?: { subtitle?: string }
) {
  if (!rows.length) {
    toast.error('Nothing to export');
    return;
  }

  const { headers, data } = toMatrix(columns, rows);
  printHtmlDocument(fileName, `
    <h1>${escapeXml(title)}</h1>
    ${options?.subtitle ? `<p class="subtitle">${escapeXml(options.subtitle)}</p>` : ''}
    <table>
      <thead><tr>${headers.map((header) => `<th>${escapeXml(header)}</th>`).join('')}</tr></thead>
      <tbody>
        ${data.map((row) => `<tr>${row.map((cell) => `<td>${escapeXml(cell)}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  `);
}

function renderPdfTable(columns: string[], rows: Array<Array<string | number>>) {
  return `
    <table>
      <thead>
        <tr>${columns.map((header, index) => `<th class="${index ? 'num' : ''}">${escapeXml(header)}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows
          .map((row, rowIndex) => {
            const isTotal = rowIndex === rows.length - 1 && String(row[0]).toLowerCase() === 'total';
            return `<tr class="${isTotal ? 'total' : rowIndex % 2 ? 'alt' : ''}">${row
              .map((cell, index) => `<td class="${index ? 'num' : ''}">${escapeXml(cell)}</td>`)
              .join('')}</tr>`;
          })
          .join('')}
      </tbody>
    </table>
  `;
}

export function exportMonthlyReportPdf({
  title,
  subtitle,
  storeLabel,
  generatedAt,
  summary,
  columns,
  rows,
  sections,
}: {
  title: string;
  subtitle?: string;
  storeLabel?: string;
  generatedAt?: string;
  summary?: Array<{ label: string; value: string }>;
  columns?: string[];
  rows?: Array<Array<string | number>>;
  sections?: Array<{ title: string; columns: string[]; rows: Array<Array<string | number>> }>;
}) {
  const tables = [
    ...(columns && rows?.length ? [{ title: '', columns, rows }] : []),
    ...(sections || []).filter((section) => section.rows.length),
  ];

  if (!tables.length && !summary?.length) {
    toast.error('Nothing to export');
    return;
  }

  const summaryHtml = summary?.length
    ? `<div class="summary">${summary
        .map((item) => `<div class="stat"><span>${escapeXml(item.label)}</span><strong>${escapeXml(item.value)}</strong></div>`)
        .join('')}</div>`
    : '';

  printHtmlDocument(title, `
    <p class="brand">Smash & Stack</p>
    <h1>${escapeXml(title)}</h1>
    ${subtitle ? `<p class="subtitle">${escapeXml(subtitle)}</p>` : ''}
    <p class="meta">${[storeLabel, generatedAt].filter(Boolean).map((item) => escapeXml(item as string)).join(' · ')}</p>
    ${summaryHtml}
    ${tables
      .map(
        (table) => `
          ${table.title ? `<h2>${escapeXml(table.title)}</h2>` : ''}
          ${renderPdfTable(table.columns, table.rows)}
        `
      )
      .join('')}
  `);
}

function printHtmlDocument(title: string, body: string) {
  const popup = window.open('', '_blank', 'width=1024,height=768');
  if (!popup) {
    toast.error('Allow popups to export PDF');
    return;
  }

  popup.document.write(`
    <html>
      <head>
        <title>${escapeXml(title)}</title>
        <style>
          body { font-family: Inter, Arial, sans-serif; padding: 28px; color: #141A22; }
          .brand { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #E31B23; font-weight: 700; margin: 0 0 6px; }
          h1 { font-size: 22px; margin: 0 0 6px; }
          h2 { font-size: 15px; margin: 22px 0 8px; }
          .subtitle, .meta { color: #64748b; margin: 0 0 8px; font-size: 13px; }
          .summary { display: flex; gap: 16px; margin: 18px 0; }
          .stat { flex: 1; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 12px; }
          .stat span { display: block; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }
          .stat strong { display: block; margin-top: 6px; font-size: 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
          th { background: #E31B23; color: #fff; text-align: left; padding: 8px 10px; }
          td { border-bottom: 1px solid #e5e7eb; padding: 8px 10px; }
          .alt td { background: #f8fafc; }
          .total td { font-weight: 700; background: #f1f5f9; }
          .num { text-align: right; }
        </style>
      </head>
      <body>
        ${body}
        <script>window.onload = function () { window.print(); }<\/script>
      </body>
    </html>
  `);
  popup.document.close();
  toast.success('Use the print dialog to save as PDF');
}
