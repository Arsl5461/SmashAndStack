import { Sidebar } from './Sidebar';

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button className="absolute inset-0 bg-ink-900/60" onClick={onClose} type="button" aria-label="Close menu" />
      <div className="relative z-10 h-full w-[280px] overflow-hidden">
        <div className="lg:flex! block h-full">
          <div className="flex h-full">
            <Sidebar collapsed={false} onToggle={onClose} mobile />
          </div>
        </div>
      </div>
    </div>
  );
}
