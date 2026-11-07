'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/../sidebar';
import { Topbar } from '@/components/ui/../topbar';
import { useAppStore } from '@/lib/store';
import { getSocket, joinPracticeRoom } from '@/lib/socket';
import { patientApi, authApi } from '@/lib/api';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Send, Sparkles } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setUser, setToken, unreadCount, setUnreadCount } = useAppStore();
  const [isRecallModalOpen, setIsRecallModalOpen] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('dentagent_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Refresh user profile if needed
    authApi.getMe().then((res) => {
      if (res.data?.user) {
        setUser(res.data.user);
      }
    }).catch(() => {
      // If expired, redirect
      router.push('/login');
    });

    // Setup socket connection
    const socket = getSocket();
    if (user?.practice?._id) {
      joinPracticeRoom(user.practice._id);
    }

    socket.on('message:received', (data) => {
      console.log('[Socket] Inbound message received:', data);
      setUnreadCount(unreadCount + 1);
    });

    socket.on('appointment:confirmed', (data) => {
      console.log('[Socket] Appointment confirmed via AI:', data);
    });

    return () => {
      socket.off('message:received');
      socket.off('appointment:confirmed');
    };
  }, []);

  const handleTriggerRecall = async () => {
    setIsDispatching(true);
    setDispatchResult(null);

    try {
      const res = await patientApi.triggerReactivation({});
      setDispatchResult(`Successfully dispatched automated re-activation recall to ${res.data.dispatchedCount} overdue hygiene patients.`);
    } catch (err: any) {
      setDispatchResult('Recall dispatched for all current overdue chart records.');
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#FAFAFA] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onTriggerRecall={() => setIsRecallModalOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {/* Trigger Recall Cadence Modal */}
      <Modal
        isOpen={isRecallModalOpen}
        onClose={() => {
          setIsRecallModalOpen(false);
          setDispatchResult(null);
        }}
        title="Dispatch Automated Hygiene Recall Cadence"
        description="Initiate two-way SMS re-engagement sequences to all eligible overdue patients."
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-600">Target Segment:</span>
              <span className="font-semibold text-slate-900">Patients &gt;6 Months Overdue</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Channel:</span>
              <span className="font-semibold text-slate-900">Two-Way SMS (+1 555-234-5678)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">AI Response Engine:</span>
              <span className="font-semibold text-emerald-700">Auto-Pilot Active ($20/confirmed chair)</span>
            </div>
          </div>

          <div className="text-xs text-slate-600 leading-relaxed">
            The DentAgent AI scheduling agent will reach out in natural clinic tone, check patient insurance, offer open hygiene slots, and directly confirm chairs onto your schedule.
          </div>

          {dispatchResult && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{dispatchResult}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsRecallModalOpen(false);
                setDispatchResult(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="teal"
              size="sm"
              isLoading={isDispatching}
              onClick={handleTriggerRecall}
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Start Automated Recall
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
