'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function PatientDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role === 'admin') {
      router.push('/login');
    } else {
      const stored = localStorage.getItem('userData');
      if (stored) setUserData(JSON.parse(stored));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-sky-400">Welcome to Patient Portal</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">Logged in as Patient</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-4 py-2 rounded font-semibold"
          >
            Logout
          </button>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
          <h2 className="text-lg font-semibold text-slate-200">Hygiene Appointment Booking</h2>
          <p className="text-xs text-slate-400">
            Select your preferred chair slot and insurance co-pay details will automatically populate.
          </p>

          <form className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Service Required</label>
              <select className="w-full bg-slate-700 border border-slate-600 rounded p-2.5 text-sm">
                <option>Regular Hygiene Exam & Cleaning</option>
                <option>Crown Procedure Checkup</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Preferred Date</label>
              <input type="date" className="w-full bg-slate-700 border border-slate-600 rounded p-2.5 text-sm" />
            </div>
            <button type="button" className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-6 rounded text-xs uppercase tracking-wider">
              Book Hygiene Chair
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}