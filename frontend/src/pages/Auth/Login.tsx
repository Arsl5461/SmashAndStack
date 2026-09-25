import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useLoginMutation } from '../../api/authApi';
import { startSession } from '../../features/auth/session';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Login() {
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    void import('../Dashboard/Dashboard');
  }, []);

  return (
    <div className="rounded-xl border border-white/10 bg-surface p-8 shadow-2xl">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-400">Smash & Stack</p>
      <h2 className="mt-1 text-4xl font-medium tracking-tight text-ink-900">Sign in</h2>
      <p className="mt-2 text-sm text-slate-400">Manage stores, smash sales, and stack the P&L.</p>
      <form
        className="mt-6 space-y-4"
        autoComplete="off"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            const result = await login(values).unwrap();
            startSession(dispatch, result.data.user, result.data.accessToken);
            toast.success('Signed in successfully');
            navigate('/');
          } catch (error: any) {
            toast.error(error?.data?.message || 'Unable to sign in');
          }
        })}
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            className="soft-input"
            type="email"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Enter your email"
            {...form.register('email')}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="login-password">
            Password
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface-raised px-3 py-2.5 focus-within:border-brand-red/50 focus-within:ring-4 focus-within:ring-brand-red/10">
            <input
              id="login-password"
              className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-slate-500"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Enter your password"
              {...form.register('password')}
            />
            <button
              type="button"
              className="shrink-0 text-slate-400 transition hover:text-brand-red"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <Link className="text-sm font-medium text-brand-red hover:text-brand-deep" to="/forgot-password">
            Forgot password?
          </Link>
        </div>
        <button className="btn-primary w-full" disabled={isLoading} type="submit">
          {isLoading ? 'Signing in...' : 'Let’s smash it'}
        </button>
      </form>
    </div>
  );
}
