import { api } from './axios';
import type { ApiSuccess } from '../types';

export const storesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStores: builder.query<ApiSuccess<{ items: any[]; counts: any }>, Record<string, unknown> | void>({
      query: (params) => ({ url: '/stores', params: params || {} }),
      providesTags: ['Store'],
    }),
    getStore: builder.query<ApiSuccess<any>, string>({
      query: (id) => ({ url: `/stores/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'Store', id }],
    }),
    createStore: builder.mutation<ApiSuccess<any>, Record<string, unknown>>({
      query: (data) => ({ url: '/stores', method: 'POST', data }),
      invalidatesTags: ['Store', 'Dashboard'],
    }),
    updateStore: builder.mutation<ApiSuccess<any>, { id: string; data: Record<string, unknown> }>({
      query: ({ id, data }) => ({ url: `/stores/${id}`, method: 'PATCH', data }),
      invalidatesTags: ['Store', 'Dashboard'],
    }),
    updateStoreStatus: builder.mutation<ApiSuccess<any>, { id: string; status: string }>({
      query: ({ id, status }) => ({ url: `/stores/${id}/status`, method: 'PATCH', data: { status } }),
      invalidatesTags: ['Store', 'Dashboard'],
    }),
    deleteStore: builder.mutation<ApiSuccess<any>, string>({
      query: (id) => ({ url: `/stores/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Store', 'Dashboard'],
    }),
    bulkDeleteStores: builder.mutation<ApiSuccess<any>, string[]>({
      query: (ids) => ({ url: '/stores/bulk-delete', method: 'POST', data: { ids } }),
      invalidatesTags: ['Store', 'Dashboard'],
    }),
    getStoreUsers: builder.query<ApiSuccess<any[]>, string>({
      query: (id) => ({ url: `/stores/${id}/users` }),
    }),
  }),
});

export const {
  useGetStoresQuery,
  useGetStoreQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useUpdateStoreStatusMutation,
  useDeleteStoreMutation,
  useBulkDeleteStoresMutation,
  useGetStoreUsersQuery,
} = storesApi;
