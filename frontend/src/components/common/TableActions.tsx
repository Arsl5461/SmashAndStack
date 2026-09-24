import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { cn } from '../../utils/cn';

const iconButton =
  'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white transition hover:bg-slate-50';

export function EditAction({ to, onClick, label = 'Edit' }: { to?: string; onClick?: () => void; label?: string }) {
  const className = cn(iconButton, 'text-slate-600 hover:border-slate-300 hover:text-ink-900');
  if (to) {
    return (
      <Link to={to} className={className} title={label} aria-label={label}>
        <Pencil className="h-4 w-4" />
      </Link>
    );
  }
  return (
    <button type="button" className={className} onClick={onClick} title={label} aria-label={label}>
      <Pencil className="h-4 w-4" />
    </button>
  );
}

export function ViewAction({ onClick, label = 'View' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      className={cn(iconButton, 'text-sky-700 hover:border-sky-200 hover:bg-sky-50')}
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      <Eye className="h-4 w-4" />
    </button>
  );
}

export function DeleteAction({ onClick, label = 'Delete' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      className={cn(iconButton, 'text-rose-600 hover:border-rose-200 hover:bg-rose-50')}
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

export function TableActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-1.5">{children}</div>;
}
