'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  User,
  Phone,
  Clock,
  Sparkles,
  Bot,
  Save,
  CheckCircle2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { tenantApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';

export default function SettingsPage() {
  const { user } = useAppStore();
  const [formData, setFormData] = useState({
    practiceName: 'BrightSmile Dental Care',
    phoneNumber: '+1 (555) 234-5678',
    street: '450 Lexington Ave, Suite 1400',
    city: 'New York',
    state: 'NY',
    zipCode: '10017',
    timeZone: 'America/New_York',
    autoPilotEnabled: true,
    hygienists: 'Sarah Jenkins, RDH\nMichael Vance, RDH\nElena Rostova, RDH',
    customPromptInstructions: 'Be welcoming, clinically rigorous, and emphasize gum health preventative hygiene. Offer Tuesday 10am and Thursday 2pm slots.',
    operatingHoursStart: '08:00',
    operatingHoursEnd: '17:00'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    tenantApi.getProfile().then((res) => {
      const data = res.data?.data;
      if (data) {
        setFormData({
          practiceName: data.practiceName || 'BrightSmile Dental Care',
          phoneNumber: data.phoneNumber || '+1 (555) 234-5678',
          street: data.address?.street || '450 Lexington Ave, Suite 1400',
          city: data.address?.city || 'New York',
          state: data.address?.state || 'NY',
          zipCode: data.address?.zipCode || '10017',
          timeZone: data.timeZone || 'America/New_York',
          autoPilotEnabled: data.aiConfig?.autoPilotEnabled ?? true,
          hygienists: data.aiConfig?.hygienistNames?.join('\n') || 'Sarah Jenkins, RDH\nMichael Vance, RDH',
          customPromptInstructions: data.aiConfig?.customPromptInstructions || '',
          operatingHoursStart: data.aiConfig?.operatingHours?.start || '08:00',
          operatingHoursEnd: data.aiConfig?.operatingHours?.end || '17:00'
        });
      }
    }).catch((e) => console.log('Using default settings profile'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSavedMessage(null);

    try {
      await tenantApi.updateProfile({
        practiceName: formData.practiceName,
        phoneNumber: formData.phoneNumber,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        timeZone: formData.timeZone,
        aiConfig: {
          autoPilotEnabled: formData.autoPilotEnabled,
          hygienistNames: formData.hygienists.split('\n').filter(Boolean),
          customPromptInstructions: formData.customPromptInstructions,
          operatingHours: {
            start: formData.operatingHoursStart,
            end: formData.operatingHoursEnd
          }
        }
      });
      setSavedMessage('Practice configuration & AI agent prompt updated successfully.');
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">
          Practice System Settings
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
          Clinic Profile & AI Agent Tuning
        </h2>
        <p className="text-xs text-slate-600 mt-1 font-mono">
          Configure operating hours, hygienist availability, and OpenAI RAG clinical prompt parameters
        </p>
      </div>

      {savedMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{savedMessage}</span>
          </div>
          <button onClick={() => setSavedMessage(null)} className="text-xs font-semibold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Practice Identity */}
        <Card>
          <CardHeader className="py-3 px-5 bg-zinc-50 border-b border-zinc-200">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-500" />
              Practice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-mono mb-1">Clinic Name</label>
                <input
                  type="text"
                  required
                  value={formData.practiceName}
                  onChange={(e) => setFormData({ ...formData, practiceName: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-mono mb-1">Clinic SMS Phone Number</label>
                <input
                  type="text"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 font-mono mb-1">Street Address</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-mono mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-mono mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-mono mb-1">Zip Code</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Agent Configuration & RAG Tuning */}
        <Card>
          <CardHeader className="py-3 px-5 bg-zinc-50 border-b border-zinc-200">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Bot className="w-4 h-4 text-sky-600" />
              DentAgent AI Re-Activation Brain Tuning
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 bg-zinc-50/50">
              <div>
                <div className="text-xs font-semibold text-slate-900">Global Auto-Pilot Mode</div>
                <div className="text-[11px] text-slate-500 font-mono">
                  When enabled, incoming patient SMS messages are automatically analyzed and responded to.
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.autoPilotEnabled}
                onChange={(e) => setFormData({ ...formData, autoPilotEnabled: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-300 accent-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 font-mono mb-1">
                Custom Clinical Instructions & Doctor Tone Rules
              </label>
              <textarea
                rows={3}
                value={formData.customPromptInstructions}
                onChange={(e) => setFormData({ ...formData, customPromptInstructions: e.target.value })}
                className="w-full p-2.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 font-mono mb-1">
                Active Hygienist Roster (One per line)
              </label>
              <textarea
                rows={3}
                value={formData.hygienists}
                onChange={(e) => setFormData({ ...formData, hygienists: e.target.value })}
                className="w-full p-2.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-mono mb-1">Operating Hours Start</label>
                <input
                  type="time"
                  value={formData.operatingHoursStart}
                  onChange={(e) => setFormData({ ...formData, operatingHoursStart: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-mono mb-1">Operating Hours End</label>
                <input
                  type="time"
                  value={formData.operatingHoursEnd}
                  onChange={(e) => setFormData({ ...formData, operatingHoursEnd: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="bg-[#0F172A]">
            <Save className="w-4 h-4 mr-1.5" />
            Save Practice Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
