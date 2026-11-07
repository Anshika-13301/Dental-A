'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Mail, ArrowRight, RefreshCw, KeyRound, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setToken } = useAppStore();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (600s)
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  useEffect(() => {
    const paramEmail = searchParams.get('email') || localStorage.getItem('dentagent_pending_email') || '';
    setEmail(paramEmail);

    const savedDevOtp = localStorage.getItem('dentagent_dev_otp');
    if (savedDevOtp) {
      setDevOtp(savedDevOtp);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setInfoMessage('');

    try {
      const res = await authApi.verifyOtp(email, otp);
      if (res.data.token && res.data.user) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.removeItem('dentagent_pending_email');
        localStorage.removeItem('dentagent_dev_otp');
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setErrorMessage('');
    setInfoMessage('');

    try {
      const res = await authApi.resendOtp(email);
      setInfoMessage('A fresh 6-digit code has been dispatched to your email.');
      setTimeLeft(600);
      if (res.data.devOtp) {
        setDevOtp(res.data.devOtp);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Could not resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-white py-8 px-6 border border-zinc-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:px-8">
      {errorMessage && (
        <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {infoMessage && (
        <div className="mb-4 p-3 rounded-md bg-sky-50 border border-sky-200 text-sky-800 text-xs flex items-center gap-2">
          <Mail className="w-4 h-4 flex-shrink-0" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* Dev OTP Preview Chip (Convenience for testing without external inbox) */}
      {devOtp && (
        <div className="mb-4 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div>
            <span className="font-mono font-semibold">Dev Sandbox OTP: </span>
            <span className="font-mono text-base font-bold text-amber-950">{devOtp}</span>
          </div>
          <button
            type="button"
            onClick={() => setOtp(devOtp)}
            className="text-[11px] font-mono underline font-semibold text-amber-800 hover:text-amber-950"
          >
            Insert Code
          </button>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-5">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 font-mono uppercase tracking-wider">
              6-Digit OTP Code
            </label>
            <span className="text-xs font-mono text-slate-500">
              Expires in: <strong className="text-slate-800">{formatTimer(timeLeft)}</strong>
            </span>
          </div>

          <input
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            className="w-full text-center tracking-[0.5em] text-2xl font-mono font-bold py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900"
            autoFocus
          />
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-medium text-xs font-mono uppercase tracking-wider py-2.5"
        >
          Confirm Code & Enter Portal
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-zinc-100 flex items-center justify-between text-xs">
        <span className="text-slate-500">Didn't receive code?</span>
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="font-medium text-sky-700 hover:text-sky-900 flex items-center gap-1 font-mono text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
          Resend Code
        </button>
      </div>

      <div className="mt-4 text-center">
        <Link href="/login" className="text-xs text-slate-500 hover:text-slate-800">
          ← Return to Login
        </Link>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
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
          Two-Step Security Verification
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 font-mono">
          Enter the 6-digit code dispatched to your email address
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<div className="p-8 text-center text-xs font-mono text-slate-400">Loading verification session...</div>}>
          <VerifyOtpContent />
        </Suspense>
      </div>
    </div>
  );
}
