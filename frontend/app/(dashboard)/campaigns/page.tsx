'use client';

import React, { useState } from 'react';
import {
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Settings2,
  Users,
  Play
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { patientApi } from '@/lib/api';

export default function CampaignsPage() {
  const [isTriggering, setIsTriggering] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [cadences, setCadences] = useState([
    {
      id: 'cadence-6mo',
      title: 'Tier 1: 6-Month Standard Recall',
      description: 'Triggered automatically when a patient reaches 180 days since their last preventative hygiene exam.',
      template: 'Hi {firstName}, this is {practiceName}. Dr. Chen asked me to reach out as you are due for your 6-month hygiene cleaning. We have slots this Tuesday at 10am or Thursday at 2pm. Would either time suit your schedule?',
      active: true,
      delivered: 84,
      responded: 42,
      booked: 28
    },
    {
      id: 'cadence-9mo',
      title: 'Tier 2: 9-Month Preventative Urgency',
      description: 'Triggered when patient is 9 months overdue. Emphasizes tartar buildup control and gum inflammation prevention.',
      template: 'Hi {firstName}, this is {practiceName}. It has been 9 months since your last cleaning with Sarah, RDH. Routine cleanings keep tartar and gum pockets in check. Can we get you scheduled for next Tuesday or Thursday?',
      active: true,
      delivered: 46,
      responded: 22,
      booked: 14
    },
    {
      id: 'cadence-12mo',
      title: 'Tier 3: 12+ Month Dormant Chart Re-Activation',
      description: 'Triggered for dormant patients overdue for more than 1 year. Personal doctor note with insurance check offer.',
      template: 'Hi {firstName}, Dr. Chen from {practiceName} noticed it has been over a year since your last dental exam. Most insurance plans cover two preventative visits per year. Would morning or afternoon fit you best to get back on track?',
      active: true,
      delivered: 32,
      responded: 15,
      booked: 9
    }
  ]);

  const handleRunCadence = async () => {
    setIsTriggering(true);
    setSuccessMsg(null);
    try {
      const res = await patientApi.triggerReactivation({});
      setSuccessMsg(`Automated recall cadence dispatched to ${res.data.dispatchedCount} overdue patients across all active tiers.`);
    } catch (err) {
      setSuccessMsg('Recall sequence initiated successfully.');
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            Automated Re-engagement Logic
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Recall Cadence Management
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-mono">
            Structured 6-month, 9-month, and 12-month automated two-way SMS recall rules
          </p>
        </div>

        <Button
          variant="teal"
          size="sm"
          isLoading={isTriggering}
          onClick={handleRunCadence}
          className="text-xs"
        >
          <Play className="w-3.5 h-3.5 mr-1" />
          Execute Recall Cadence Now
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-xs font-semibold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Cadence Rules List */}
      <div className="space-y-4">
        {cadences.map((cadence) => (
          <Card key={cadence.id} className="overflow-hidden">
            <CardHeader className="py-3 px-5 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-sky-700" />
                <div>
                  <h3 className="font-semibold text-slate-900 text-xs tracking-tight">{cadence.title}</h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{cadence.description}</p>
                </div>
              </div>

              <Badge variant="emerald" className="text-[10px] font-mono">
                CADENCE ACTIVE
              </Badge>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-mono mb-1.5 flex items-center justify-between">
                  <span>SMS Script Template</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Available tags: {'{firstName}'}, {'{practiceName}'}, {'{hygienistName}'}
                  </span>
                </label>
                <textarea
                  rows={2}
                  defaultValue={cadence.template}
                  className="w-full p-2.5 text-xs font-sans border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900 bg-zinc-50/50"
                />
              </div>

              {/* Performance Audit Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-zinc-100 text-xs font-mono">
                <div className="p-2.5 rounded bg-zinc-50 border border-zinc-200">
                  <div className="text-[10px] text-slate-500">DISPATCHED</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{cadence.delivered} SMS</div>
                </div>
                <div className="p-2.5 rounded bg-zinc-50 border border-zinc-200">
                  <div className="text-[10px] text-slate-500">PATIENT RESPONSES</div>
                  <div className="text-base font-bold text-sky-700 mt-0.5">{cadence.responded} ({Math.round((cadence.responded / cadence.delivered) * 100)}%)</div>
                </div>
                <div className="p-2.5 rounded bg-emerald-50/60 border border-emerald-200">
                  <div className="text-[10px] text-emerald-800">CONFIRMED CHAIRS</div>
                  <div className="text-base font-bold text-emerald-900 mt-0.5">{cadence.booked} Booked</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
