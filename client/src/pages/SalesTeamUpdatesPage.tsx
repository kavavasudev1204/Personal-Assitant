import React from 'react';
import { Megaphone, Download } from 'lucide-react';

export const SalesTeamUpdatesPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Megaphone className="w-6 h-6 text-emerald-600" />
            <span>Sales Team Update Generator</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Generate filtered summaries to update field sales reps.</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center space-x-1.5">
            <Download className="w-4 h-4" />
            <span>Export Report (Excel/PDF)</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 text-sm">Report Filter Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Date Range</label>
            <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <option>Last 7 Days</option>
              <option>This Month</option>
              <option>Custom Range</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Sales Person</label>
            <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <option>All Representatives</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
            <input placeholder="e.g. Ahmedabad" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Lead Status</label>
            <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <option>All Statuses</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
