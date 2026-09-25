import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '../../components/common/PageHeader';
import { BusyOverlay, InlineSpinner } from '../../components/common/LoadingSpinner';
import { useCreateStoreMutation, useGetStoreQuery, useUpdateStoreMutation } from '../../api/storesApi';
import { useGetUsersQuery } from '../../api/usersApi';
import { usePermissions } from '../../hooks/usePermissions';

type StoreFormValues = {
  name: string;
  storeCode: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  status: string;
  manager: string;
};

const optionalFields: Array<{ name: keyof StoreFormValues; label: string; type?: string }> = [
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone' },
  { name: 'address', label: 'Address' },
  { name: 'city', label: 'City' },
  { name: 'state', label: 'State' },
  { name: 'country', label: 'Country' },
  { name: 'postalCode', label: 'Postal code' },
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-brand-red">{message}</p>;
}

export default function StoreForm({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useGetStoreQuery(id || '', { skip: mode === 'create' || !id });
  const { isSuperAdmin } = usePermissions();
  const usersQuery = useGetUsersQuery(
    { limit: 100, sortBy: 'name', sortOrder: 'asc', status: 'ACTIVE' },
    { skip: !isSuperAdmin }
  );
  const [createStore, createState] = useCreateStoreMutation();
  const [updateStore, updateState] = useUpdateStoreMutation();
  const users = usersQuery.data?.data || [];
  const form = useForm<StoreFormValues>({
    defaultValues: {
      name: '',
      storeCode: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: 'United States',
      postalCode: '',
      status: 'ACTIVE',
      manager: '',
    },
  });
  const errors = form.formState.errors;

  useEffect(() => {
    if (data?.data) {
      form.reset({
        name: data.data.name,
        storeCode: data.data.storeCode,
        email: data.data.email || '',
        phone: data.data.phone || '',
        address: data.data.address || '',
        city: data.data.city || '',
        state: data.data.state || '',
        country: data.data.country || 'United States',
        postalCode: data.data.postalCode || '',
        status: data.data.status,
        manager: data.data.manager?._id || data.data.manager || '',
      });
    }
  }, [data, form]);

  return (
    <div className="w-full">
      <BusyOverlay show={createState.isLoading || updateState.isLoading} label="Saving store..." />
      <PageHeader
        title={mode === 'create' ? 'Add New Store' : 'Edit Store'}
        subtitle="Store name and store code are required. Store codes must stay unique across the organization."
      />
      <form
        className="card grid gap-4 p-6 md:grid-cols-2"
        onSubmit={form.handleSubmit(
          async (values) => {
            const payload = {
              ...values,
              name: values.name.trim(),
              storeCode: values.storeCode.trim().toUpperCase(),
              email: values.email.trim(),
              manager: values.manager || null,
            };
            try {
              if (mode === 'create') {
                await createStore(payload).unwrap();
                toast.success('Store created');
              } else if (id) {
                await updateStore({ id, data: payload }).unwrap();
                toast.success('Store updated');
              }
              navigate('/stores');
            } catch (error: any) {
              toast.error(error?.data?.message || 'Unable to save store');
            }
          },
          () => toast.error('Please fill in the required store fields')
        )}
      >
        <label className="text-sm font-medium text-slate-300">
          Name <span className="text-brand-red">*</span>
          <input
            className="soft-input mt-1"
            placeholder="Mall Branch"
            {...form.register('name', {
              required: 'Store name is required',
              minLength: { value: 2, message: 'Store name must be at least 2 characters' },
            })}
          />
          <FieldError message={errors.name?.message} />
        </label>
        <label className="text-sm font-medium text-slate-300">
          Store code <span className="text-brand-red">*</span>
          <input
            className="soft-input mt-1 uppercase"
            placeholder="SNS-01"
            {...form.register('storeCode', {
              required: 'Store code is required',
              minLength: { value: 2, message: 'Store code must be at least 2 characters' },
            })}
          />
          <FieldError message={errors.storeCode?.message} />
        </label>
        {optionalFields.map((field) => (
          <label key={field.name} className="text-sm font-medium text-slate-300">
            {field.label}
            <input
              className="soft-input mt-1"
              type={field.type || 'text'}
              {...form.register(field.name, {
                validate:
                  field.name === 'email'
                    ? (value) =>
                        !value ||
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
                        'Enter a valid email'
                    : undefined,
              })}
            />
            <FieldError message={errors[field.name]?.message} />
          </label>
        ))}
        <label className="text-sm font-medium text-slate-300">
          Manager
          <select className="soft-input mt-1" {...form.register('manager')}>
            <option value="">Unassigned</option>
            {users.map((user: any) => (
              <option key={user._id} value={user._id}>
                {user.name} {user.email ? `(${user.email})` : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-300">
          Status
          <select className="soft-input mt-1" {...form.register('status')}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="TEMPORARILY_CLOSED">TEMPORARILY_CLOSED</option>
          </select>
        </label>
        <div className="md:col-span-2">
          <button className="btn-primary" disabled={createState.isLoading || updateState.isLoading} type="submit">
            {createState.isLoading || updateState.isLoading ? (
              <>
                <InlineSpinner className="border-white/30 border-t-white" />
                Saving...
              </>
            ) : (
              'Save store'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
