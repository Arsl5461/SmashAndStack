import { useState } from 'react';
import { FileDown, FileSpreadsheet, Trash2 } from 'lucide-react';
import type { ExportColumn } from '../../utils/export';
import { exportToExcel, exportToPdf } from '../../utils/export';
import { InlineSpinner } from './LoadingSpinner';

export function ListingToolbar<T>({
  title,
  fileName,
  columns,
  rows,
  selectedCount,
  onDeleteSelected,
  deleting = false,
}: {
  title: string;
  fileName: string;
  columns: ExportColumn<T>[];
  rows: T[];
  selectedCount?: number;
  onDeleteSelected?: () => void;
  deleting?: boolean;
}) {
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);

  const runExport = async (type: 'excel' | 'pdf') => {
    setExporting(type);
    await new Promise((resolve) => setTimeout(resolve, 150));
    try {
      if (type === 'excel') exportToExcel(fileName, columns, rows);
      else exportToPdf(fileName, title, columns, rows);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {onDeleteSelected ? (
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-normal text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!selectedCount || deleting}
          onClick={onDeleteSelected}
        >
          {deleting ? <InlineSpinner className="border-rose-200 border-t-rose-700" /> : <Trash2 className="h-4 w-4" />}
          {deleting ? 'Deleting...' : `Delete selected${selectedCount ? ` (${selectedCount})` : ''}`}
        </button>
      ) : null}
      <button type="button" className="btn-secondary" disabled={Boolean(exporting)} onClick={() => runExport('excel')}>
        {exporting === 'excel' ? <InlineSpinner /> : <FileSpreadsheet className="h-4 w-4" />}
        {exporting === 'excel' ? 'Exporting...' : 'Export Excel'}
      </button>
      <button type="button" className="btn-secondary" disabled={Boolean(exporting)} onClick={() => runExport('pdf')}>
        {exporting === 'pdf' ? <InlineSpinner /> : <FileDown className="h-4 w-4" />}
        {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
      </button>
    </div>
  );
}
