'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Plus,
  Upload,
  Send,
  MessageSquare,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { patientApi } from '@/lib/api';
import { formatDate, formatPhone } from '@/lib/utils';

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [minOverdue, setMinOverdue] = useState<number | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New Patient Form
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    lastHygieneDate: '',
    insuranceCarrier: 'Delta Dental PPO',
    notes: ''
  });

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const res = await patientApi.getPatients({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        minOverdue,
        search: search || undefined
      });
      setPatients(res.data.data || []);
    } catch (err) {
      console.error('Failed to load patients', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [statusFilter, minOverdue]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPatients();
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === patients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(patients.map((p) => p._id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await patientApi.createPatient(newPatient);
      setIsAddModalOpen(false);
      setNewPatient({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        lastHygieneDate: '',
        insuranceCarrier: 'Delta Dental PPO',
        notes: ''
      });
      loadPatients();
      setActionMessage('Patient created and added to recall registry.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create patient');
    }
  };

  const handleBulkImportMock = async () => {
    const mockList = [
      { firstName: 'Julian', lastName: 'Mercer', phone: '+155589001', lastHygieneDate: '2024-01-10', insuranceCarrier: 'Delta Dental' },
      { firstName: 'Elena', lastName: 'Gomez', phone: '+155589002', lastHygieneDate: '2023-11-05', insuranceCarrier: 'MetLife' },
      { firstName: 'Samuel', lastName: 'Drake', phone: '+155589003', lastHygieneDate: '2024-03-12', insuranceCarrier: 'Cigna' },
      { firstName: 'Victoria', lastName: 'Sloan', phone: '+155589004', lastHygieneDate: '2023-08-20', insuranceCarrier: 'Guardian' }
    ];

    try {
      await patientApi.bulkImport(mockList);
      setIsBulkModalOpen(false);
      loadPatients();
      setActionMessage('Imported 4 overdue patient records from PMS CSV.');
    } catch (err) {
      alert('Bulk import failed');
    }
  };

  const handleDispatchSelected = async () => {
    try {
      const res = await patientApi.triggerReactivation({ patientIds: selectedIds });
      setIsDispatchModalOpen(false);
      setSelectedIds([]);
      loadPatients();
      setActionMessage(`Dispatched SMS recall to ${res.data.dispatchedCount} selected patients.`);
    } catch (err) {
      alert('Failed to trigger recall sequence');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            Patient Chart Audit
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Overdue Hygiene Patient Registry
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-mono">
            {patients.length} patients requiring preventative dental cleanings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsBulkModalOpen(true)} className="text-xs">
            <Upload className="w-3.5 h-3.5 mr-1" />
            Import PMS CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)} className="bg-[#0F172A] text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Patient
          </Button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-xs font-semibold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Urgency Cadence Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto font-mono text-xs">
              <button
                onClick={() => setMinOverdue(undefined)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  minOverdue === undefined ? 'bg-slate-900 text-white' : 'bg-zinc-100 text-slate-700 hover:bg-zinc-200'
                }`}
              >
                All Overdue
              </button>
              <button
                onClick={() => setMinOverdue(6)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  minOverdue === 6 ? 'bg-slate-900 text-white' : 'bg-zinc-100 text-slate-700 hover:bg-zinc-200'
                }`}
              >
                6+ Months
              </button>
              <button
                onClick={() => setMinOverdue(9)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  minOverdue === 9 ? 'bg-slate-900 text-white' : 'bg-zinc-100 text-slate-700 hover:bg-zinc-200'
                }`}
              >
                9+ Months
              </button>
              <button
                onClick={() => setMinOverdue(12)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  minOverdue === 12 ? 'bg-slate-900 text-white' : 'bg-zinc-100 text-slate-700 hover:bg-zinc-200'
                }`}
              >
                12+ Months Dormant
              </button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="w-full md:w-72 relative">
              <input
                type="text"
                placeholder="Search name, phone, insurance..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
            </form>
          </div>

          {/* Status Chips */}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 text-xs font-mono">
            <span className="text-slate-400">Status:</span>
            {['ALL', 'OVERDUE', 'ENGAGED', 'SCHEDULED', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                  statusFilter === st
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Batch Selection Banner */}
      {selectedIds.length > 0 && (
        <div className="bg-[#0F172A] text-white p-3.5 rounded-lg flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="font-bold text-sky-400">{selectedIds.length}</span>
            <span>patients selected for automated recall</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 text-xs h-7"
            >
              Clear
            </Button>
            <Button
              variant="teal"
              size="sm"
              onClick={() => setIsDispatchModalOpen(true)}
              className="text-xs h-7"
            >
              <Send className="w-3 h-3 mr-1" />
              Dispatch SMS Recall
            </Button>
          </div>
        </div>
      )}

      {/* Data-Dense Patients Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 font-mono text-slate-600">
                <th className="py-2.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={patients.length > 0 && selectedIds.length === patients.length}
                    onChange={toggleSelectAll}
                    className="rounded border-zinc-300 accent-slate-900"
                  />
                </th>
                <th className="py-2.5 px-4 font-semibold">PATIENT NAME</th>
                <th className="py-2.5 px-4 font-semibold">PHONE</th>
                <th className="py-2.5 px-4 font-semibold">LAST HYGIENE</th>
                <th className="py-2.5 px-4 font-semibold">OVERDUE</th>
                <th className="py-2.5 px-4 font-semibold">INSURANCE</th>
                <th className="py-2.5 px-4 font-semibold">STATUS</th>
                <th className="py-2.5 px-4 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 font-mono">
                    Loading clinical patient records...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 font-mono">
                    No overdue patients match your search filter.
                  </td>
                </tr>
              ) : (
                patients.map((p) => {
                  const isSelected = selectedIds.includes(p._id);

                  let statusVariant: any = 'amber';
                  if (p.status === 'SCHEDULED') statusVariant = 'emerald';
                  else if (p.status === 'ENGAGED') statusVariant = 'teal';
                  else if (p.status === 'COMPLETED') statusVariant = 'slate';

                  return (
                    <tr
                      key={p._id}
                      className={`hover:bg-zinc-50/70 transition-colors ${
                        isSelected ? 'bg-sky-50/40' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(p._id)}
                          className="rounded border-zinc-300 accent-slate-900"
                        />
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {p.firstName} {p.lastName}
                        {p.email && <div className="text-[10px] text-slate-400 font-normal">{p.email}</div>}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-700">
                        {formatPhone(p.phone)}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">
                        {formatDate(p.lastHygieneDate)}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-800">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] ${
                            p.overdueMonths >= 12
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : p.overdueMonths >= 9
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-zinc-100 text-zinc-800'
                          }`}
                        >
                          {p.overdueMonths} mo
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 truncate max-w-[150px]">
                        {p.insuranceCarrier || 'Delta Dental PPO'}
                      </td>
                      <td className="py-2.5 px-4">
                        <Badge variant={statusVariant} className="text-[10px]">
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <Link href={`/inbox`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-sky-700">
                            <MessageSquare className="w-3.5 h-3.5 mr-1" />
                            SMS
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Patient Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Overdue Hygiene Patient"
        description="Enter patient details to enroll in automated SMS re-activation."
      >
        <form onSubmit={handleCreatePatient} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 font-mono mb-1">First Name</label>
              <input
                type="text"
                required
                value={newPatient.firstName}
                onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                placeholder="Marcus"
                className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 font-mono mb-1">Last Name</label>
              <input
                type="text"
                required
                value={newPatient.lastName}
                onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                placeholder="Vance"
                className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 font-mono mb-1">Mobile Phone Number</label>
            <input
              type="tel"
              required
              value={newPatient.phone}
              onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
              placeholder="+1 (555) 981-1001"
              className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 font-mono mb-1">Email Address</label>
            <input
              type="email"
              value={newPatient.email}
              onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
              placeholder="marcus.v@example.com"
              className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 font-mono mb-1">Last Hygiene Visit Date</label>
            <input
              type="date"
              required
              value={newPatient.lastHygieneDate}
              onChange={(e) => setNewPatient({ ...newPatient, lastHygieneDate: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 font-mono mb-1">Dental Insurance Carrier</label>
            <input
              type="text"
              value={newPatient.insuranceCarrier}
              onChange={(e) => setNewPatient({ ...newPatient, insuranceCarrier: e.target.value })}
              placeholder="Delta Dental Premier"
              className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-[#0F172A]">
              Save to Overdue Registry
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk CSV Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Import Practice Management System (PMS) Data"
        description="DentAgent integrates with Dentrix, Eaglesoft, and OpenDental exports."
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 border-2 border-dashed border-zinc-300 rounded-lg text-center hover:bg-zinc-50 transition-colors cursor-pointer">
            <Upload className="w-6 h-6 mx-auto text-zinc-400 mb-1" />
            <div className="font-semibold text-slate-800">Upload CSV or PMS Export File</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">Required fields: firstName, lastName, phone, lastHygieneDate</div>
          </div>

          <div className="text-center text-slate-500 font-mono text-[11px]">— OR QUICK DEMO SIMULATION —</div>

          <Button variant="outline" size="sm" onClick={handleBulkImportMock} className="w-full font-mono text-xs">
            Import 4 Realistic Overdue Hygiene Patients (Instant Test Data)
          </Button>
        </div>
      </Modal>

      {/* Dispatch Selected Modal */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title={`Confirm Re-Activation SMS Dispatch`}
        description={`Targeting ${selectedIds.length} overdue patients.`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            DentAgent AI will send an individualized two-way SMS to each of the {selectedIds.length} selected patients referencing Dr. Chen and open hygiene slots this week.
          </p>

          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg font-mono text-[11px] space-y-1">
            <div className="text-slate-500">Sample SMS Preview:</div>
            <div className="text-slate-800 italic">
              "Hi [First Name], this is BrightSmile Dental Care. Dr. Chen noticed you are overdue for your routine preventative cleaning. We have slots this Tuesday at 10am or Thursday at 2pm. Would either time work?"
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsDispatchModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="teal" size="sm" onClick={handleDispatchSelected}>
              Send SMS Sequence
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
