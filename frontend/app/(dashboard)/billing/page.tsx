'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  DollarSign,
  TrendingUp,
  Download,
  CreditCard,
  CheckCircle2,
  Calendar,
  Building2,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { billingApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

export default function BillingPage() {
  const { user } = useAppStore();
  const [overview, setOverview] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const loadBillingData = async () => {
    setIsLoading(true);
    try {
      const [ovRes, invRes] = await Promise.all([
        billingApi.getOverview(),
        billingApi.getInvoices()
      ]);
      setOverview(ovRes.data.data);
      setInvoices(invRes.data.data || []);
    } catch (err) {
      console.error('Failed to load billing data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  const handlePayInvoice = async (invoiceId: string) => {
    try {
      await billingApi.payInvoice(invoiceId);
      loadBillingData();
      if (selectedInvoice && selectedInvoice._id === invoiceId) {
        setSelectedInvoice({ ...selectedInvoice, status: 'PAID' });
      }
    } catch (err) {
      alert('Payment processing error');
    }
  };

  const metrics = overview?.currentMetrics || {
    confirmedBookingsCount: 24,
    baseFee: 600,
    commissionTotal: 480,
    currentAccruedTotal: 1080,
    hygieneProductionGenerated: 4440,
    netPracticeProfit: 3360,
    roiMultiplier: '4.1x'
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            Commercial Dual-Tier Monetization
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Practice Billing & Statement Audit
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-mono">
            $600/month flat software base + $20 per confirmed chair booking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="emerald" className="text-xs font-mono py-1 px-2.5">
            ACH Auto-Debit Active (Chase ****4912)
          </Badge>
        </div>
      </div>

      {/* Dual-Tier Revenue Real-time Tally Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tier 1: Fixed Retainer */}
        <Card>
          <CardHeader className="py-3 px-4 bg-zinc-50 border-b border-zinc-200">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-semibold text-slate-700">TIER 1 • BASE RETAINER</span>
              <span className="text-[10px] font-mono text-slate-500">MONTHLY FLAT</span>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="text-3xl font-bold font-mono text-slate-900 tracking-tight">$600.00</div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Covers full cloud platform, OpenAI RAG models, two-way SMS pipelines, and practice calendar integrations.
            </p>
            <div className="mt-4 pt-3 border-t border-zinc-100 text-[11px] font-mono text-slate-500">
              Next billing date: 1st of next month
            </div>
          </CardContent>
        </Card>

        {/* Tier 2: Success Chair Fee */}
        <Card>
          <CardHeader className="py-3 px-4 bg-zinc-50 border-b border-zinc-200">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-semibold text-slate-700">TIER 2 • SUCCESS CHAIR FEE</span>
              <span className="text-[10px] font-mono text-sky-700 font-semibold">$20/CHAIR</span>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="text-3xl font-bold font-mono text-sky-700 tracking-tight">
              ${metrics.commissionTotal}.00
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Calculated on <strong>{metrics.confirmedBookingsCount} confirmed chair bookings</strong> re-activated by DentAgent AI this period.
            </p>
            <div className="mt-4 pt-3 border-t border-zinc-100 text-[11px] font-mono text-slate-500">
              Formula: {metrics.confirmedBookingsCount} chairs × $20.00
            </div>
          </CardContent>
        </Card>

        {/* Total Accrued Statement & Practice Net Gain */}
        <Card className="bg-[#0F172A] text-white border-slate-800">
          <CardHeader className="py-3 px-4 bg-slate-900/80 border-b border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-semibold text-slate-300">CURRENT CYCLE ESTIMATE</span>
              <Badge variant="emerald" className="text-[10px] py-0 px-1 font-mono">
                {metrics.roiMultiplier} ROI
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="text-3xl font-bold font-mono text-emerald-400 tracking-tight">
              ${metrics.currentAccruedTotal}.00
            </div>
            <div className="mt-3 space-y-1.5 font-mono text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Recovered Chair Revenue:</span>
                <span className="text-white font-semibold">{formatCurrency(metrics.hygieneProductionGenerated)}</span>
              </div>
              <div className="flex justify-between">
                <span>DentAgent Dual-Tier Fee:</span>
                <span className="text-slate-400">-${metrics.currentAccruedTotal}.00</span>
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between font-bold">
                <span className="text-sky-400">Net Clinic Profit:</span>
                <span className="text-emerald-400">{formatCurrency(metrics.netPracticeProfit)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historical Monthly Invoices Table */}
      <Card>
        <CardHeader className="py-3 px-4 flex items-center justify-between">
          <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            Itemized Monthly Invoices & Statements
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 font-mono text-slate-600">
                <th className="py-2.5 px-4 font-semibold">INVOICE #</th>
                <th className="py-2.5 px-4 font-semibold">BILLING CYCLE</th>
                <th className="py-2.5 px-4 font-semibold">BASE RETAINER</th>
                <th className="py-2.5 px-4 font-semibold">CONFIRMED CHAIRS</th>
                <th className="py-2.5 px-4 font-semibold">COMMISSION ($20)</th>
                <th className="py-2.5 px-4 font-semibold">TOTAL AMOUNT</th>
                <th className="py-2.5 px-4 font-semibold">STATUS</th>
                <th className="py-2.5 px-4 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-slate-400 font-mono text-xs">
                    No historical invoices generated yet.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-zinc-50/70 transition-colors font-mono">
                    <td className="py-3 px-4 font-semibold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 text-slate-700">
                      {inv.month}/{inv.year}
                    </td>
                    <td className="py-3 px-4 text-slate-700">${inv.baseFee}.00</td>
                    <td className="py-3 px-4 text-slate-700">{inv.confirmedBookingsCount} chairs</td>
                    <td className="py-3 px-4 text-slate-700">${inv.commissionTotal}.00</td>
                    <td className="py-3 px-4 font-bold text-slate-900">${inv.totalAmount}.00</td>
                    <td className="py-3 px-4">
                      <Badge variant={inv.status === 'PAID' ? 'emerald' : 'amber'} className="text-[10px]">
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedInvoice(inv)}
                        className="h-7 text-xs px-2"
                      >
                        View Statement
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Itemized Statement Preview Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Clinical Invoice ${selectedInvoice.invoiceNumber}`}
          description={`Period: ${selectedInvoice.month}/${selectedInvoice.year}`}
          maxWidth="lg"
        >
          <div className="space-y-6 text-xs font-mono">
            {/* Practice and Vendor Header */}
            <div className="flex justify-between items-start pb-4 border-b border-zinc-200">
              <div>
                <div className="font-bold text-sm text-slate-900">DentAgent AI Technologies Inc.</div>
                <div className="text-slate-500 text-[11px]">HIPAA Certified Healthcare Billing</div>
                <div className="text-slate-500 text-[11px]">New York, NY 10017</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900">Billed To:</div>
                <div className="text-slate-700">{user?.practice?.practiceName || 'BrightSmile Dental Care'}</div>
                <div className="text-slate-500 text-[11px]">Due Date: {formatDate(selectedInvoice.dueDate)}</div>
              </div>
            </div>

            {/* Line items table */}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-slate-500 text-[11px]">
                  <th className="py-2">DESCRIPTION</th>
                  <th className="py-2 text-center">QTY</th>
                  <th className="py-2 text-right">UNIT PRICE</th>
                  <th className="py-2 text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {selectedInvoice.lineItems?.map((item: any, idx: number) => (
                  <tr key={idx} className="py-2 text-slate-800">
                    <td className="py-2 pr-2">{item.description}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">${item.unitPrice}.00</td>
                    <td className="py-2 text-right font-semibold">${item.amount}.00</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Block */}
            <div className="pt-3 border-t border-zinc-200 flex justify-end">
              <div className="w-64 space-y-1.5 text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Base Fee:</span>
                  <span>${selectedInvoice.baseFee}.00</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Chair Success Fees:</span>
                  <span>${selectedInvoice.commissionTotal}.00</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-zinc-300">
                  <span>Total Amount:</span>
                  <span>${selectedInvoice.totalAmount}.00</span>
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Status:</span>
                <Badge variant={selectedInvoice.status === 'PAID' ? 'emerald' : 'amber'}>
                  {selectedInvoice.status}
                </Badge>
              </div>

              <div className="flex gap-2">
                {selectedInvoice.status !== 'PAID' && (
                  <Button
                    variant="teal"
                    size="sm"
                    onClick={() => handlePayInvoice(selectedInvoice._id)}
                  >
                    Simulate ACH Debit ($ {selectedInvoice.totalAmount})
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Print / Download
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
