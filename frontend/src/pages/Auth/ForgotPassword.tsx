import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useForgotPasswordMutation, useResetPasswordMutation, useVerifyOtpMutation } from '../../api/authApi';

type Step = 'email' | 'otp' | 'password';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, { isLoading: sending }] = useForgotPasswordMutation();
  const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation();
  const [resetPassword, { isLoading: resetting }] = useResetPasswordMutation();

  const sendCode = async (nextEmail = email) => {
    try {
      await forgotPassword({ email: nextEmail.trim() }).unwrap();
      toast.success('If that email exists, we sent a 6-digit code.');
      setStep('otp');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Unable to send the verification code');
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-surface p-8 shadow-2xl">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-400">Smash & Stack</p>
      <h2 className="mt-1 text-4xl font-medium tracking-tight text-ink-900">Forgot password</h2>
      <p className="mt-2 text-sm text-slate-400">
        {step === 'email'
          ? 'Enter your account email and we will send a one-time code.'
          : step === 'otp'
            ? `Enter the 6-digit code sent to ${email}.`
            : 'Choose a new password for your account.'}
      </p>

      {step === 'email' ? (
        <form
          className="mt-6 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!email.trim()) {
              toast.error('Enter your email');
              return;
            }
            await sendCode(email);
          }}
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="reset-email">
              Email
            </label>
            <input
              id="reset-email"
              className="soft-input"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <button className="btn-primary w-full" disabled={sending} type="submit">
            {sending ? 'Sending code...' : 'Send verification code'}
          </button>
        </form>
      ) : null}

      {step === 'otp' ? (
        <form
          className="mt-6 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!/^\d{6}$/.test(otp)) {
              toast.error('Enter the 6-digit code');
              return;
            }
            try {
              await verifyOtp({ email: email.trim(), otp }).unwrap();
              toast.success('Code confirmed');
              setStep('password');
            } catch (error: any) {
              toast.error(error?.data?.message || 'Invalid or expired code');
            }
          }}
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="reset-otp">
              Verification code
            </label>
            <input
              id="reset-otp"
              className="soft-input tracking-[0.35em]"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />
          </div>
          <button className="btn-primary w-full" disabled={verifying} type="submit">
            {verifying ? 'Checking...' : 'Verify code'}
          </button>
          <button
            className="btn-secondary w-full"
            type="button"
            disabled={sending}
            onClick={() => sendCode()}
          >
            {sending ? 'Resending...' : 'Resend code'}
          </button>
        </form>
      ) : null}

      {step === 'password' ? (
        <form
          className="mt-6 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (password.length < 8) {
              toast.error('Password must be at least 8 characters');
              return;
            }
            if (password !== confirmPassword) {
              toast.error('Passwords do not match');
              return;
            }
            try {
              await resetPassword({ email: email.trim(), otp, password }).unwrap();
              toast.success('Password updated. You can sign in now.');
              navigate('/login');
            } catch (error: any) {
              toast.error(error?.data?.message || 'Unable to update password');
            }
          }}
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="reset-password">
              New password
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface-raised px-3 py-2.5 focus-within:border-brand-red/50 focus-within:ring-4 focus-within:ring-brand-red/10">
              <input
                id="reset-password"
                className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-slate-500"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className="shrink-0 text-slate-400 transition hover:text-brand-red"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="reset-confirm">
              Confirm password
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface-raised px-3 py-2.5 focus-within:border-brand-red/50 focus-within:ring-4 focus-within:ring-brand-red/10">
              <input
                id="reset-confirm"
                className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-slate-500"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className="shrink-0 text-slate-400 transition hover:text-brand-red"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button className="btn-primary w-full" disabled={resetting} type="submit">
            {resetting ? 'Updating...' : 'Update password'}
          </button>
        </form>
      ) : null}

      <p className="mt-5 text-center text-sm text-slate-400">
        Remembered it?{' '}
        <Link className="font-medium text-brand-red hover:text-brand-deep" to="/login">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
