'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  User,
  Plus,
  Filter,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { appointmentApi, patientApi } from '@/lib/api';
import { formatDate, formatDateTime, formatPhone } from '@/lib/utils';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // New appointment modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [newApt, setNewApt] = useState({
    patientId: '',
    hygienistName: 'Sarah Jenkins, RDH',
    appointmentDate: '',
    durationMinutes: 60,
    notes: 'Hygiene Exam & Prophylaxis Cleaning'
  });

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const [aptRes, metRes] = await Promise.all([
        appointmentApi.getAppointments({ status: statusFilter !== 'ALL' ? statusFilter : undefined }),
        appointmentApi.getMetrics()
      ]);
      setAppointments(aptRes.data.data || []);
      setMetrics(metRes.data.data || null);
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

  const openNewModal = async () => {
    try {
      const res = await patientApi.getPatients();
      setPatients(res.data.data || []);
      setIsNewModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await appointmentApi.createAppointment({
        ...newApt,
        bookingChannel: 'STAFF_MANUAL'
      });
      setIsNewModalOpen(false);
      loadAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create appointment');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await appointmentApi.updateStatus(id, newStatus);
      loadAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            Clinical Calendar & Chair Booking
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Confirmed Hygiene Chairs
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-mono">
            Directly re-activated and booked via DentAgent AI two-way SMS agent
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={openNewModal} className="bg-[#0F172A] text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Book Hygiene Chair
        </Button>
      </div>

      {/* Chair Utilization & Commission Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs font-mono text-slate-500 uppercase">Confirmed Chairs</div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {metrics?.totalConfirmed ?? appointments.filter((a) => a.status === 'CONFIRMED').length}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">Active on schedule</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-xs font-mono text-slate-500 uppercase">Completed Visits</div>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
              {metrics?.totalCompleted ?? appointments.filter((a) => a.status === 'COMPLETED').length}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">Hygiene production realized</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-xs font-mono text-slate-500 uppercase">Hygiene Production</div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              ${metrics?.estimatedHygieneProduction?.toLocaleString() ?? '4,440'}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">At $185 ADA avg. chair value</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F172A] text-white border-slate-800">
          <CardContent className="p-4">
            <div className="text-xs font-mono text-slate-400 uppercase">Success Commission Accrued</div>
            <div className="text-2xl font-bold font-mono text-sky-400 mt-1">
              ${metrics?.commissionAccrued?.toLocaleString() ?? '480'}.00
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">$20 per confirmed chair</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-slate-400">Filter Status:</span>
        {['ALL', 'CONFIRMED', 'COMPLETED', 'PENDING_CONFIRMATION', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium border ${
              statusFilter === st
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Appointments Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 font-mono text-slate-600">
                <th className="py-2.5 px-4 font-semibold">PATIENT</th>
                <th className="py-2.5 px-4 font-semibold">DATE & TIME</th>
                <th className="py-2.5 px-4 font-semibold">HYGIENIST</th>
                <th className="py-2.5 px-4 font-semibold">BOOKING CHANNEL</th>
                <th className="py-2.5 px-4 font-semibold">STATUS</th>
                <th className="py-2.5 px-4 font-semibold">COMMISSION ($20)</th>
                <th className="py-2.5 px-4 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 font-mono">
                    Loading hygiene chair appointments...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 font-mono">
                    No appointments found matching filter.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => {
                  const patient = apt.patientId;
                  const isConfirmed = apt.status === 'CONFIRMED';
                  const isCompleted = apt.status === 'COMPLETED';

                  return (
                    <tr key={apt._id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {patient ? `${patient.firstName} ${patient.lastName}` : 'Marcus Vance'}
                        <div className="text-[10px] text-slate-400 font-mono">
                          {patient?.phone ? formatPhone(patient.phone) : '+1 (555) 981-1001'}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800">
                        {formatDateTime(apt.appointmentDate)}
                        <div className="text-[10px] text-slate-400 font-mono">{apt.durationMinutes} min chair</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {apt.hygienistName || 'Sarah Jenkins, RDH'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200">
                          {apt.bookingChannel === 'SMS_AI_AUTOMATED' ? 'AI 2-Way SMS' : 'Staff Manual'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            isConfirmed ? 'emerald' : isCompleted ? 'slate' : 'amber'
                          }
                          className="text-[10px]"
                        >
                          {apt.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        ${apt.commissionAmount || 20}.00
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        {isConfirmed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(apt._id, 'COMPLETED')}
                            className="h-6 text-[10px] px-2 text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                          >
                            Mark Complete
                          </Button>
                        )}
                        {!isCompleted && apt.status !== 'CANCELLED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(apt._id, 'CANCELLED')}
                            className="h-6 text-[10px] px-2 text-rose-700 hover:bg-rose-50"
                          >
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Book Hygiene Chair Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Manual Hygiene Chair Reservation"
        description="Schedule a patient hygiene appointment and link to chair calendar."
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 font-mono mb-1">
              Select Patient
            </label>
            <select
              required
              value={newApt.patientId}
              onChange={(e) => setNewApt({ ...newApt, patientId: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900"
            >
              <option value="">Choose patient...</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.firstName} {p.lastName} — {p.phone} ({p.overdueMonths} mo overdue)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 font-mono mb-1">
              Assigned Hygienist
            </label>
            <input
              type="text"
              required
              value={newApt.hygienistName}
              onChange={(e) => setNewApt({ ...newApt, hygienistName: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 font-mono mb-1">
              Date and Time
            </label>
            <input
              type="datetime-local"
              required
              value={newApt.appointmentDate}
              onChange={(e) => setNewApt({ ...newApt, appointmentDate: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 font-mono mb-1">
              Chair Duration (Minutes)
            </label>
            <input
              type="number"
              value={newApt.durationMinutes}
              onChange={(e) => setNewApt({ ...newApt, durationMinutes: parseInt(e.target.value, 10) })}
              className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900 font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-[#0F172A]">
              Confirm Chair Reservation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
