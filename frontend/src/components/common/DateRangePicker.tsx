import { Calendar } from 'lucide-react';

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
}: {
  startDate?: string;
  endDate?: string;
  onChange: (next: { startDate?: string; endDate?: string }) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface-raised px-3 py-2">
        <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="text-xs font-medium text-slate-400">From</span>
        <input
          className="bg-transparent text-sm font-medium text-ink-900 outline-none"
          type="date"
          value={startDate || ''}
          max={endDate || undefined}
          onChange={(event) => onChange({ startDate: event.target.value, endDate })}
        />
      </label>
      <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface-raised px-3 py-2">
        <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="text-xs font-medium text-slate-400">To</span>
        <input
          className="bg-transparent text-sm font-medium text-ink-900 outline-none"
          type="date"
          value={endDate || ''}
          min={startDate || undefined}
          onChange={(event) => onChange({ startDate, endDate: event.target.value })}
        />
      </label>
    </div>
  );
}
