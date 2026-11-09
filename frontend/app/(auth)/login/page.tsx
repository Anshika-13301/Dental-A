'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await authApi.login(email, password);
      // Store email temporarily for OTP verification
      localStorage.setItem('dentagent_pending_email', email);
      if (res.data.devOtp) {
        localStorage.setItem('dentagent_dev_otp', res.data.devOtp);
      }
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg bg-[#0F172A] flex items-center justify-center text-white font-bold text-base shadow-sm">
            D
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">DentAgent AI</span>
        </Link>

        <h2 className="text-center text-xl font-bold tracking-tight text-slate-900">
          Clinical Portal Sign In
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 font-mono">
          Two-step email OTP verification enforced
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-zinc-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:px-8">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 font-mono uppercase tracking-wider mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@clinic.com"
                  className="w-full px-3.5 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 placeholder:text-zinc-400"
                />
                <Mail className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700 font-mono uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 placeholder:text-zinc-400"
                />
                <Lock className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-medium text-xs font-mono uppercase tracking-wider py-2.5 mt-2"
            >
              Continue to OTP Verification
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600">
            Register a new dental clinic?{' '}
            <Link href="/register" className="font-semibold text-sky-700 hover:underline">
              Clinic Onboarding
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}