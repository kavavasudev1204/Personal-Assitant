import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, Plus, Upload, Download, Search, Filter, Edit2, Trash2, Clock } from 'lucide-react';
import * as XLSX from 'xlsx';
import { LeadModal } from '../components/LeadModal';
import { ExcelImportModal } from '../components/ExcelImportModal';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface Lead {
  _id: string;
  leadId: string;
  companyId?: { _id: string; name: string };
  contactPerson: string;
  email?: string;
  phone?: string;
  location?: { city?: string; state?: string };
  productOrService: string;
  leadSource?: string;
  leadType?: string;
  status: string;
  priority: string;
  nextFollowUpDate?: string;
  assignedSalesPersonId?: { _id: string; name: string };
  createdAt: string;
}

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');

  // Modals state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leads');
      if (res.data.success) {
        setLeads(res.data.leads);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleOpenCreateModal = () => {
    setLeadToEdit(null);
    setIsLeadModalOpen(true);
  };

  const handleOpenEditModal = (lead: Lead) => {
    setLeadToEdit(lead);
    setIsLeadModalOpen(true);
  };

  const handleOpenDeleteConfirm = (lead: Lead) => {
    setLeadToDelete(lead);
    setIsConfirmOpen(true);
  };

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/leads/${leadToDelete._id}`);
      setIsConfirmOpen(false);
      setLeadToDelete(null);
      fetchLeads();
    } catch (err) {
      console.error('Failed to delete lead:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportExcel = () => {
    if (leads.length === 0) return;
    const exportData = leads.map((l) => ({
      'Lead ID': l.leadId,
      'Company Name': l.companyId?.name || 'N/A',
      'Contact Person': l.contactPerson,
      Email: l.email || '',
      Phone: l.phone || '',
      City: l.location?.city || '',
      Requirement: l.productOrService,
      Status: l.status,
      Priority: l.priority,
      'Lead Type': l.leadType || 'New',
      'Assigned Sales Person': l.assignedSalesPersonId?.name || 'Unassigned',
      'Next Follow-up': l.nextFollowUpDate ? new Date(l.nextFollowUpDate).toLocaleDateString() : '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads Export');
    XLSX.writeFile(wb, `Leads_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.leadId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.companyId?.name && l.companyId.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      l.productOrService.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || l.status === selectedStatus;
    const matchesPriority = selectedPriority === 'All' || l.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Leads Directory & Duplicate Engine</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Centralized database for all incoming sales leads, repeat lead identification, and follow-ups.
          </p>
        </div>
        <div className="flex items-center space-x-2 flex-wrap">
          <button
            onClick={() => setIsExcelImportOpen(true)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition flex items-center space-x-1.5"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Import Excel</span>
          </button>
          <button
            onClick={handleExportExcel}
            disabled={leads.length === 0}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Lead</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by Lead ID, company, contact, product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center space-x-1 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold">Status:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Requirement Received">Requirement Received</option>
            <option value="Quotation">Quotation</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>

          <div className="flex items-center space-x-1 text-xs text-slate-500">
            <span className="font-semibold">Priority:</span>
          </div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical 🔴</option>
            <option value="High">High 🟠</option>
            <option value="Medium">Medium 🟢</option>
            <option value="Low">Low ⚪</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold">Querying MongoDB leads database...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No leads found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "+ Add Lead" or "Import Excel" to start managing business leads.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Lead ID</th>
                  <th className="p-3.5">Company</th>
                  <th className="p-3.5">Contact Person</th>
                  <th className="p-3.5">Product / Requirement</th>
                  <th className="p-3.5">Sales Person</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Next Follow-up</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLeads.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold text-indigo-600">
                      {l.leadId}
                      {l.leadType === 'N' && (
                        <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                          Type N
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {l.companyId?.name || 'N/A'}
                      {l.location?.city && <div className="text-[10px] text-slate-400 font-normal">{l.location.city}</div>}
                    </td>
                    <td className="p-3.5 text-slate-700 font-semibold">
                      {l.contactPerson}
                      {l.phone && <div className="text-[10px] text-slate-400 font-normal">{l.phone}</div>}
                    </td>
                    <td className="p-3.5 text-slate-700">{l.productOrService}</td>
                    <td className="p-3.5 text-slate-600">
                      {l.assignedSalesPersonId?.name || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {l.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 font-semibold">
                      {l.nextFollowUpDate ? (
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{new Date(l.nextFollowUpDate).toLocaleDateString('en-GB')}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(l)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Lead"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteConfirm(l)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <LeadModal
        isOpen={isLeadModalOpen}
        leadToEdit={leadToEdit}
        onClose={() => setIsLeadModalOpen(false)}
        onSuccess={fetchLeads}
      />

      <ExcelImportModal
        isOpen={isExcelImportOpen}
        onClose={() => setIsExcelImportOpen(false)}
        onSuccess={fetchLeads}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Lead Record"
        message={`Are you sure you want to delete Lead "${leadToDelete?.leadId} (${leadToDelete?.contactPerson})"?`}
        confirmText="Delete Lead"
        isLoading={isDeleting}
        onConfirm={handleDeleteLead}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
