import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { TrendingUp, Plus, Clock } from 'lucide-react';
import { SalesActivityModal } from '../components/SalesActivityModal';

interface SalesActivity {
  _id: string;
  companyId?: { _id: string; name: string };
  leadId?: { _id: string; leadId: string; productOrService: string };
  assignedSalesPersonId?: { _id: string; name: string };
  activityType: string;
  activityDate: string;
  stage: string;
  amount: number;
  expectedValue: number;
  nextAction?: string;
  nextActionDate?: string;
  status: string;
  remarks?: string;
}

export const SalesFunnelPage: React.FC = () => {
  const [activities, setActivities] = useState<SalesActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stages = [
    'Lead',
    'Enquiry',
    'Requirement Received',
    'Quotation Preparation',
    'Quotation Sent',
    'Follow-up',
    'Negotiation',
    'PO Expected',
    'Won',
    'Lost',
  ];

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sales');
      if (res.data.success) {
        setActivities(res.data.activities);
      }
    } catch (err) {
      console.error('Failed to fetch sales activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <span>Sales Funnel Pipeline</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track quotations sent, follow-ups, client negotiations, and expected deals.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log Activity / Quotation</span>
        </button>
      </div>

      {/* Funnel Stage Columns */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold">Querying MongoDB sales funnel database...</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6">
          {stages.map((stageName) => {
            const stageItems = activities.filter((a) => a.stage === stageName);
            const totalStageAmount = stageItems.reduce((acc, curr) => acc + (curr.amount || 0), 0);

            return (
              <div key={stageName} className="w-72 flex-shrink-0 bg-slate-100/70 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">{stageName}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 text-slate-700">
                      {stageItems.length}
                    </span>
                  </div>

                  {totalStageAmount > 0 && (
                    <div className="text-[11px] font-bold text-emerald-700 mb-3 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center justify-between">
                      <span>Total Stage Value:</span>
                      <span>₹{totalStageAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {stageItems.length === 0 ? (
                      <div className="bg-white p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400 font-medium">
                        No activity records
                      </div>
                    ) : (
                      stageItems.map((item) => (
                        <div key={item._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-2">
                          <div className="font-bold text-slate-900 text-xs">{item.companyId?.name || 'Company N/A'}</div>
                          <div className="text-[11px] font-medium text-indigo-600">{item.activityType}</div>

                          {item.amount > 0 && (
                            <div className="text-xs font-extrabold text-slate-900 flex items-center space-x-1">
                              <span>Amount: ₹{item.amount.toLocaleString('en-IN')}</span>
                            </div>
                          )}

                          {item.nextAction && (
                            <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span className="font-semibold text-slate-700">Next Action: </span>
                              <span>{item.nextAction}</span>
                              {item.nextActionDate && (
                                <div className="text-[10px] text-slate-400 mt-1 flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date(item.nextActionDate).toLocaleDateString('en-GB')}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Activity Modal */}
      <SalesActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchActivities}
      />
    </div>
  );
};
