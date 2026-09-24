import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
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
    <div className="rounded-md border-2 border-white/20 bg-white p-8 shadow-2xl">
      <p className="text-sm font-normal text-brand-blue">Smash & Stack</p>
      <h2 className="mt-1 text-4xl font-normal tracking-tight text-brand-red">Sign in</h2>
      <p className="mt-2 text-sm text-slate-500">Manage stores, smash sales, and stack the P&L.</p>
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
          <label className="mb-1.5 block text-sm font-normal text-brand-blue" htmlFor="login-email">
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
          <label className="mb-1.5 block text-sm font-normal text-brand-blue" htmlFor="login-password">
            Password
          </label>
          <div className="flex items-center gap-2 rounded-md border border-ink-900/15 bg-cream-50 px-3 py-2.5 focus-within:border-brand-blue focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-blue/15">
            <input
              id="login-password"
              className="w-full bg-transparent text-sm text-brand-blue outline-none"
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
        <button className="btn-primary w-full" disabled={isLoading} type="submit">
          {isLoading ? 'Signing in...' : 'Let’s smash it'}
        </button>
      </form>
    </div>
  );
}
