'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Bell, Send, CheckCircle2, PhoneCall } from 'lucide-react';
import { Button } from './ui/button';
import { useAppStore } from '@/lib/store';

export function Topbar({ onTriggerRecall }: { onTriggerRecall?: () => void }) {
  const pathname = usePathname();
  const { user } = useAppStore();

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard':
        return 'Hygiene Operations Overview';
      case '/patients':
        return 'Overdue Hygiene Patient Registry';
      case '/appointments':
        return 'Confirmed Hygiene Chairs & Schedule';
      case '/inbox':
        return 'Two-Way SMS Patient Re-Activation Inbox';
      case '/campaigns':
        return 'Recall Cadence & Automated Triggers';
      case '/billing':
        return 'Commercial Billing & Monetization Audit';
      case '/settings':
        return 'Practice Configuration & AI Prompts';
      case '/admin':
        return 'Super Admin Global Portfolio';
      default:
        return 'DentAgent Clinical Portal';
    }
  };

  return (
    <header className="h-14 border-b border-border bg-white px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-slate-900 tracking-tight">
          {getPageTitle(pathname)}
        </h1>
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium font-mono">
          <Bot className="w-3 h-3 text-emerald-600" />
          <span>AI Auto-Pilot: Online</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span className="text-slate-400">Office Phone:</span>
          <span className="text-slate-700 font-medium">
            {user?.practice?.phoneNumber || '+1 (555) 234-5678'}
          </span>
        </div>

        {onTriggerRecall && (
          <Button size="sm" variant="teal" onClick={onTriggerRecall} className="text-xs">
            <Send className="w-3.5 h-3.5 mr-1" />
            Dispatch Recall Cadence
          </Button>
        )}

        <Link
          href="/inbox"
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors relative"
          title="SMS Inbox"
        >
          <Bell className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
