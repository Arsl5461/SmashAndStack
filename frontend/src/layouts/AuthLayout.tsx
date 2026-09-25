import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import logo from '../assets/logos/smash-and-stack.jpg';
import { Pulse } from '../components/common/LoadingSpinner';

export function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-cream-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-brand-red/25 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-[32rem] w-[32rem] rounded-full bg-brand-yellow/10 blur-3xl" />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <img src={logo} alt="Smash & Stack" className="mb-8 h-28 w-auto object-contain drop-shadow-2xl sm:h-36" />
        <div className="w-full max-w-md">
          <Suspense
            fallback={
              <div className="space-y-4 rounded-xl border border-white/10 bg-surface p-8">
                <Pulse className="h-3 w-24" />
                <Pulse className="h-7 w-48" />
                <Pulse className="h-11 w-full rounded-md" />
                <Pulse className="h-11 w-full rounded-md" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
        <p className="mt-8 text-center text-sm font-normal text-slate-400">Burgers N More</p>
      </div>
    </div>
  );
}
