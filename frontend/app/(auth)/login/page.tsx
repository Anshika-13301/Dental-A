'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail, ShieldAlert, User, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'patient' | 'admin'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await axios.post('https://dental-a.onrender.com/login', {
        email,
        password,
      });

      const { token, role, user } = res.data;

      // Local storage auth details save
      localStorage.setItem('token', token);
      localStorage.setItem('role', role || activeTab);
      if (user) {
        localStorage.setItem('userData', JSON.stringify(user));
      }

      // Direct Role-based Route Redirection (No OTP)
      if (role === 'admin' || activeTab === 'admin') {
        router.push('/admin');
      } else {
        router.push('/patient');
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Login failed. Please verify your credentials.'
      );
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
          Portal Account Sign In
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 font-mono">
          Select portal type to access your portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Role Selection Tabs */}
        <div className="flex bg-slate-200 p-1 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab('patient');
              setEmail('');
              setPassword('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'patient'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Patient Login
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setEmail('anshikashukla1336@gmail.com');
              setPassword('mail@11');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'admin'
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Portal
          </button>
        </div>

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
                {activeTab === 'admin' ? 'Admin Email Address' : 'User Email Address'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    activeTab === 'admin' ? 'anshikashukla1336@gmail.com' : 'patient@example.com'
                  }
                  className="w-full px-3.5 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 placeholder:text-zinc-400"
                />
                <Mail className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 font-mono uppercase tracking-wider mb-1">
                Password
              </label>
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

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-medium text-xs font-mono uppercase tracking-wider py-2.5 rounded-lg flex items-center justify-center gap-2 mt-2 transition ${
                activeTab === 'admin'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-[#0F172A] hover:bg-slate-800'
              }`}
            >
              {isLoading ? 'Authenticating...' : `Login to ${activeTab === 'admin' ? 'Admin Panel' : 'User Panel'}`}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {activeTab === 'patient' && (
            <div className="mt-6 text-center text-xs text-slate-600">
              Don't have a user account?{' '}
              <Link href="/register" className="font-semibold text-sky-700 hover:underline">
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}