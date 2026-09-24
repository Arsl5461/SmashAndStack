import { lazy, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AuthLayout } from '../layouts/AuthLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PermissionRoute, SuperAdminRoute } from './PermissionRoute';
import { useMeQuery } from '../api/authApi';
import { setCredentials, setInitialized } from '../features/auth/authSlice';
import { endSession } from '../features/auth/session';
import type { RootState } from '../app/store';
import { PERMISSIONS } from '../constants/permissions';

import Login from '../pages/Auth/Login';
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const StoresList = lazy(() => import('../pages/Stores/StoresList'));
const AddStore = lazy(() => import('../pages/Stores/AddStore'));
const EditStore = lazy(() => import('../pages/Stores/EditStore'));
const StoreDetails = lazy(() => import('../pages/Stores/StoreDetails'));
const Sales = lazy(() => import('../pages/Sales/Sales'));
const Expenses = lazy(() => import('../pages/Expenses/Expenses'));
const ExpenseCategories = lazy(() => import('../pages/Expenses/ExpenseCategories'));
const PaymentMethods = lazy(() => import('../pages/Settings/PaymentMethods'));
const ProfitLoss = lazy(() => import('../pages/ProfitLoss/ProfitLoss'));
const Users = lazy(() => import('../pages/Users/Users'));
const Roles = lazy(() => import('../pages/Roles/Roles'));
const Reports = lazy(() => import('../pages/Reports/Reports'));
const TenderTypes = lazy(() => import('../pages/Reports/TenderTypes'));
const Settings = lazy(() => import('../pages/Settings/Settings'));

export function AppRoutes() {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const { data, isError } = useMeQuery(token || '', {
    skip: !token,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (data?.data && token) {
      dispatch(setCredentials({ user: data.data, accessToken: token }));
    } else if (isError) {
      endSession(dispatch);
    } else if (!token) {
      dispatch(setInitialized());
    }
  }, [data, token, isError, dispatch]);

  return (
    <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stores" element={<StoresList />} />
            <Route element={<PermissionRoute permission={PERMISSIONS.STORES_CREATE} />}>
              <Route path="/stores/new" element={<AddStore />} />
            </Route>
            <Route path="/stores/:id" element={<StoreDetails />} />
            <Route element={<PermissionRoute permission={PERMISSIONS.STORES_UPDATE} />}>
              <Route path="/stores/:id/edit" element={<EditStore />} />
            </Route>
            <Route path="/sales" element={<Sales />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/expense-categories" element={<ExpenseCategories />} />
            <Route path="/payment-methods" element={<PaymentMethods />} />
            <Route path="/profit-loss" element={<ProfitLoss />} />
            <Route element={<SuperAdminRoute />}>
              <Route path="/users" element={<Users />} />
              <Route path="/roles" element={<Roles />} />
            </Route>
            <Route path="/reports" element={<Reports />} />
            <Route path="/tender-types" element={<TenderTypes />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}
