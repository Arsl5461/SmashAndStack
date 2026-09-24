import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../../types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('sns_access_token'),
  initialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: AuthUser; accessToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.initialized = true;
      localStorage.setItem('sns_access_token', action.payload.accessToken);
    },
    setInitialized: (state) => {
      state.initialized = true;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.initialized = true;
      localStorage.removeItem('sns_access_token');
    },
  },
});

export const { setCredentials, setInitialized, logout } = authSlice.actions;
export default authSlice.reducer;
