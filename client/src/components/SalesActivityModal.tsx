import React, { useEffect, useState } from 'react';
import { X, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface SalesActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SalesActivityModal: React.FC<SalesActivityModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [companyId, setCompanyId] = useState('');
  const [leadId, setLeadId] = useState('');
  const [activityType, setActivityType] = useState('Quotation Sent');
  const [stage, setStage] = useState('Quotation Sent');
  const [amount, setAmount] = useState(0);
  const [expectedValue, setExpectedValue] = useState(0);
  const [nextAction, setNextAction] = useState('');
  const [nextActionDate, setNextActionDate] = useState('');
  const [remarks, setRemarks] = useState('');

  const [companies, setCompanies] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get('/companies').then((res) => res.data.success && setCompanies(res.data.companies));
      api.get('/leads').then((res) => res.data.success && setLeads(res.data.leads));
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!companyId) {
      setError('Please select a company.');
      return;
    }
    if (!leadId) {
      setError('Please select a lead.');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/sales', {
        companyId,
        leadId,
        activityType,
        stage,
        amount: Number(amount),
        expectedValue: Number(expectedValue),
        nextAction,
        nextActionDate: nextActionDate || undefined,
        remarks,
        assignedSalesPersonId: (leads.find((l) => l._id === leadId)?.assignedSalesPersonId?._id) || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to log sales activity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Log Sales Activity / Stage Update</h3>
              <p className="text-xs text-indigo-300">Quotations, client calls, negotiations, and PO expectations</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Company *</label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="">-- Choose Company --</option>
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Lead *</label>
              <select
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="">-- Choose Lead --</option>
                {leads.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.leadId} - {l.contactPerson} ({l.productOrService})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Activity Type *</label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="Quotation Sent">Quotation Sent</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Client Call">Client Call</option>
                <option value="Meeting">Meeting</option>
                <option value="Requirement Received">Requirement Received</option>
                <option value="Negotiation">Negotiation</option>
                <option value="PO Received">PO Received</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Funnel Stage *</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="Lead">Lead</option>
                <option value="Enquiry">Enquiry</option>
                <option value="Requirement Received">Requirement Received</option>
                <option value="Quotation Preparation">Quotation Preparation</option>
                <option value="Quotation Sent">Quotation Sent</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Negotiation">Negotiation</option>
                <option value="PO Expected">PO Expected</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Quotation Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Expected Deal Value (₹)</label>
              <input
                type="number"
                value={expectedValue}
                onChange={(e) => setExpectedValue(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Next Action Required</label>
              <input
                type="text"
                placeholder="e.g. Client Call / Share revised specs"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Next Action Date</label>
              <input
                type="date"
                value={nextActionDate}
                onChange={(e) => setNextActionDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Remarks</label>
            <textarea
              rows={2}
              placeholder="Activity discussion notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Logging Activity...' : 'Log Sales Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
