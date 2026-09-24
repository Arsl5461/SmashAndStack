import { api } from './axios';

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params: Record<string, unknown>) => ({ url: '/users', params }),
      providesTags: ['User'],
    }),
    createUser: builder.mutation({
      query: (data: Record<string, unknown>) => ({ url: '/users', method: 'POST', data }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ id, data }: { id: string; data: Record<string, unknown> }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (id: string) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
    bulkDeleteUsers: builder.mutation({
      query: (ids: string[]) => ({ url: '/users/bulk-delete', method: 'POST', data: { ids } }),
      invalidatesTags: ['User'],
    }),
    getRoles: builder.query({
      query: () => ({ url: '/roles' }),
      providesTags: ['Role'],
    }),
    updateRole: builder.mutation({
      query: ({ id, data }: { id: string; data: Record<string, unknown> }) => ({
        url: `/roles/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['Role'],
    }),
    getPermissions: builder.query({
      query: () => ({ url: '/permissions' }),
      providesTags: ['Role'],
    }),
    getOrganization: builder.query({
      query: () => ({ url: '/organizations/current' }),
      providesTags: ['Settings'],
    }),
    updateOrganization: builder.mutation({
      query: (data: Record<string, unknown>) => ({ url: '/organizations/current', method: 'PATCH', data }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useBulkDeleteUsersMutation,
  useGetRolesQuery,
  useUpdateRoleMutation,
  useGetPermissionsQuery,
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
} = usersApi;
