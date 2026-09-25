import { Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StoreSelector } from './StoreSelector';
import type { RootState } from '../../app/store';
import { useLogoutMutation } from '../../api/authApi';
import { endSession } from '../../features/auth/session';
import { Pulse } from '../common/LoadingSpinner';

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'U';
}

export function Navbar({ onMenu }: { onMenu: () => void }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const [logoutRequest] = useLogoutMutation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/10 bg-surface px-4 py-3 text-ink-900 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-md border border-white/15 p-2 text-ink-800 lg:hidden"
          onClick={onMenu}
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <StoreSelector />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative" ref={menuRef}>
          {!user ? (
            <div className="flex h-[42px] min-w-[200px] items-center gap-2 rounded-md border border-white/10 px-2 py-1.5">
              <Pulse className="h-8 w-8 rounded-md bg-white/10" />
              <span className="hidden md:block">
                <Pulse className="h-3.5 w-28 bg-white/10" />
                <Pulse className="mt-1.5 h-2.5 w-16 bg-white/10" />
              </span>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="flex h-[42px] min-w-[200px] items-center gap-2 rounded-md border border-white/10 bg-surface-raised px-2 py-1.5"
                onClick={() => setOpen((value) => !value)}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-red text-xs font-medium text-white">
                  {initials(user.name)}
                </span>
                <span className="hidden min-w-0 flex-1 text-left text-sm md:block">
                  <span className="block truncate font-medium leading-4">{user.name}</span>
                  <span className="truncate text-xs text-slate-400">{user.role?.name || 'User'}</span>
                </span>
              </button>
              {open ? (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-surface-overlay p-2 text-ink-900 shadow-xl">
                  <div className="border-b border-white/10 px-3 py-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs font-normal text-slate-400">{user.role?.name}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm font-normal text-slate-300 hover:bg-white/5 hover:text-white"
                    onClick={async () => {
                      try {
                        await logoutRequest().unwrap();
                      } finally {
                        endSession(dispatch);
                      }
                    }}
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
