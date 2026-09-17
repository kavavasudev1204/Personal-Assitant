import React, { useEffect, useState } from 'react';
import { X, Award, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface OpportunityModalProps {
  isOpen: boolean;
  oppToEdit?: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const OpportunityModal: React.FC<OpportunityModalProps> = ({
  isOpen,
  oppToEdit,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Awards');
  const [organization, setOrganization] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Active');
  const [responsiblePersonId, setResponsiblePersonId] = useState('');
  const [ceoInformationRequired, setCeoInformationRequired] = useState(false);
  const [notes, setNotes] = useState('');

  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get('/users').then((res) => res.data.success && setUsers(res.data.users));

      if (oppToEdit) {
        setName(oppToEdit.name || '');
        setType(oppToEdit.type || 'Awards');
        setOrganization(oppToEdit.organization || '');
        setDescription(oppToEdit.description || '');
        setWebsite(oppToEdit.website || '');
        setStartDate(oppToEdit.startDate ? new Date(oppToEdit.startDate).toISOString().split('T')[0] : '');
        setEndDate(oppToEdit.endDate ? new Date(oppToEdit.endDate).toISOString().split('T')[0] : '');
        setPriority(oppToEdit.priority || 'Medium');
        setStatus(oppToEdit.status || 'Active');
        setResponsiblePersonId(oppToEdit.responsiblePersonId?._id || oppToEdit.responsiblePersonId || '');
        setCeoInformationRequired(Boolean(oppToEdit.ceoInformationRequired));
        setNotes(oppToEdit.notes || '');
      } else {
        setName('');
        setType('Awards');
        setOrganization('');
        setDescription('');
        setWebsite('');
        setStartDate(new Date().toISOString().split('T')[0]);
        const defaultEnd = new Date();
        defaultEnd.setDate(defaultEnd.getDate() + 14);
        setEndDate(defaultEnd.toISOString().split('T')[0]);
        setPriority('Medium');
        setStatus('Active');
        setResponsiblePersonId('');
        setCeoInformationRequired(false);
        setNotes('');
      }
      setError('');
    }
  }, [isOpen, oppToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Opportunity name is required.');
      return;
    }

    if (!organization.trim()) {
      setError('Organization name is required.');
      return;
    }

    if (!endDate) {
      setError('End Date / Deadline is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name,
        type,
        organization,
        description,
        website,
        startDate,
        endDate,
        priority,
        status,
        responsiblePersonId: responsiblePersonId || undefined,
        ceoInformationRequired,
        notes,
      };

      if (oppToEdit) {
        await api.put(`/opportunities/${oppToEdit._id}`, payload);
      } else {
        await api.post('/opportunities', payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save opportunity.');
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
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">{oppToEdit ? 'Edit Opportunity' : 'Add Opportunity / Application'}</h3>
              <p className="text-xs text-indigo-300">Awards, funding, tenders, registrations & grants</p>
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

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Opportunity Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. National Environmental Excellence Award 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="Awards">Awards</option>
                <option value="Funding">Funding</option>
                <option value="Tenders">Tenders</option>
                <option value="Registrations">Registrations</option>
                <option value="Grants">Grants</option>
                <option value="Conferences">Conferences</option>
                <option value="Exhibitions">Exhibitions</option>
                <option value="Memberships">Memberships</option>
                <option value="Certifications">Certifications</option>
                <option value="Competitions">Competitions</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Organization *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ministry of Environment"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">End Date / Deadline *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="Critical">Critical 🔴</option>
                <option value="High">High 🟠</option>
                <option value="Medium">Medium 🟢</option>
                <option value="Low">Low ⚪</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="Active">Active</option>
                <option value="Submitted">Submitted</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Responsible Person</label>
              <select
                value={responsiblePersonId}
                onChange={(e) => setResponsiblePersonId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="">-- Myself (Default) --</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Website URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Opportunity eligibility, requirements, guidelines..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ceoInfo"
                checked={ceoInformationRequired}
                onChange={(e) => setCeoInformationRequired(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="ceoInfo" className="text-xs font-bold text-purple-900 cursor-pointer">
                Inform CEO / Executive Document Required
              </label>
            </div>
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
              {isSubmitting ? 'Saving...' : oppToEdit ? 'Update Opportunity' : 'Save Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
