'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Activity,
  DollarSign,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export default function LandingPage() {
  // Interactive ROI Calculator State
  const [patientBase, setPatientBase] = useState<number>(1800);
  const [overduePercentage, setOverduePercentage] = useState<number>(30); // 30% overdue

  // Calculations:
  // Overdue patients pool
  const overduePatients = Math.round((patientBase * overduePercentage) / 100);
  // Conservative reactivation conversion rate: 12% of overdue re-activated per month
  const monthlyReactivatedChairs = Math.round(overduePatients * 0.12);
  // Average hygiene chair production: $185 per visit
  const grossProductionUnlocked = monthlyReactivatedChairs * 185;
  // Dual-Tier Cost: $600 base + $20 per chair
  const dentAgentMonthlyCost = 600 + monthlyReactivatedChairs * 20;
  // Net Clinic Gain
  const netPracticeGain = grossProductionUnlocked - dentAgentMonthlyCost;
  const roiMultiplier = (grossProductionUnlocked / dentAgentMonthlyCost).toFixed(1);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col selection:bg-sky-100 selection:text-sky-900">
      {/* Precision Top Clinical Banner */}
      <div className="bg-[#0F172A] text-slate-300 text-xs px-4 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="teal" className="text-[10px] py-0 px-1.5 uppercase font-mono">
              Clinical Recall
            </Badge>
            <span className="text-slate-300 hidden sm:inline">
              Targeted two-way SMS hygiene re-activation for general & multi-specialty practices
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-400">HIPAA Compliant Architecture</span>
            <span className="text-sky-400 font-medium">99.4% Delivery SLA</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#0F172A] flex items-center justify-center text-white font-bold text-sm">
              D
            </div>
            <div>
              <span className="font-semibold text-slate-900 tracking-tight text-base">DentAgent</span>
              <span className="text-sky-600 font-mono text-xs font-bold ml-1">AI</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-600">
            <a href="#calculator" className="hover:text-slate-900 transition-colors">
              Revenue Model & ROI
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
              Recall Cadence
            </a>
            <a href="#interactive-sms" className="hover:text-slate-900 transition-colors">
              Two-Way SMS Engine
            </a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">
              Dual-Tier Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="primary" size="sm" className="bg-[#0F172A] hover:bg-slate-800">
                Launch Portal
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Crisp Clinical Hero Section */}
        <section className="pt-20 pb-16 px-6 max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-zinc-200 bg-white text-xs font-mono text-slate-700 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              Dual-Tier Monetization: $600/month flat + $20/confirmed chair
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.12]">
              Automated Dental Patient Re-Activation & Hygiene Booking Agent.
            </h1>

            <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl">
              Empty hygiene chairs cost the average dental practice over $140,000 annually.
              DentAgent AI audits overdue patient charts, executes context-aware two-way SMS recalls,
              and books confirmed hygiene chairs directly into your schedule.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-[#0F172A] hover:bg-slate-800 text-white font-medium text-sm">
                  Enter Clinical Portal
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="#calculator">
                <Button variant="outline" size="lg" className="text-sm">
                  Calculate Chair Recovery ROI
                </Button>
              </a>
            </div>

            {/* Micro Validation Metrics */}
            <div className="mt-12 pt-8 border-t border-zinc-200 grid grid-cols-3 gap-6 text-left">
              <div>
                <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">38.4%</div>
                <div className="text-xs text-slate-500 mt-1 font-mono">Dormant Recall Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">$185</div>
                <div className="text-xs text-slate-500 mt-1 font-mono">Avg. Chair Production</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-sky-600 tracking-tight">&lt; 3 Min</div>
                <div className="text-xs text-slate-500 mt-1 font-mono">Median Booking Speed</div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Interactive ROI Calculator */}
        <section id="calculator" className="py-16 bg-white border-y border-zinc-200 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <div className="text-xs font-mono text-sky-600 uppercase tracking-wider font-semibold">
                  Financial Performance Model
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                  Hygiene Chair Production & ROI Calculator
                </h2>
                <p className="text-sm text-slate-600 mt-2 max-w-xl">
                  Simulate chair recovery revenue based on your practice's active patient roster.
                  Calculated using standard ADA preventative hygiene metrics ($185/seat).
                </p>
              </div>
              <div className="mt-4 md:mt-0 font-mono text-xs text-slate-500">
                Formula: $600 Base + ($20 × Confirmed Chairs)
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Sliders Input Panel */}
              <div className="lg:col-span-6 bg-zinc-50 border border-zinc-200 rounded-xl p-6 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider font-mono">
                      Active Patient Base
                    </label>
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {patientBase.toLocaleString()} Patients
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="100"
                    value={patientBase}
                    onChange={(e) => setPatientBase(parseInt(e.target.value, 10))}
                    className="w-full accent-slate-900 cursor-pointer h-2 bg-zinc-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] text-zinc-500 font-mono mt-1">
                    <span>500 Solo</span>
                    <span>2,500 Group</span>
                    <span>5,000 Multi-Location</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider font-mono">
                      Overdue Hygiene Percentage (&gt;6 Months)
                    </label>
                    <span className="font-mono text-sm font-bold text-slate-900">{overduePercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={overduePercentage}
                    onChange={(e) => setOverduePercentage(parseInt(e.target.value, 10))}
                    className="w-full accent-slate-900 cursor-pointer h-2 bg-zinc-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] text-zinc-500 font-mono mt-1">
                    <span>10% Low Latency</span>
                    <span>30% Industry Average</span>
                    <span>60% High Dormancy</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-200 space-y-2 text-xs font-mono text-slate-600">
                  <div className="flex justify-between">
                    <span>Overdue Chart Pool:</span>
                    <strong className="text-slate-900">{overduePatients} patients</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Projected Monthly Confirmed Bookings:</span>
                    <strong className="text-sky-700">{monthlyReactivatedChairs} chairs/mo</strong>
                  </div>
                </div>
              </div>

              {/* Output Breakdown Card */}
              <div className="lg:col-span-6 bg-[#0F172A] text-white rounded-xl p-8 border border-slate-800 shadow-sm">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Monthly Net Clinical Impact
                </div>

                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-4xl font-bold font-mono tracking-tight text-white">
                    {formatCurrency(netPracticeGain)}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    +{roiMultiplier}x Net Return
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Net profit after all DentAgent fees</div>

                <div className="mt-6 pt-6 border-t border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Recovered Hygiene Production (35 chairs × $185):</span>
                    <span className="text-white font-semibold">{formatCurrency(grossProductionUnlocked)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>DentAgent Base Retainer:</span>
                    <span className="text-slate-400">-$600.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Confirmed Chair Commission (${20} × {monthlyReactivatedChairs}):</span>
                    <span className="text-slate-400">-${monthlyReactivatedChairs * 20}.00</span>
                  </div>
                  <div className="pt-3 border-t border-slate-700 flex justify-between font-bold text-sm">
                    <span className="text-sky-400">Total Practice Net Gain / Month:</span>
                    <span className="text-emerald-400">{formatCurrency(netPracticeGain)}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href="/login">
                    <Button variant="teal" size="sm" className="w-full text-xs font-mono uppercase tracking-wider">
                      Activate Recall Engine for Practice
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Two-Way SMS Dialogue Simulation */}
        <section id="interactive-sms" className="py-16 px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-mono text-sky-600 uppercase tracking-wider font-semibold">
              Live Clinical Dialogue Trace
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Context-Aware Two-Way SMS Recall
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Patients respond to human tone. DentAgent AI detects insurance questions, scheduling preferences,
              and locks in chair times without front-desk manual effort.
            </p>
          </div>

          <div className="max-w-xl mx-auto bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Phone Header */}
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold">
                  BS
                </div>
                <div>
                  <div className="text-xs font-semibold text-white tracking-tight">BrightSmile Dental Care</div>
                  <div className="text-[10px] text-slate-400 font-mono">+1 (555) 234-5678</div>
                </div>
              </div>
              <Badge variant="emerald" className="text-[10px]">
                AI Auto-Pilot
              </Badge>
            </div>

            {/* SMS Message Feed */}
            <div className="p-5 space-y-4 bg-zinc-50/70 text-xs font-sans">
              {/* Outbound AI */}
              <div className="flex flex-col items-start max-w-[85%]">
                <div className="text-[10px] font-mono text-slate-400 mb-1">DentAgent AI • 10:14 AM</div>
                <div className="bg-white border border-zinc-200 text-slate-800 rounded-xl rounded-tl-sm p-3.5 shadow-sm leading-relaxed">
                  Hi Marcus, this is BrightSmile Dental Care. Dr. Chen noticed you are 7 months overdue for your preventative hygiene cleaning. We have slots this Tuesday at 10am or Thursday at 2pm. Would either work for you?
                </div>
              </div>

              {/* Inbound Patient */}
              <div className="flex flex-col items-end max-w-[85%] ml-auto">
                <div className="text-[10px] font-mono text-slate-400 mb-1">Marcus Vance • 10:18 AM</div>
                <div className="bg-[#0F172A] text-white rounded-xl rounded-tr-sm p-3.5 shadow-sm leading-relaxed">
                  Hi! Yes, Tuesday at 10am works great. Does Delta Dental cover the full visit?
                </div>
              </div>

              {/* Outbound AI Confirmation */}
              <div className="flex flex-col items-start max-w-[85%]">
                <div className="text-[10px] font-mono text-slate-400 mb-1">DentAgent AI • 10:19 AM</div>
                <div className="bg-white border border-zinc-200 text-slate-800 rounded-xl rounded-tl-sm p-3.5 shadow-sm leading-relaxed">
                  Perfect! Tuesday at 10:00 AM is reserved with Sarah, RDH. Yes, Delta Dental Premier typically covers routine cleanings at 100%. See you then!
                </div>
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Chair Confirmed: Oct 28 @ 10:00 AM ($20 fee tracked)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Transparent Dual-Tier Commercial Pricing */}
        <section id="pricing" className="py-16 bg-white border-t border-zinc-200 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-12">
              <div className="text-xs font-mono text-sky-600 uppercase tracking-wider font-semibold">
                Transparent Dual-Tier Pricing
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                Aligned with Your Practice Chair Growth
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Predictable software base plus a modest success fee only when a patient sits in your chair.
              </p>
            </div>

            <div className="max-w-md mx-auto bg-zinc-50 border border-zinc-200 rounded-2xl p-8 shadow-sm">
              <div className="flex justify-between items-center pb-6 border-b border-zinc-200">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Commercial Practice Plan</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Multi-Hygienist Clinic License</p>
                </div>
                <Badge variant="teal" className="text-xs font-mono">
                  Full Suite
                </Badge>
              </div>

              <div className="py-6 border-b border-zinc-200">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold font-mono text-slate-900">$600</span>
                  <span className="text-xs text-slate-500 font-mono">/month base</span>
                </div>
                <div className="mt-2 text-sm font-semibold text-sky-700 font-mono">
                  + $20 per confirmed chair booking
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  No hidden per-SMS charges. Unlimited automated recall workflows, multi-hygienist calendar sync, and live receptionist takeover.
                </p>
              </div>

              <div className="py-6 space-y-3 text-xs text-slate-700">
                {[
                  'Automated 6, 9, and 12-month recall cadences',
                  'Context-aware two-way SMS engine (OpenAI & Twilio)',
                  'Live receptionist SMS takeover & inbox simulator',
                  'Itemized monthly billing statements with chair breakdown',
                  'Staff role-based access (Owner, Hygienist, Receptionist)',
                  'Email OTP 2-factor authentication security'
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link href="/login">
                  <Button className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-mono text-xs uppercase tracking-wider">
                    Sign In to Practice Portal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-teal flex items-center justify-center text-white font-bold text-xs">
              D
            </div>
            <span className="text-white font-semibold">DentAgent AI</span>
            <span className="text-slate-500">— Automated Patient Re-Activation & Hygiene Booking Platform</span>
          </div>

          <div className="text-slate-500 font-mono">
            Commercial Dual-Monetization Architecture • HIPAA Certified Security
          </div>
        </div>
      </footer>
    </div>
  );
}
