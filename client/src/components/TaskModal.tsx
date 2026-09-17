import React, { useEffect, useState } from 'react';
import { X, CheckSquare, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface TaskModalProps {
  isOpen: boolean;
  taskToEdit?: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, taskToEdit, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Sales');
  const [priority, setPriority] = useState('Medium');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Pending');
  const [assignedTo, setAssignedTo] = useState('');
  const [relatedCompanyId, setRelatedCompanyId] = useState('');
  const [relatedLeadId, setRelatedLeadId] = useState('');
  const [informCEO, setInformCEO] = useState(false);
  const [notes, setNotes] = useState('');

  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch users, companies, leads for dropdowns
      api.get('/users').then((res) => res.data.success && setUsers(res.data.users));
      api.get('/companies').then((res) => res.data.success && setCompanies(res.data.companies));
      api.get('/leads').then((res) => res.data.success && setLeads(res.data.leads));

      if (taskToEdit) {
        setTitle(taskToEdit.title || '');
        setDescription(taskToEdit.description || '');
        setCategory(taskToEdit.category || 'Sales');
        setPriority(taskToEdit.priority || 'Medium');
        setStartDate(taskToEdit.startDate ? new Date(taskToEdit.startDate).toISOString().split('T')[0] : '');
        setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '');
        setStatus(taskToEdit.status || 'Pending');
        setAssignedTo(taskToEdit.assignedTo?._id || taskToEdit.assignedTo || '');
        setRelatedCompanyId(taskToEdit.relatedCompanyId?._id || taskToEdit.relatedCompanyId || '');
        setRelatedLeadId(taskToEdit.relatedLeadId?._id || taskToEdit.relatedLeadId || '');
        setInformCEO(Boolean(taskToEdit.informCEO));
        setNotes(taskToEdit.notes || '');
      } else {
        // Reset defaults
        setTitle('');
        setDescription('');
        setCategory('Sales');
        setPriority('Medium');
        setStartDate(new Date().toISOString().split('T')[0]);
        // Default due date to 3 days from now
        const defaultDue = new Date();
        defaultDue.setDate(defaultDue.getDate() + 3);
        setDueDate(defaultDue.toISOString().split('T')[0]);
        setStatus('Pending');
        setAssignedTo('');
        setRelatedCompanyId('');
        setRelatedLeadId('');
        setInformCEO(false);
        setNotes('');
      }
      setError('');
    }
  }, [isOpen, taskToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    if (!dueDate) {
      setError('Due date is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title,
        description,
        category,
        priority,
        startDate,
        dueDate,
        status,
        assignedTo: assignedTo || undefined,
        relatedCompanyId: relatedCompanyId || undefined,
        relatedLeadId: relatedLeadId || undefined,
        informCEO,
        notes,
      };

      if (taskToEdit) {
        await api.put(`/tasks/${taskToEdit._id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">{taskToEdit ? 'Edit Operational Task' : 'Create New Task'}</h3>
              <p className="text-xs text-indigo-300">Set priority, due date, and CEO update triggers</p>
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
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Follow up on quotation sent to ABC Ltd"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
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
                <option value="Lead Management">Lead Management</option>
                <option value="Report">Report</option>
                <option value="Management">Management</option>
                <option value="CEO">CEO</option>
                <option value="Finance">Finance</option>
                <option value="Administration">Administration</option>
                <option value="IT">IT</option>
                <option value="Other">Other</option>
              </select>
            </div>

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
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Assigned To</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="">-- Myself (Default) --</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Related Lead</label>
              <select
                value={relatedLeadId}
                onChange={(e) => setRelatedLeadId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="">-- None --</option>
                {leads.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.leadId} - {l.contactPerson}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Task details and instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="informCEO"
                checked={informCEO}
                onChange={(e) => setInformCEO(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="informCEO" className="text-xs font-bold text-purple-900 cursor-pointer">
                Inform CEO / Management Update Required
              </label>
            </div>
            <span className="text-[10px] text-purple-700 font-semibold">Flags into Action Center</span>
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
              {isSubmitting ? 'Saving Task...' : taskToEdit ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
