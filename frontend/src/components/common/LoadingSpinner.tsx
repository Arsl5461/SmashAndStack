export function InlineSpinner({ className = 'border-cream-100 border-t-brand-blue' }: { className?: string }) {
  return <span className={`inline-block h-4 w-4 animate-spin rounded-full border-2 ${className}`} />;
}

export function BusyOverlay({ show, label = 'Please wait...' }: { show: boolean; label?: string }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/35 backdrop-blur-[1px]">
      <div className="flex items-center gap-3 rounded-md bg-white px-5 py-4 shadow-xl">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-cream-100 border-t-brand-blue" />
        <p className="text-sm font-normal text-ink-900">{label}</p>
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-cream-100 border-t-brand-blue" />
    </div>
  );
}

export function Pulse({ className = '' }: { className?: string }) {
  return <span className={`block animate-pulse rounded-md bg-slate-200 ${className}`} />;
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card h-32 animate-pulse bg-slate-100" />
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
        <div className="card h-72 animate-pulse bg-slate-100 xl:col-span-2" />
        <div className="card h-72 animate-pulse bg-slate-100" />
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
    <div className="rounded-md border border-red-100 bg-red-50 px-4 py-6 text-sm text-red-700">
      {message || 'Something went wrong while loading this view.'}
    </div>
  );
}
