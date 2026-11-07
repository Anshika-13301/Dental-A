'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  Send,
  Receipt,
  Settings,
  ShieldCheck,
  LogOut,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { authApi } from '@/lib/api';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, unreadCount } = useAppStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Continue anyway
    }
    logout();
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Overdue Patients', href: '/patients', icon: Users },
    { name: 'Hygiene Chairs', href: '/appointments', icon: Calendar },
    {
      name: 'SMS Inbox',
      href: '/inbox',
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    { name: 'Recall Cadence', href: '/campaigns', icon: Send },
    { name: 'Practice Billing', href: '/billing', icon: Receipt },
    { name: 'Clinic Settings', href: '/settings', icon: Settings }
  ];

  if (user?.role === 'SUPER_ADMIN') {
    navItems.push({ name: 'Platform Admin', href: '/admin', icon: ShieldCheck });
  }

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center text-white font-bold text-base shadow-sm">
            D
          </div>
          <div>
            <div className="font-semibold text-white tracking-tight text-sm leading-none flex items-center gap-1.5">
              DentAgent<span className="text-sky-400 font-mono text-xs">AI</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono tracking-tight">
              Hygiene Re-Activation
            </div>
          </div>
        </Link>

        {/* Practice Identifier Pill */}
        <div className="mt-3.5 px-2.5 py-1.5 bg-slate-800/70 rounded border border-slate-700/60 flex items-center justify-between">
          <div className="truncate text-xs font-medium text-slate-200">
            {user?.practice?.practiceName || 'BrightSmile Dental'}
          </div>
          <span className="flex h-2 w-2 relative flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
          Clinical Operations
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors',
                isActive
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={cn('w-4 h-4', isActive ? 'text-sky-400' : 'text-slate-400')} />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.2 bg-sky-500 text-white text-[10px] font-mono rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Monetization Model Info Card */}
      <div className="p-3 mx-3 mb-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-xs">
        <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1 font-mono">
          <span>COMMERCIAL TIER</span>
          <span className="text-emerald-400 font-semibold">ACTIVE</span>
        </div>
        <div className="text-white font-semibold text-[13px] tracking-tight">
          $600<span className="text-slate-400 text-xs font-normal">/mo</span> + $20<span className="text-slate-400 text-xs font-normal">/chair</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 leading-tight">
          Automated SMS recall & hygiene calendar sync
        </div>
      </div>

      {/* User Profile & Logout */}
      <div className="p-3 border-t border-slate-800/80 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-7 h-7 rounded bg-slate-700 text-slate-200 flex items-center justify-center font-semibold text-xs flex-shrink-0">
            {user?.name ? user.name[0] : 'D'}
          </div>
          <div className="truncate">
            <div className="text-xs font-medium text-slate-200 truncate">{user?.name || 'Dr. Sarah Chen'}</div>
            <div className="text-[10px] font-mono text-slate-400 truncate">
              {user?.role || 'PRACTICE_ADMIN'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign out"
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
