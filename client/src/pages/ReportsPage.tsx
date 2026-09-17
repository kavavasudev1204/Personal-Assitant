import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { BarChart3, Download, TrendingUp, Users } from 'lucide-react';
import * as XLSX from 'xlsx';

export const ReportsPage: React.FC = () => {
  const [leadReport, setLeadReport] = useState<any>(null);
  const [salesReport, setSalesReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const [leadRes, salesRes] = await Promise.all([
          api.get('/reports/leads'),
          api.get('/reports/sales'),
        ]);

        if (leadRes.data.success) setLeadReport(leadRes.data);
        if (salesRes.data.success) setSalesReport(salesRes.data);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleExportFullReport = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Leads by Status
    if (leadReport?.leadsByStatus) {
      const statusData = leadReport.leadsByStatus.map((item: any) => ({
        'Lead Status': item._id || 'Unknown',
        'Total Count': item.count,
      }));
      const ws1 = XLSX.utils.json_to_sheet(statusData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Leads by Status');
    }

    // Sheet 2: Sales Funnel Stages
    if (salesReport?.funnelByStage) {
      const funnelData = salesReport.funnelByStage.map((item: any) => ({
        'Funnel Stage': item._id,
        'Count': item.count,
        'Total Amount (₹)': item.totalAmount,
        'Expected Value (₹)': item.totalExpectedValue,
      }));
      const ws2 = XLSX.utils.json_to_sheet(funnelData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Sales Funnel Pipeline');
    }

    XLSX.writeFile(wb, `Executive_Management_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <span>Executive Reports & Analytics Hub</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Aggregated business statistics generated directly from MongoDB records.
          </p>
        </div>
        <button
          onClick={handleExportFullReport}
          disabled={loading}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center space-x-1.5 self-start disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Export Full Report (Excel)</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold">Running database aggregation reports...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Leads by Location Report */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Leads Distribution by City / Location</span>
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {leadReport?.leadsByLocation?.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 text-center">No location records</p>
              ) : (
                leadReport?.leadsByLocation?.map((loc: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800">{loc._id || 'Unspecified Location'}</span>
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                      {loc.count} Leads
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sales Funnel Pipeline Stage Report */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Sales Funnel Pipeline Summary</span>
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {salesReport?.funnelByStage?.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 text-center">No sales activity records</p>
              ) : (
                salesReport?.funnelByStage?.map((st: any, idx: number) => (
                  <div key={idx} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{st._id}</div>
                      <div className="text-[10px] text-slate-400">{st.count} Activity Records</div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-emerald-700">₹{(st.totalAmount || 0).toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
