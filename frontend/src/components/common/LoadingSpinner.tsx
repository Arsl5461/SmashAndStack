export function InlineSpinner({ className = 'border-white/15 border-t-brand-red' }: { className?: string }) {
  return <span className={`inline-block h-4 w-4 animate-spin rounded-full border-2 ${className}`} />;
}

export function BusyOverlay({ show, label = 'Please wait...' }: { show: boolean; label?: string }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-surface-overlay px-5 py-4 shadow-xl">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-brand-red" />
        <p className="text-sm font-medium text-ink-900">{label}</p>
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-brand-red" />
    </div>
  );
}

export function Pulse({ className = '' }: { className?: string }) {
  return <span className={`block animate-pulse rounded-md bg-white/10 ${className}`} />;
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card h-32 animate-pulse bg-surface-raised" />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Pulse className="h-7 w-48" />
        <Pulse className="h-4 w-80 max-w-full" />
      </div>
      <SkeletonGrid count={4} />
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="card h-72 animate-pulse bg-surface-raised xl:col-span-2" />
        <div className="card h-72 animate-pulse bg-surface-raised" />
      </div>
    </div>
  );
}

export function SidebarNavSkeleton({ collapsed }: { collapsed: boolean }) {
  const groups = [2, 5, 3, 1];
  return (
    <div className="space-y-5">
      {groups.map((count, group) => (
        <div key={group} className="space-y-1">
          {!collapsed ? <Pulse className="mx-3 mb-2 h-2.5 w-16" /> : null}
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 rounded-md px-3 py-2.5">
              <Pulse className="h-4 w-4 shrink-0 rounded" />
              {!collapsed ? <Pulse className="h-3.5 w-28" /> : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message }: { message?: string }) {
  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-6 text-sm text-rose-300">
      {message || 'Something went wrong while loading this view.'}
    </div>
  );
}
