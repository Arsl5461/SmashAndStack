import { api } from './axios';

export const moneyBorrowedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMoneyBorrowed: builder.query({
      query: (params: Record<string, unknown>) => ({ url: '/money-borrowed', params }),
      providesTags: ['MoneyBorrowed'],
    }),
    createMoneyBorrowed: builder.mutation({
      query: (data: Record<string, unknown>) => ({ url: '/money-borrowed', method: 'POST', data }),
      invalidatesTags: ['MoneyBorrowed', 'Report'],
    }),
    updateMoneyBorrowed: builder.mutation({
      query: ({ id, data }: { id: string; data: Record<string, unknown> }) => ({
        url: `/money-borrowed/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['MoneyBorrowed', 'Report'],
    }),
    markMoneyBorrowedPaid: builder.mutation({
      query: (id: string) => ({ url: `/money-borrowed/${id}/mark-paid`, method: 'POST' }),
      invalidatesTags: ['MoneyBorrowed', 'Report'],
    }),
    deleteMoneyBorrowed: builder.mutation({
      query: (id: string) => ({ url: `/money-borrowed/${id}`, method: 'DELETE' }),
      invalidatesTags: ['MoneyBorrowed', 'Report'],
    }),
    bulkDeleteMoneyBorrowed: builder.mutation({
      query: (ids: string[]) => ({ url: '/money-borrowed/bulk-delete', method: 'POST', data: { ids } }),
      invalidatesTags: ['MoneyBorrowed', 'Report'],
    }),
  }),
});

export const {
  useGetMoneyBorrowedQuery,
  useCreateMoneyBorrowedMutation,
  useUpdateMoneyBorrowedMutation,
  useMarkMoneyBorrowedPaidMutation,
  useDeleteMoneyBorrowedMutation,
  useBulkDeleteMoneyBorrowedMutation,
} = moneyBorrowedApi;
