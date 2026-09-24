import { Search } from 'lucide-react';

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-md border border-ink-900/15 bg-white px-3 py-2.5 focus-within:border-brand-blue focus-within:ring-4 focus-within:ring-brand-blue/15">
      <Search className="h-4 w-4 shrink-0 text-slate-400" />
      <input
        className="w-full bg-transparent text-sm text-brand-blue outline-none placeholder:text-slate-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
