import { api } from './axios';

export const paymentMethodsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentMethods: builder.query({
      query: (params: Record<string, unknown> = {}) => ({ url: '/payment-methods', params }),
      providesTags: ['PaymentMethod'],
    }),
    createPaymentMethod: builder.mutation({
      query: (data: Record<string, unknown>) => ({ url: '/payment-methods', method: 'POST', data }),
      invalidatesTags: ['PaymentMethod'],
    }),
    updatePaymentMethod: builder.mutation({
      query: ({ id, data }: { id: string; data: Record<string, unknown> }) => ({
        url: `/payment-methods/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['PaymentMethod'],
    }),
    deletePaymentMethod: builder.mutation({
      query: (id: string) => ({ url: `/payment-methods/${id}`, method: 'DELETE' }),
      invalidatesTags: ['PaymentMethod'],
    }),
    bulkDeletePaymentMethods: builder.mutation({
      query: (ids: string[]) => ({ url: '/payment-methods/bulk-delete', method: 'POST', data: { ids } }),
      invalidatesTags: ['PaymentMethod'],
    }),
  }),
});

export const {
  useGetPaymentMethodsQuery,
  useCreatePaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useBulkDeletePaymentMethodsMutation,
} = paymentMethodsApi;
