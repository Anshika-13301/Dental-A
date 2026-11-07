'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Bot,
  User,
  Send,
  Phone,
  Calendar,
  CheckCircle2,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Clock,
  Search,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { conversationApi } from '@/lib/api';
import { formatDateTime, formatRelativeTime, formatPhone } from '@/lib/utils';
import { getSocket } from '@/lib/socket';

export default function InboxPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [search, setSearch] = useState('');

  // Simulator Modal
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [simText, setSimText] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const res = await conversationApi.getConversations();
      const list = res.data.data || [];
      setConversations(list);
      if (list.length > 0 && !selectedConv) {
        setSelectedConv(list[0]);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const res = await conversationApi.getMessages(convId);
      setMessages(res.data.data || []);
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadConversations();

    const socket = getSocket();
    socket.on('message:received', (data) => {
      loadConversations();
      if (selectedConv && selectedConv._id === data.conversationId) {
        setMessages((prev) => [...prev, data.message]);
        scrollToBottom();
      }
    });

    socket.on('message:sent', (data) => {
      if (selectedConv && selectedConv._id === data.conversationId) {
        setMessages((prev) => [...prev, data.message]);
        scrollToBottom();
      }
    });

    return () => {
      socket.off('message:received');
      socket.off('message:sent');
    };
  }, []);

  useEffect(() => {
    if (selectedConv?._id) {
      loadMessages(selectedConv._id);
    }
  }, [selectedConv]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendManualReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConv) return;

    setIsSending(true);
    try {
      const res = await conversationApi.sendManualReply(selectedConv._id, replyText);
      setMessages((prev) => [...prev, res.data.data]);
      setReplyText('');
      scrollToBottom();
      loadConversations();
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleAutoPilot = async () => {
    if (!selectedConv) return;
    try {
      const res = await conversationApi.toggleAutoPilot(selectedConv._id);
      setSelectedConv({ ...selectedConv, autoPilot: res.data.data.autoPilot });
      loadConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulatePatientSMS = async (text: string) => {
    if (!selectedConv?.patientId?._id) return;

    setIsSimulating(true);
    try {
      const res = await conversationApi.simulateSMS(selectedConv.patientId._id, text);
      setIsSimModalOpen(false);
      setSimText('');
      loadMessages(selectedConv._id);
      loadConversations();
    } catch (err) {
      alert('Simulation failed');
    } finally {
      setIsSimulating(false);
    }
  };

  const applyTemplate = (template: string) => {
    const patientName = selectedConv?.patientId?.firstName || 'Marcus';
    const text = template.replace('{name}', patientName);
    setReplyText(text);
  };

  const filteredConversations = conversations.filter((c) => {
    const name = `${c.patientId?.firstName} ${c.patientId?.lastName}`.toLowerCase();
    const phone = (c.patientId?.phone || '').toLowerCase();
    return name.includes(search.toLowerCase()) || phone.includes(search.toLowerCase());
  });

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col max-w-7xl mx-auto space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            Patient Communication Gateway
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Two-Way SMS Patient Re-Activation Center
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {selectedConv && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSimModalOpen(true)}
              className="border-sky-300 text-sky-800 bg-sky-50/50 hover:bg-sky-50 text-xs font-mono"
            >
              <Bot className="w-3.5 h-3.5 mr-1 text-sky-600" />
              Simulate Inbound Patient SMS
            </Button>
          )}
        </div>
      </div>

      {/* Main Two-Panel SMS Interface */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        {/* Left Panel: Conversation Threads */}
        <div className="md:col-span-4 border-r border-zinc-200 flex flex-col h-full bg-zinc-50/50">
          {/* Search Box */}
          <div className="p-3 border-b border-zinc-200 bg-white">
            <div className="relative">
              <input
                type="text"
                placeholder="Search patient or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2 pointer-events-none" />
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-200/70">
            {isLoading ? (
              <div className="p-4 text-center text-xs text-slate-400 font-mono">Loading threads...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 font-mono">No conversation threads found.</div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConv?._id === conv._id;
                const patient = conv.patientId;

                return (
                  <div
                    key={conv._id}
                    onClick={() => setSelectedConv(conv)}
                    className={`p-3.5 cursor-pointer transition-colors text-xs ${
                      isSelected ? 'bg-white border-l-4 border-l-slate-900 shadow-sm' : 'hover:bg-zinc-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900 truncate">
                        {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {formatRelativeTime(conv.lastMessageAt)}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono truncate mb-1.5">
                      {conv.lastMessagePreview || 'Conversation initiated'}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-200/70 text-zinc-800">
                          {patient?.overdueMonths || 6} mo overdue
                        </span>
                        {conv.status === 'BOOKED' && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-semibold">
                            Booked
                          </span>
                        )}
                      </div>

                      {conv.autoPilot ? (
                        <span className="text-[10px] font-mono text-emerald-700 font-medium">Auto-Pilot</span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">Staff Mode</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Chat Stream & Reply Box */}
        <div className="md:col-span-8 flex flex-col h-full bg-white">
          {selectedConv ? (
            <>
              {/* Thread Header */}
              <div className="px-5 py-3 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    {selectedConv.patientId?.firstName?.[0] || 'P'}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-xs tracking-tight flex items-center gap-2">
                      <span>{selectedConv.patientId?.firstName} {selectedConv.patientId?.lastName}</span>
                      <span className="font-mono text-slate-500 text-[11px]">
                        {formatPhone(selectedConv.patientId?.phone)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Insurance: {selectedConv.patientId?.insuranceCarrier || 'Delta Dental'} • {selectedConv.patientId?.overdueMonths} Months Overdue
                    </div>
                  </div>
                </div>

                {/* Auto-Pilot Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-600">AI Auto-Pilot:</span>
                  <button
                    onClick={handleToggleAutoPilot}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold transition-colors ${
                      selectedConv.autoPilot
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-zinc-100 text-zinc-600 border border-zinc-300'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>{selectedConv.autoPilot ? 'ENABLED' : 'PAUSED'}</span>
                  </button>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-zinc-50/30 text-xs font-sans">
                {messages.map((m) => {
                  const isPatient = m.sender === 'PATIENT';
                  const isAI = m.sender === 'AI_AGENT';

                  return (
                    <div
                      key={m._id}
                      className={`flex flex-col ${isPatient ? 'items-end' : 'items-start'} max-w-[80%] ${
                        isPatient ? 'ml-auto' : ''
                      }`}
                    >
                      <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
                        <span>{isPatient ? 'Patient' : isAI ? 'DentAgent AI' : 'Receptionist'}</span>
                        <span>•</span>
                        <span>{formatDateTime(m.sentAt)}</span>
                      </div>

                      <div
                        className={`p-3.5 rounded-xl leading-relaxed shadow-sm ${
                          isPatient
                            ? 'bg-[#0F172A] text-white rounded-tr-sm'
                            : isAI
                            ? 'bg-white border border-zinc-200 text-slate-900 rounded-tl-sm'
                            : 'bg-sky-700 text-white rounded-tl-sm'
                        }`}
                      >
                        {m.body}
                      </div>

                      {m.aiMetadata?.intent === 'BOOKING_CONFIRMED' && (
                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Chair Confirmed ($20 success fee recorded)
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Template Picker */}
              <div className="px-4 py-2 border-t border-zinc-200 bg-white flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
                <span className="text-slate-400 text-[10px]">Templates:</span>
                <button
                  onClick={() => applyTemplate('Hi {name}, we have openings this Tuesday at 10am or Thursday at 2pm. Would either time suit you?')}
                  className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-slate-700 whitespace-nowrap"
                >
                  Offer Slots
                </button>
                <button
                  onClick={() => applyTemplate('Hi {name}, routine preventative cleanings are typically covered at 100% under your insurance plan.')}
                  className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-slate-700 whitespace-nowrap"
                >
                  Insurance Coverage
                </button>
                <button
                  onClick={() => applyTemplate('Your hygiene appointment is confirmed with Sarah, RDH. We look forward to seeing you!')}
                  className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-slate-700 whitespace-nowrap"
                >
                  Confirm Chair
                </button>
              </div>

              {/* Reply Input Bar */}
              <form onSubmit={handleSendManualReply} className="p-3 border-t border-zinc-200 bg-white flex gap-2">
                <input
                  type="text"
                  placeholder="Type manual receptionist SMS reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  isLoading={isSending}
                  className="bg-[#0F172A] text-xs h-9 px-4"
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  Send SMS
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-mono">
              Select a patient conversation thread to inspect messages.
            </div>
          )}
        </div>
      </div>

      {/* In-App Patient SMS Simulator Modal */}
      <Modal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        title="Simulate Inbound Patient SMS"
        description="Simulate what happens when this patient replies to DentAgent AI."
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 font-mono mb-1">
              Select Quick Test Scenario:
            </label>
            <div className="space-y-1.5 font-mono">
              <button
                type="button"
                onClick={() => setSimText('Yes, Tuesday at 10am works great for me!')}
                className="w-full text-left p-2 rounded border border-zinc-200 hover:border-slate-400 hover:bg-zinc-50 text-[11px]"
              >
                1. <strong>Confirm Slot:</strong> "Yes, Tuesday at 10am works great for me!"
              </button>
              <button
                type="button"
                onClick={() => setSimText('Does my Delta Dental insurance cover the cleaning?')}
                className="w-full text-left p-2 rounded border border-zinc-200 hover:border-slate-400 hover:bg-zinc-50 text-[11px]"
              >
                2. <strong>Insurance Inquiry:</strong> "Does my Delta Dental insurance cover the cleaning?"
              </button>
              <button
                type="button"
                onClick={() => setSimText("I am busy this week, can we do next month instead?")}
                className="w-full text-left p-2 rounded border border-zinc-200 hover:border-slate-400 hover:bg-zinc-50 text-[11px]"
              >
                3. <strong>Reschedule Cadence:</strong> "I am busy this week, can we do next month instead?"
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 font-mono mb-1">
              Or Custom Patient Text:
            </label>
            <textarea
              rows={3}
              value={simText}
              onChange={(e) => setSimText(e.target.value)}
              placeholder="Type simulated patient SMS message..."
              className="w-full p-2.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsSimModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="teal"
              size="sm"
              isLoading={isSimulating}
              onClick={() => handleSimulatePatientSMS(simText)}
            >
              Simulate Inbound SMS
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
