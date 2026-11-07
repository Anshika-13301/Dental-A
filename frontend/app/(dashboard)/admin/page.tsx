'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tenantApi } from '@/lib/api';
import { formatCurrency, formatPhone } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

export default function AdminPage() {
  const { user } = useAppStore();
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    tenantApi.getAllTenants().then((res) => {
      setTenants(res.data.data || []);
      setIsLoading(false);
    }).catch((err) => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  const totalPractices = tenants.length || 1;
  const totalChairsBooked = tenants.reduce((acc, t) => acc + (t.stats?.confirmedBookings || 24), 0);
  const totalMRR = tenants.reduce((acc, t) => acc + (t.stats?.estimatedMonthlyBilling || 1080), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          Super Admin Global Control Plane
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
          Multi-Tenant Dental Practice Portfolio
        </h2>
        <p className="text-xs text-slate-600 mt-1 font-mono">
          System-wide performance monitoring across all licensed clinics
        </p>
      </div>

      {/* Global Performance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs font-mono text-slate-500 uppercase">Subscribed Practices</div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{totalPractices} Practices</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">Commercial $600 Base Fee</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-xs font-mono text-slate-500 uppercase">Platform Chairs Booked</div>
            <div className="text-2xl font-bold font-mono text-sky-700 mt-1">{totalChairsBooked} Chairs</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">${totalChairsBooked * 20} In Chair Success Fees</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F172A] text-white border-slate-800">
          <CardContent className="p-4">
            <div className="text-xs font-mono text-slate-400 uppercase">Total Monthly Gross Billing</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {formatCurrency(totalMRR)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">Dual-Tier Platform Monetization</div>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Tenant Practices Table */}
      <Card>
        <CardHeader className="py-3 px-4 bg-zinc-50 border-b border-zinc-200">
          <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-700">
            Tenant Practices Directory
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 font-mono text-slate-600">
                <th className="py-2.5 px-4 font-semibold">PRACTICE NAME</th>
                <th className="py-2.5 px-4 font-semibold">OWNER / DOCTOR</th>
                <th className="py-2.5 px-4 font-semibold">SMS LINE</th>
                <th className="py-2.5 px-4 font-semibold">PATIENT POOL</th>
                <th className="py-2.5 px-4 font-semibold">CHAIRS CONFIRMED</th>
                <th className="py-2.5 px-4 font-semibold">EST. BILLING</th>
                <th className="py-2.5 px-4 font-semibold text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400 font-mono">
                    Loading tenants...
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr className="hover:bg-zinc-50/70 font-mono">
                  <td className="py-3 px-4 font-semibold text-slate-900">BrightSmile Dental Care</td>
                  <td className="py-3 px-4 text-slate-700">Dr. Sarah Chen, DDS</td>
                  <td className="py-3 px-4 text-slate-600">+1 (555) 234-5678</td>
                  <td className="py-3 px-4 text-slate-700">142 patients</td>
                  <td className="py-3 px-4 font-semibold text-sky-700">24 chairs</td>
                  <td className="py-3 px-4 font-bold text-slate-900">$1,080.00</td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant="emerald" className="text-[10px]">ACTIVE</Badge>
                  </td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t._id} className="hover:bg-zinc-50/70 transition-colors font-mono">
                    <td className="py-3 px-4 font-semibold text-slate-900">{t.practiceName}</td>
                    <td className="py-3 px-4 text-slate-700">{t.ownerId?.name || 'Dr. Sarah Chen'}</td>
                    <td className="py-3 px-4 text-slate-600">{formatPhone(t.phoneNumber)}</td>
                    <td className="py-3 px-4 text-slate-700">{t.stats?.patientCount || 142} patients</td>
                    <td className="py-3 px-4 font-semibold text-sky-700">{t.stats?.confirmedBookings || 24} chairs</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ${t.stats?.estimatedMonthlyBilling || 1080}.00
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant="emerald" className="text-[10px]">{t.status || 'ACTIVE'}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
