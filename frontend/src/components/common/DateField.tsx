import { useRef } from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '../../utils/cn';

function openPicker(input: HTMLInputElement | null) {
  if (!input) return;
  try {
    input.showPicker?.();
  } catch {
    input.focus();
    input.click();
  }
}

export function DateField({
  value,
  onChange,
  required = false,
  min,
  max,
  className,
  inputClassName,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  min?: string;
  max?: string;
  className?: string;
  inputClassName?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      role="group"
      className={cn('soft-input flex w-full cursor-pointer items-center gap-2 text-left', className)}
      onClick={() => openPicker(inputRef.current)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openPicker(inputRef.current);
        }
      }}
    >
      <Calendar className="pointer-events-none h-4 w-4 shrink-0 text-brand-red" />
      {label ? <span className="pointer-events-none shrink-0 text-xs font-medium text-slate-400">{label}</span> : null}
      <input
        ref={inputRef}
        className={cn('w-full cursor-pointer bg-transparent outline-none', inputClassName)}
        type="date"
        value={value}
        min={min}
        max={max}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        onClick={(event) => {
          event.stopPropagation();
          openPicker(event.currentTarget);
        }}
      />
    </div>
  );
}

export function MonthField({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      role="group"
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-surface-raised px-3 py-2 text-sm font-medium text-slate-300',
        className
      )}
      onClick={() => openPicker(inputRef.current)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openPicker(inputRef.current);
        }
      }}
    >
      <Calendar className="pointer-events-none h-4 w-4 shrink-0 text-brand-red" />
      <span className="pointer-events-none">Month</span>
      <input
        ref={inputRef}
        className="cursor-pointer bg-transparent outline-none"
        type="month"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onClick={(event) => {
          event.stopPropagation();
          openPicker(event.currentTarget);
        }}
      />
    </div>
  );
}
