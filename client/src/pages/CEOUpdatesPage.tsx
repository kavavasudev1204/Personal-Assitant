import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Briefcase, Plus, CheckCircle2, Clock, Edit2, Trash2 } from 'lucide-react';
import { CEOUpdateModal } from '../components/CEOUpdateModal';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface CEOUpdate {
  _id: string;
  title: string;
  category: string;
  importance: string;
  information: string;
  actionRequired?: string;
  deadline?: string;
  status: string;
  ceoInformedDate?: string;
  relatedCompanyId?: { _id: string; name: string };
  createdAt: string;
}

export const CEOUpdatesPage: React.FC = () => {
  const [updates, setUpdates] = useState<CEOUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateToEdit, setUpdateToEdit] = useState<CEOUpdate | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [updateToDelete, setUpdateToDelete] = useState<CEOUpdate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ceo-updates');
      if (res.data.success) {
        setUpdates(res.data.updates);
      }
    } catch (err) {
      console.error('Failed to fetch CEO updates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const handleOpenCreateModal = () => {
    setUpdateToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: CEOUpdate) => {
    setUpdateToEdit(item);
    setIsModalOpen(true);
  };

  const handleMarkInformed = async (item: CEOUpdate) => {
    try {
      await api.patch(`/ceo-updates/${item._id}/informed`);
      fetchUpdates();
    } catch (err) {
      console.error('Failed to mark CEO informed:', err);
    }
  };

  const handleOpenDeleteConfirm = (item: CEOUpdate) => {
    setUpdateToDelete(item);
    setIsConfirmOpen(true);
  };

  const handleDeleteUpdate = async () => {
    if (!updateToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/ceo-updates/${updateToDelete._id}`);
      setIsConfirmOpen(false);
      setUpdateToDelete(null);
      fetchUpdates();
    } catch (err) {
      console.error('Failed to delete CEO update:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUpdates = updates.filter(
    (u) => selectedStatus === 'All' || u.status === selectedStatus
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Briefcase className="w-6 h-6 text-purple-600" />
            <span>CEO Updates & Management Summaries</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track high-priority quotations, awards, and opportunities to inform executive management.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-purple-600/20 transition flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add CEO Update Item</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-2 overflow-x-auto">
        {['All', 'Pending', 'Informed', 'Completed', 'Draft'].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedStatus === st
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st} Updates
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold">Querying CEO updates from MongoDB...</p>
        </div>
      ) : filteredUpdates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No CEO updates registered</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Flag important events, major quotations, or awards to inform the CEO.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
          {filteredUpdates.map((u) => (
            <div key={u._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-900 text-sm hover:text-purple-600 cursor-pointer">{u.title}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      u.importance === 'Critical'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {u.importance}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      u.status === 'Informed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-purple-100 text-purple-700 border border-purple-200'
                    }`}
                  >
                    {u.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-normal leading-relaxed">{u.information}</p>

                {u.actionRequired && (
                  <div className="text-[11px] font-semibold text-purple-900 bg-purple-50 p-2 rounded-xl border border-purple-100 inline-block">
                    <span>Action Needed: </span>
                    <span>{u.actionRequired}</span>
                  </div>
                )}

                <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-medium pt-1">
                  {u.relatedCompanyId && <span className="text-slate-700 font-semibold">{u.relatedCompanyId.name}</span>}
                  {u.deadline && (
                    <span className="flex items-center space-x-1 text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Deadline: {new Date(u.deadline).toLocaleDateString('en-GB')}</span>
                    </span>
                  )}
                  {u.ceoInformedDate && (
                    <span className="text-emerald-600 font-semibold">
                      Informed on {new Date(u.ceoInformedDate).toLocaleDateString('en-GB')}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Right */}
              <div className="flex items-center space-x-2 flex-shrink-0 self-end md:self-center">
                {u.status !== 'Informed' && (
                  <button
                    onClick={() => handleMarkInformed(u)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Inform CEO</span>
                  </button>
                )}
                <button
                  onClick={() => handleOpenEditModal(u)}
                  className="p-2 text-slate-400 hover:text-purple-600 hover:bg-slate-100 rounded-lg transition"
                  title="Edit CEO Update"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenDeleteConfirm(u)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                  title="Delete CEO Update"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CEO Update Modal */}
      <CEOUpdateModal
        isOpen={isModalOpen}
        updateToEdit={updateToEdit}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUpdates}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete CEO Update Item"
        message={`Are you sure you want to delete "${updateToDelete?.title}"?`}
        confirmText="Delete CEO Item"
        isLoading={isDeleting}
        onConfirm={handleDeleteUpdate}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
