import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { useGetStoresQuery } from '../api/storesApi';

export function usePermissions() {
  const user = useSelector((state: RootState) => state.auth.user);

  const can = (permission: string) => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    return user.permissions.includes(permission);
  };

  return { user, can, isSuperAdmin: Boolean(user?.isSuperAdmin) };
}

export function useStoreContext() {
  const selectedStoreId = useSelector((state: RootState) => state.storeContext.selectedStoreId);
  const user = useSelector((state: RootState) => state.auth.user);
  const { data, isSuccess } = useGetStoresQuery(
    { limit: 100, sortBy: 'name', sortOrder: 'asc' },
    { skip: !user }
  );
  const stores = data?.data?.items || [];
  return { selectedStoreId, stores, storesLoaded: isSuccess };
}
