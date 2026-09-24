import { useEffect } from 'react';
import { ChevronDown, Store } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedStore } from '../../features/auth/storeContextSlice';
import { api } from '../../api/axios';
import { useStoreContext } from '../../hooks/usePermissions';
import { Pulse } from '../common/LoadingSpinner';
import type { RootState } from '../../app/store';

export function StoreSelector() {
  const dispatch = useDispatch();
  const { selectedStoreId, stores, storesLoaded } = useStoreContext();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!storesLoaded || !selectedStoreId) return;
    const stillExists = stores.some((store) => store._id === selectedStoreId);
    if (!stillExists) {
      dispatch(setSelectedStore(null));
      dispatch(api.util.invalidateTags(['Dashboard', 'Sale', 'Expense', 'Report']));
    }
  }, [dispatch, selectedStoreId, stores, storesLoaded]);

  return (
    <label className="relative flex h-[46px] min-w-[240px] items-center gap-2 rounded-md border border-white/20 bg-white px-3 text-ink-900">
      <Store className="h-4 w-4 shrink-0 text-brand-red" />
      {!storesLoaded ? (
        <Pulse className="h-3.5 w-36" />
      ) : (
        <select
          className="w-full appearance-none bg-transparent pr-6 text-sm font-normal text-ink-900 outline-none"
          value={selectedStoreId || ''}
          onChange={(event) => {
            dispatch(setSelectedStore(event.target.value || null));
            dispatch(api.util.invalidateTags(['Dashboard', 'Sale', 'Expense', 'Report']));
          }}
        >
          <option value="">{user?.isSuperAdmin ? 'All Stores' : 'All assigned stores'}</option>
          {stores.map((store) => (
            <option key={store._id} value={store._id}>
              {store.name}
            </option>
          ))}
        </select>
      )}
      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-brand-blue" />
    </label>
  );
}
