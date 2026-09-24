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
  }),
});

export const { useLoginMutation, useLogoutMutation, useMeQuery } = authApi;
