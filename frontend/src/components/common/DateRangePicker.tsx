import { DateField } from './DateField';

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
      <DateField
        label="From"
        value={startDate || ''}
        max={endDate || undefined}
        onChange={(value) => onChange({ startDate: value, endDate })}
        className="min-w-[200px] py-2"
        inputClassName="text-sm font-medium text-ink-900"
      />
      <DateField
        label="To"
        value={endDate || ''}
        min={startDate || undefined}
        onChange={(value) => onChange({ startDate, endDate: value })}
        className="min-w-[200px] py-2"
        inputClassName="text-sm font-medium text-ink-900"
      />
    </div>
  );
}
