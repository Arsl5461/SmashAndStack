import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/common/PageHeader';
import { BusyOverlay, InlineSpinner, LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useGetOrganizationQuery, useUpdateOrganizationMutation } from '../../api/usersApi';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../constants/permissions';
import logo from '../../assets/logos/smash-and-stack.jpg';

const FIELDS = [
  { name: 'name' as const, label: 'Organization name', placeholder: 'Smash & Stack', icon: Building2 },
  { name: 'email' as const, label: 'Headquarters email', placeholder: 'hq@smashandstack.com', icon: Mail, type: 'email' },
  { name: 'phone' as const, label: 'Phone', placeholder: '555-0100', icon: Phone },
  { name: 'address' as const, label: 'Address', placeholder: 'United States', icon: MapPin },
];

export default function Settings() {
  const { can } = usePermissions();
  const canEdit = can(PERMISSIONS.SETTINGS_UPDATE);
  const { data, isLoading } = useGetOrganizationQuery();
  const [updateOrganization, { isLoading: saving }] = useUpdateOrganizationMutation();
  const form = useForm({ defaultValues: { name: '', email: '', phone: '', address: '' } });
  const organization = data?.data;

  useEffect(() => {
    if (organization) {
      form.reset({
        name: organization.name || '',
        email: organization.email || '',
        phone: organization.phone || '',
        address: organization.address || '',
      });
    }
  }, [organization, form]);

  return (
    <div className="max-w-5xl">
      <PageHeader title="Settings" subtitle="Update the organization profile used across the platform." />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              await updateOrganization(values).unwrap();
              toast.success('Settings saved');
            } catch (error: any) {
              toast.error(error?.data?.message || 'Unable to save settings');
            }
          })}
        >
          <div className="card overflow-hidden">
            <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={organization?.logo || logo}
                  alt={organization?.name || 'Organization logo'}
                  className="h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-200"
                />
                <div>
                  <p className="text-lg font-normal text-brand-red">{organization?.name || 'Organization'}</p>
                  <p className="text-sm text-slate-500">{organization?.email || 'No email on file'}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {organization?.slug ? (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-normal text-slate-600">
                        {organization.slug}
                      </span>
                    ) : null}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-normal ${
                        organization?.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {organization?.isActive !== false ? 'Active organization' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <p className="max-w-sm text-sm text-slate-500">
                This profile appears on exports, reports, and team communications.
              </p>
            </div>
          </div>

          <div className="card p-6">
            <div className="mb-5">
              <h2 className="text-base font-normal text-brand-red">Organization profile</h2>
              <p className="mt-1 text-sm text-slate-500">Official name and contact details for headquarters.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {FIELDS.map((field) => (
                <label key={field.name} className={`text-sm font-medium text-slate-700 ${field.name === 'address' ? 'md:col-span-2' : ''}`}>
                  {field.label}
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus-within:border-brand-red/40 focus-within:ring-4 focus-within:ring-brand-red/10">
                    <field.icon className="h-4 w-4 shrink-0 text-slate-400" />
                    <input
                      className="w-full bg-transparent text-sm text-slate-800 outline-none disabled:cursor-not-allowed disabled:opacity-70"
                      type={field.type || 'text'}
                      placeholder={field.placeholder}
                      disabled={!canEdit}
                      {...form.register(field.name)}
                    />
                  </div>
                </label>
              ))}
            </div>
            {canEdit ? (
              <div className="mt-6 flex justify-end gap-2">
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() =>
                    form.reset({
                      name: organization?.name || '',
                      email: organization?.email || '',
                      phone: organization?.phone || '',
                      address: organization?.address || '',
                    })
                  }
                >
                  Reset
                </button>
                <button className="btn-primary" type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <InlineSpinner className="border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    'Save settings'
                  )}
                </button>
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-500">You have view-only access to organization settings.</p>
            )}
          </div>
        </form>
      )}
      <BusyOverlay show={saving} label="Saving settings..." />
    </div>
  );
}
