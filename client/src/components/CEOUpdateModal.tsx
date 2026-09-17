import React, { useEffect, useState } from 'react';
import { X, Briefcase, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface CEOUpdateModalProps {
  isOpen: boolean;
  updateToEdit?: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CEOUpdateModal: React.FC<CEOUpdateModalProps> = ({
  isOpen,
  updateToEdit,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Sales');
  const [importance, setImportance] = useState('High');
  const [information, setInformation] = useState('');
  const [actionRequired, setActionRequired] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('Pending');
  const [notes, setNotes] = useState('');
  const [relatedCompanyId, setRelatedCompanyId] = useState('');

  const [companies, setCompanies] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get('/companies').then((res) => res.data.success && setCompanies(res.data.companies));

      if (updateToEdit) {
        setTitle(updateToEdit.title || '');
        setCategory(updateToEdit.category || 'Sales');
        setImportance(updateToEdit.importance || 'High');
        setInformation(updateToEdit.information || '');
        setActionRequired(updateToEdit.actionRequired || '');
        setDeadline(updateToEdit.deadline ? new Date(updateToEdit.deadline).toISOString().split('T')[0] : '');
        setStatus(updateToEdit.status || 'Pending');
        setNotes(updateToEdit.notes || '');
        setRelatedCompanyId(updateToEdit.relatedCompanyId?._id || updateToEdit.relatedCompanyId || '');
      } else {
        setTitle('');
        setCategory('Sales');
        setImportance('High');
        setInformation('');
        setActionRequired('');
        setDeadline('');
        setStatus('Pending');
        setNotes('');
        setRelatedCompanyId('');
      }
      setError('');
    }
  }, [isOpen, updateToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!information.trim()) {
      setError('Information details are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title,
        category,
        importance,
        information,
        actionRequired,
        deadline: deadline || undefined,
        status,
        notes,
        relatedCompanyId: relatedCompanyId || undefined,
      };

      if (updateToEdit) {
        await api.put(`/ceo-updates/${updateToEdit._id}`, payload);
      } else {
        await api.post('/ceo-updates', payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save CEO Update item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-purple-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-700 flex items-center justify-center text-white font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">{updateToEdit ? 'Edit CEO Update' : 'Add CEO Update Item'}</h3>
              <p className="text-xs text-purple-200">Flag high-priority activity for executive management</p>
            </div>
          </div>
          <button onClick={onClose} className="text-purple-300 hover:text-white p-1 rounded-lg transition">
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

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Update Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Major Quotation Sent to ABC Industries (₹8,50,000)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="Sales">Sales</option>
                <option value="Quotation">Quotation</option>
                <option value="Opportunity">Opportunity</option>
                <option value="Task">Task</option>
                <option value="Management">Management</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Importance</label>
              <select
                value={importance}
                onChange={(e) => setImportance(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="Critical">Critical 🔴</option>
                <option value="High">High 🟠</option>
                <option value="Medium">Medium 🟢</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="Pending">Pending</option>
                <option value="Draft">Draft</option>
                <option value="Informed">Informed</option>
                <option value="Completed">Completed</option>
                <option value="Not Required">Not Required</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Related Company</label>
              <select
                value={relatedCompanyId}
                onChange={(e) => setRelatedCompanyId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="">-- None --</option>
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Information Details *</label>
            <textarea
              rows={3}
              required
              placeholder="Key facts, amounts, decision required from CEO..."
              value={information}
              onChange={(e) => setInformation(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Action Required from Management</label>
            <input
              type="text"
              placeholder="e.g. Approve discount terms / Review tender proposal"
              value={actionRequired}
              onChange={(e) => setActionRequired(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
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
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-purple-600/20 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : updateToEdit ? 'Update Item' : 'Save CEO Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
