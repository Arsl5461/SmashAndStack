import type { AuthUser } from '../../types';
import type { AppDispatch } from '../../app/store';
import { api } from '../../api/axios';
import { logout, setCredentials } from './authSlice';
import { setSelectedStore } from './storeContextSlice';

function storeId(value: unknown) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value && '_id' in value) return String((value as { _id: string })._id);
  return String(value);
}

export function resolveSelectedStore(user: AuthUser, current?: string | null) {
  const assigned = (user.stores || []).map((store) => store._id);
  if (user.isSuperAdmin) return current || null;
  if (current && assigned.includes(current)) return current;
  const fallback = storeId(user.defaultStore);
  if (fallback && assigned.includes(fallback)) return fallback;
  if (assigned.length === 1) return assigned[0];
  return null;
}

export function startSession(dispatch: AppDispatch, user: AuthUser, accessToken: string) {
  dispatch(api.util.resetApiState());
  dispatch(setCredentials({ user, accessToken }));
  dispatch(setSelectedStore(resolveSelectedStore(user, localStorage.getItem('sns_store_id'))));
}

export function endSession(dispatch: AppDispatch) {
  dispatch(logout());
  dispatch(setSelectedStore(null));
  dispatch(api.util.resetApiState());
}
