import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '../../utils/cn';

export function KpiCard({
  label,
  value,
  growth,
  icon: Icon,
  tone = 'red',
  money = true,
}: {
  label: string;
  value: number;
  growth: number;
  icon: LucideIcon;
  tone?: 'red' | 'orange' | 'green' | 'blue' | 'yellow';
  money?: boolean;
}) {
  const positive = growth >= 0;
  const tones = {
    red: 'bg-brand-red/15 text-brand-red',
    orange: 'bg-orange-500/15 text-orange-400',
    green: 'bg-emerald-500/15 text-emerald-400',
    blue: 'bg-sky-500/15 text-sky-400',
    yellow: 'bg-amber-500/15 text-amber-400',
  };

  return (
    <article className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-medium tracking-tight text-ink-900">{money ? formatCurrency(value) : formatNumber(value)}</p>
        </div>
        <span className={cn('flex h-11 w-11 items-center justify-center rounded-lg', tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className={cn('mt-4 inline-flex items-center gap-1 text-sm font-medium', positive ? 'text-emerald-400' : 'text-rose-400')}>
        {positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        {Math.abs(growth)}%
        <span className="font-normal text-slate-500">vs previous period</span>
      </div>
    </article>
  );
}
