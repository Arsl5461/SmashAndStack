import { api } from './axios';

export const saleCategoriesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSaleCategories: builder.query({
      query: (params: Record<string, unknown> = {}) => ({ url: '/sale-categories', params }),
      providesTags: ['SaleCategory'],
    }),
    createSaleCategory: builder.mutation({
      query: (data: Record<string, unknown>) => ({ url: '/sale-categories', method: 'POST', data }),
      invalidatesTags: ['SaleCategory'],
    }),
    updateSaleCategory: builder.mutation({
      query: ({ id, data }: { id: string; data: Record<string, unknown> }) => ({
        url: `/sale-categories/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['SaleCategory'],
    }),
    deleteSaleCategory: builder.mutation({
      query: (id: string) => ({ url: `/sale-categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['SaleCategory'],
    }),
    bulkDeleteSaleCategories: builder.mutation({
      query: (ids: string[]) => ({ url: '/sale-categories/bulk-delete', method: 'POST', data: { ids } }),
      invalidatesTags: ['SaleCategory'],
    }),
  }),
});

export const {
  useGetSaleCategoriesQuery,
  useCreateSaleCategoryMutation,
  useUpdateSaleCategoryMutation,
  useDeleteSaleCategoryMutation,
  useBulkDeleteSaleCategoriesMutation,
} = saleCategoriesApi;
