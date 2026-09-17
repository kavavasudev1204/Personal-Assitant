import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Settings, Save, ShieldCheck } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [staleLeadDays, setStaleLeadDays] = useState(7);
  const [matchThreshold, setMatchThreshold] = useState(80);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/settings').then((res) => {
      if (res.data.success && res.data.settings) {
        setStaleLeadDays(res.data.settings.leadUpdateReminderDays || 7);
        setMatchThreshold(res.data.settings.duplicateMatchThreshold || 80);
      }
    });
  }, []);

  const handleSave = async () => {
    try {
      await api.put('/settings', {
        leadUpdateReminderDays: staleLeadDays,
        duplicateMatchThreshold: matchThreshold,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          <span>System & Assistant Settings</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">Configure automated rules, reminders, and duplicate detection thresholds.</p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Settings updated successfully!</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div>
          <label className="block font-bold text-slate-900 text-sm mb-1">
            Lead Update Reminder Threshold (Days)
          </label>
          <p className="text-xs text-slate-500 mb-2">
            If a lead has not been updated for this many days, flag it with "⚠️ Lead Requires Update" in Action Center.
          </p>
          <input
            type="number"
            value={staleLeadDays}
            onChange={(e) => setStaleLeadDays(Number(e.target.value))}
            className="w-48 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800"
          />
        </div>

        <div className="pt-4 border-t border-slate-100">
          <label className="block font-bold text-slate-900 text-sm mb-1">
            Duplicate Matching Threshold (%)
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Sensitivity algorithm for detecting potential duplicate company names and contact info.
          </p>
          <input
            type="number"
            value={matchThreshold}
            onChange={(e) => setMatchThreshold(Number(e.target.value))}
            className="w-48 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
