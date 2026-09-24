import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import storeContextReducer from '../features/auth/storeContextSlice';
import { api } from '../api/axios';

export const rootReducer = combineReducers({
  auth: authReducer,
  storeContext: storeContextReducer,
  [api.reducerPath]: api.reducer,
});
