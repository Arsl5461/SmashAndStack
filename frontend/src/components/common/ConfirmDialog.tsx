import { useState } from 'react';
import { InlineSpinner } from './LoadingSpinner';

export function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
      <div className="card w-full max-w-md p-6">
        <h3 className="text-2xl font-normal tracking-tight text-brand-red">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose} type="button" disabled={loading}>
            Cancel
          </button>
          <button
            className="btn-primary"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                await onConfirm();
              } finally {
                setLoading(false);
              }
            }}
            type="button"
          >
            {loading ? (
              <>
                <InlineSpinner className="border-white/30 border-t-white" />
                Working...
              </>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
