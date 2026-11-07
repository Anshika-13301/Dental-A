'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Clock,
  ArrowUpRight,
  Send,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { analyticsApi, patientApi } from '@/lib/api';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

export default function DashboardPage() {
  const { user } = useAppStore();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await analyticsApi.getDashboard();
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary = data?.summary || {
    totalPatients: 142,
    overdueCount: 48,
    engagedCount: 16,
    scheduledCount: 24,
    completedCount: 12,
    confirmedAppointments: 24,
    reactivationRate: '38.4%',
    hygieneRevenueGenerated: 4440,
    totalPlatformCost: 1080,
    netClinicalProfit: 3360,
    roiMultiplier: '4.1x'
  };

  const cadence = data?.cadenceDistribution || [
    { segment: '6–9 Months Overdue', count: 24, urgency: 'Medium' },
    { segment: '9–12 Months Overdue', count: 16, urgency: 'High' },
    { segment: '12+ Months Dormant', count: 8, urgency: 'Critical' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Practice Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            Practice Overview • {user?.practice?.practiceName || 'BrightSmile Dental Care'}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Hygiene Chair Re-Activation Operations
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/inbox">
            <Button variant="outline" size="sm" className="text-xs">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
              Live SMS Inbox
            </Button>
          </Link>
          <Link href="/appointments">
            <Button variant="primary" size="sm" className="bg-[#0F172A] text-xs">
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              Hygiene Schedule
            </Button>
          </Link>
        </div>
      </div>

      {/* 5-Column Precision Key Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Overdue Hygiene Pool */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500">
              <span>OVERDUE POOL</span>
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {summary.overdueCount}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between font-mono">
              <span>Potential Value:</span>
              <strong className="text-slate-700">{formatCurrency(summary.overdueCount * 185)}</strong>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Reactivation Rate */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500">
              <span>RE-ACTIVATION RATE</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {summary.reactivationRate}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between font-mono">
              <span>Benchmark Target:</span>
              <span className="text-emerald-700 font-semibold">&gt; 30%</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Confirmed Chair Bookings */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500">
              <span>CONFIRMED CHAIRS</span>
              <Calendar className="w-4 h-4 text-sky-600" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-sky-700 tracking-tight">
              {summary.confirmedAppointments}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between font-mono">
              <span>Fee Accrued:</span>
              <strong className="text-slate-800">${summary.confirmedAppointments * 20}.00</strong>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Hygiene Production Unlocked */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500">
              <span>HYGIENE PRODUCTION</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {formatCurrency(summary.hygieneRevenueGenerated)}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between font-mono">
              <span>Avg Production:</span>
              <span>$185 / visit</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 5: Net Practice Gain */}
        <Card className="bg-[#0F172A] text-white border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>NET CLINIC PROFIT</span>
              <Badge variant="emerald" className="text-[10px] py-0 px-1 font-mono">
                {summary.roiMultiplier}
              </Badge>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-emerald-400 tracking-tight">
              {formatCurrency(summary.netClinicalProfit)}
            </div>
            <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between font-mono">
              <span>DentAgent Cost:</span>
              <span className="text-slate-300">-${summary.totalPlatformCost}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dual Column: Recall Cadence Urgency + Live SMS Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recall Cadence Urgency Funnel */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                Recall Cadence Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {cadence.map((item: any, idx: number) => {
                const urgencyColors: any = {
                  Medium: 'text-amber-700 bg-amber-50 border-amber-200',
                  High: 'text-orange-800 bg-orange-50 border-orange-200',
                  Critical: 'text-rose-800 bg-rose-50 border-rose-200'
                };

                return (
                  <div
                    key={idx}
                    className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{item.segment}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {item.count} overdue hygiene charts
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                          urgencyColors[item.urgency] || 'bg-zinc-100'
                        }`}
                      >
                        {item.urgency}
                      </span>
                      <Link href={`/patients?minOverdue=${idx === 0 ? 6 : idx === 1 ? 9 : 12}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}

              <div className="pt-2">
                <Link href="/campaigns">
                  <Button variant="outline" size="sm" className="w-full text-xs font-mono">
                    Configure Recall Cadence Rules →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Model Transparency Box */}
          <Card className="border-sky-100 bg-sky-50/40">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-xs font-mono text-sky-900 font-semibold mb-1">
                <span>COMMERCIAL BILLING AUDIT</span>
                <span>$600 + $20/chair</span>
              </div>
              <p className="text-xs text-sky-800/80 leading-relaxed">
                DentAgent bills a predictable <strong>$600 flat monthly platform fee</strong>, and exactly <strong>$20 per confirmed chair booking</strong>. You retain 100% of the patient hygiene production.
              </p>
              <div className="mt-3 flex items-center justify-between text-xs font-mono pt-2 border-t border-sky-200/60">
                <span className="text-sky-900">Current Month Bookings:</span>
                <strong className="text-sky-950">{summary.confirmedAppointments} chairs confirmed</strong>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live SMS Activity Log */}
        <div className="lg:col-span-7">
          <Card className="h-full flex flex-col">
            <CardHeader className="py-3 px-4 flex items-center justify-between">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-teal" />
                Live Patient SMS Audit Trail
              </CardTitle>
              <Link href="/inbox" className="text-xs font-mono text-sky-700 hover:underline flex items-center gap-0.5">
                Open Full Inbox <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-y-auto space-y-3">
              {data?.recentActivity && data.recentActivity.length > 0 ? (
                data.recentActivity.map((msg: any) => {
                  const isPatient = msg.sender === 'PATIENT';
                  return (
                    <div
                      key={msg._id}
                      className="p-3 bg-white border border-zinc-200/90 rounded-lg hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {msg.patientId ? `${msg.patientId.firstName} ${msg.patientId.lastName}` : 'Patient'}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              isPatient
                                ? 'bg-zinc-100 text-zinc-700'
                                : 'bg-sky-50 text-sky-700 border border-sky-200'
                            }`}
                          >
                            {msg.sender}
                          </span>
                        </div>
                        <span>{formatRelativeTime(msg.sentAt)}</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-sans">{msg.body}</p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-xs text-slate-400 font-mono">
                  No SMS activity recorded yet. Launch your first recall cadence to initiate dialogues.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmed Hygiene Bookings Table */}
      <Card>
        <CardHeader className="py-3 px-4 flex items-center justify-between">
          <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Recently Confirmed Hygiene Chairs
          </CardTitle>
          <Link href="/appointments" className="text-xs font-mono text-sky-700 hover:underline flex items-center gap-0.5">
            View All Chairs <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-y border-zinc-200 bg-zinc-50 font-mono text-slate-600">
                <th className="py-2.5 px-4 font-semibold">PATIENT</th>
                <th className="py-2.5 px-4 font-semibold">APPOINTMENT SLOT</th>
                <th className="py-2.5 px-4 font-semibold">HYGIENIST</th>
                <th className="py-2.5 px-4 font-semibold">INSURANCE</th>
                <th className="py-2.5 px-4 font-semibold">STATUS</th>
                <th className="py-2.5 px-4 font-semibold text-right">COMMISSION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {data?.recentBookings && data.recentBookings.length > 0 ? (
                data.recentBookings.map((apt: any) => (
                  <tr key={apt._id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      {apt.patientId ? `${apt.patientId.firstName} ${apt.patientId.lastName}` : 'Marcus Vance'}
                      <div className="text-[10px] text-slate-400 font-mono">{apt.patientId?.phone || '+1 555-981-1001'}</div>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-800">
                      {formatDate(apt.appointmentDate)} @ 10:00 AM
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 font-mono">
                      {apt.hygienistName || 'Sarah Jenkins, RDH'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {apt.patientId?.insuranceCarrier || 'Delta Dental Premier'}
                    </td>
                    <td className="py-2.5 px-4">
                      <Badge variant="emerald" className="text-[10px]">
                        CONFIRMED
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900">
                      $20.00
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400 text-xs font-mono">
                    No confirmed bookings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
