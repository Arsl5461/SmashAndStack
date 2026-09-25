import { api } from './axios';
import type { ApiSuccess, AuthUser } from '../types';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiSuccess<{ user: AuthUser; accessToken: string }>, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', data: body }),
    }),
    logout: builder.mutation<ApiSuccess<Record<string, never>>, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    me: builder.query<ApiSuccess<AuthUser>, string>({
      query: () => ({ url: '/auth/me' }),
      providesTags: ['Auth'],
    }),
    forgotPassword: builder.mutation<ApiSuccess<Record<string, never>>, { email: string }>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', data: body }),
    }),
    verifyOtp: builder.mutation<ApiSuccess<{ verified: boolean }>, { email: string; otp: string }>({
      query: (body) => ({ url: '/auth/verify-otp', method: 'POST', data: body }),
    }),
    resetPassword: builder.mutation<
      ApiSuccess<Record<string, never>>,
      { email: string; otp: string; password: string }
    >({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', data: body }),
    }),
    changePassword: builder.mutation<
      ApiSuccess<Record<string, never>>,
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({ url: '/auth/change-password', method: 'POST', data: body }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
} = authApi;
