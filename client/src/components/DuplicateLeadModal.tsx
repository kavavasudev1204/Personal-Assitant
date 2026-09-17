import React from 'react';
import { AlertTriangle, X, Check, PlusCircle } from 'lucide-react';

interface DuplicateLeadModalProps {
  isOpen: boolean;
  duplicateMatches: any[];
  onUseExisting: (existingLead: any) => void;
  onCreateTypeN: () => void;
  onCancel: () => void;
}

export const DuplicateLeadModal: React.FC<DuplicateLeadModalProps> = ({
  isOpen,
  duplicateMatches,
  onUseExisting,
  onCreateTypeN,
  onCancel,
}) => {
  if (!isOpen || duplicateMatches.length === 0) return null;

  const match = duplicateMatches[0];
  const existingLead = match.lead || match;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-500 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center font-bold text-white shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Possible Duplicate Lead Found</h3>
              <p className="text-xs text-amber-100">Non-destructive assistant duplicate checker</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-amber-100 hover:text-white p-1 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-semibold">
            <span>Match Condition: </span>
            <span className="font-bold">{match.reason || 'Matching Company / Contact details found in database'}</span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="font-bold text-slate-900 text-sm">{existingLead.companyId?.name || existingLead.companyName || 'Existing Record'}</div>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div><span className="font-semibold">Lead ID:</span> {existingLead.leadId || 'N/A'}</div>
              <div><span className="font-semibold">Status:</span> {existingLead.status}</div>
              <div><span className="font-semibold">Contact:</span> {existingLead.contactPerson}</div>
              <div><span className="font-semibold">Sales Person:</span> {existingLead.assignedSalesPersonId?.name || 'Unassigned'}</div>
            </div>
          </div>

          <p className="text-slate-500 text-xs">
            How would you like the assistant to handle this entry? You can associate with the existing record or create a new entry flagged as <span className="font-bold text-slate-900">Lead Type N (Repeated Lead)</span>.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 bg-white text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onUseExisting(existingLead)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1"
          >
            <Check className="w-4 h-4" />
            <span>Use Existing Lead</span>
          </button>
          <button
            type="button"
            onClick={onCreateTypeN}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Lead (Mark Type N)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
