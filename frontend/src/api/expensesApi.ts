import { api } from './axios';

export const expensesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query({
      query: (params: Record<string, unknown>) => ({ url: '/expenses', params }),
      providesTags: ['Expense'],
    }),
    createExpense: builder.mutation({
      query: (data: FormData | Record<string, unknown>) => ({ url: '/expenses', method: 'POST', data }),
      invalidatesTags: ['Expense', 'Dashboard', 'Report'],
    }),
    updateExpense: builder.mutation({
      query: ({ id, data }: { id: string; data: Record<string, unknown> }) => ({
        url: `/expenses/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['Expense', 'Dashboard', 'Report'],
    }),
    deleteExpense: builder.mutation({
      query: (id: string) => ({ url: `/expenses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Expense', 'Dashboard', 'Report'],
    }),
    bulkDeleteExpenses: builder.mutation({
      query: (ids: string[]) => ({ url: '/expenses/bulk-delete', method: 'POST', data: { ids } }),
      invalidatesTags: ['Expense', 'Dashboard', 'Report'],
    }),
    getExpenseCategories: builder.query({
      query: (params: Record<string, unknown> = {}) => ({ url: '/expense-categories', params }),
      providesTags: ['ExpenseCategory'],
    }),
    createExpenseCategory: builder.mutation({
      query: (data: Record<string, unknown>) => ({ url: '/expense-categories', method: 'POST', data }),
      invalidatesTags: ['ExpenseCategory'],
    }),
    updateExpenseCategory: builder.mutation({
      query: ({ id, data }: { id: string; data: Record<string, unknown> }) => ({
        url: `/expense-categories/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['ExpenseCategory'],
    }),
    deleteExpenseCategory: builder.mutation({
      query: (id: string) => ({ url: `/expense-categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ExpenseCategory'],
    }),
    bulkDeleteExpenseCategories: builder.mutation({
      query: (ids: string[]) => ({ url: '/expense-categories/bulk-delete', method: 'POST', data: { ids } }),
      invalidatesTags: ['ExpenseCategory'],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useBulkDeleteExpensesMutation,
  useGetExpenseCategoriesQuery,
  useCreateExpenseCategoryMutation,
  useUpdateExpenseCategoryMutation,
  useDeleteExpenseCategoryMutation,
  useBulkDeleteExpenseCategoriesMutation,
} = expensesApi;
