import { toast } from 'sonner';
import { PageHeader } from '../../components/common/PageHeader';
import { useGetPermissionsQuery, useGetRolesQuery, useUpdateRoleMutation } from '../../api/usersApi';

export default function Roles() {
  const roles = useGetRolesQuery();
  const permissions = useGetPermissionsQuery();
  const [updateRole] = useUpdateRoleMutation();

  return (
    <div>
      <PageHeader title="Roles & Permissions" subtitle="Grouped permission matrix for each role." />
      <div className="grid gap-4 xl:grid-cols-2">
        {(roles.data?.data || []).map((role: any) => (
          <article key={role._id} className="card p-5">
            <div className="mb-4">
              <h3 className="text-lg font-normal">{role.name}</h3>
              <p className="text-sm text-slate-500">{role.description}</p>
            </div>
            <div className="space-y-4">
              {(permissions.data?.data || []).map((group: any) => (
                <div key={group.key}>
                  <p className="mb-2 text-xs font-normal uppercase tracking-wide text-slate-400">{group.label}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.permissions.map((permission: string) => {
                      const checked = role.permissions?.includes(permission);
                      return (
                        <label key={permission} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={role.slug === 'SUPER_ADMIN'}
                            onChange={async () => {
                              const next = checked
                                ? role.permissions.filter((item: string) => item !== permission)
                                : [...(role.permissions || []), permission];
                              await updateRole({ id: role._id, data: { permissions: next } });
                              toast.success('Permissions updated');
                            }}
                          />
                          {permission}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
