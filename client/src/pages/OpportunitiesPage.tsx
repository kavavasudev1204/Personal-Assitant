import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Award, Plus, Search, Edit2, Trash2, Globe, Calendar, Briefcase } from 'lucide-react';
import { OpportunityModal } from '../components/OpportunityModal';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface Opportunity {
  _id: string;
  name: string;
  type: string;
  organization: string;
  description?: string;
  website?: string;
  startDate?: string;
  endDate: string;
  calculatedUrgency: 'Green' | 'Orange' | 'Red' | 'Grey';
  urgencyLabel: string;
  colorCode: string;
  status: string;
  priority: string;
  responsiblePersonId?: { _id: string; name: string };
  ceoInformationRequired?: boolean;
}

export const OpportunitiesPage: React.FC = () => {
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  // Modals state
  const [isOppModalOpen, setIsOppModalOpen] = useState(false);
  const [oppToEdit, setOppToEdit] = useState<Opportunity | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [oppToDelete, setOppToDelete] = useState<Opportunity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/opportunities');
      if (res.data.success) {
        setOpps(res.data.opportunities);
      }
    } catch (err) {
      console.error('Failed to fetch opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleOpenCreateModal = () => {
    setOppToEdit(null);
    setIsOppModalOpen(true);
  };

  const handleOpenEditModal = (opp: Opportunity) => {
    setOppToEdit(opp);
    setIsOppModalOpen(true);
  };

  const handleOpenDeleteConfirm = (opp: Opportunity) => {
    setOppToDelete(opp);
    setIsConfirmOpen(true);
  };

  const handleDeleteOpportunity = async () => {
    if (!oppToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/opportunities/${oppToDelete._id}`);
      setIsConfirmOpen(false);
      setOppToDelete(null);
      fetchOpportunities();
    } catch (err) {
      console.error('Failed to delete opportunity:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredOpps = opps.filter((o) => {
    const matchesSearch =
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'All' || o.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Award className="w-6 h-6 text-indigo-600" />
            <span>Opportunities & Applications Tracker</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Awards, funding, tenders, registrations, grants, and exhibition deadlines with dynamic color indicators.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Opportunity</span>
        </button>
      </div>

      {/* Dynamic Color Legend */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-3 shadow-xs">
        <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
          Dynamic Deadline Color Legend:
        </span>
        <div className="flex items-center space-x-4 flex-wrap gap-2">
          <span className="flex items-center space-x-1.5 font-semibold text-emerald-700">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>&gt; 7 Days (Green - Safe)</span>
          </span>
          <span className="flex items-center space-x-1.5 font-semibold text-amber-700">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>1-7 Days (Orange - Due Soon)</span>
          </span>
          <span className="flex items-center space-x-1.5 font-semibold text-red-700">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span>Today (Red - Due Today)</span>
          </span>
          <span className="flex items-center space-x-1.5 font-semibold text-slate-500">
            <span className="w-3 h-3 rounded-full bg-slate-400"></span>
            <span>Expired (Grey)</span>
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by opportunity name, organization, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
        >
          <option value="All">All Opportunity Types</option>
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
        </select>
      </div>

      {/* Opportunities List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold">Querying MongoDB opportunities database...</p>
        </div>
      ) : filteredOpps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <Award className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No opportunities found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "+ Add Opportunity" to track upcoming awards, grants, tenders, or funding deadlines.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOpps.map((o) => (
            <div
              key={o._id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{o.type}</span>
                    <h3 className="font-bold text-slate-900 text-base hover:text-indigo-600 cursor-pointer">
                      {o.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{o.organization}</p>
                  </div>

                  {/* Dynamic Color Badge */}
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-lg border flex-shrink-0 ${
                      o.calculatedUrgency === 'Red'
                        ? 'bg-red-100 text-red-700 border-red-200'
                        : o.calculatedUrgency === 'Orange'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : o.calculatedUrgency === 'Green'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {o.urgencyLabel}
                  </span>
                </div>

                {o.description && <p className="text-xs text-slate-600 mt-2 font-normal">{o.description}</p>}

                <div className="flex items-center space-x-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                  <span className="flex items-center space-x-1 font-semibold text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Deadline: {new Date(o.endDate).toLocaleDateString('en-GB')}</span>
                  </span>
                  {o.ceoInformationRequired && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 flex items-center space-x-1">
                      <Briefcase className="w-3 h-3" />
                      <span>CEO Info Required</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                {o.website ? (
                  <a
                    href={o.website.startsWith('http') ? o.website : `https://${o.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 font-semibold hover:underline flex items-center space-x-1"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Official Portal</span>
                  </a>
                ) : (
                  <span className="text-slate-400 text-[11px]">No link</span>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(o)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                    title="Edit Opportunity"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenDeleteConfirm(o)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                    title="Delete Opportunity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Opportunity Modal */}
      <OpportunityModal
        isOpen={isOppModalOpen}
        oppToEdit={oppToEdit}
        onClose={() => setIsOppModalOpen(false)}
        onSuccess={fetchOpportunities}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Opportunity"
        message={`Are you sure you want to delete "${oppToDelete?.name}"?`}
        confirmText="Delete Opportunity"
        isLoading={isDeleting}
        onConfirm={handleDeleteOpportunity}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
