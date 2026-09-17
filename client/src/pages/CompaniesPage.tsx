import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Building2, Plus, Search, Edit2, Trash2, Globe, Phone, Mail, MapPin } from 'lucide-react';
import { CompanyModal } from '../components/CompanyModal';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface Company {
  _id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  location?: { address?: string; city?: string; state?: string; country?: string };
  notes?: string;
  createdAt: string;
}

export const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/companies');
      if (res.data.success) {
        setCompanies(res.data.companies);
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleOpenCreateModal = () => {
    setCompanyToEdit(null);
    setIsCompanyModalOpen(true);
  };

  const handleOpenEditModal = (comp: Company) => {
    setCompanyToEdit(comp);
    setIsCompanyModalOpen(true);
  };

  const handleOpenDeleteConfirm = (comp: Company) => {
    setCompanyToDelete(comp);
    setIsConfirmOpen(true);
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/companies/${companyToDelete._id}`);
      setIsConfirmOpen(false);
      setCompanyToDelete(null);
      fetchCompanies();
    } catch (err) {
      console.error('Failed to delete company:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.industry && c.industry.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.location?.city && c.location.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            <span>Company Directory & Unified History</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Centralized directory of client companies, contacts, leads, and sales activities.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Company</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search companies by name, industry, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold">{filteredCompanies.length} Companies registered</span>
      </div>

      {/* List / Cards View */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold">Loading company directory...</p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No companies found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "+ Add Company" to create your first client company record.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCompanies.map((c) => (
            <div
              key={c._id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base hover:text-indigo-600 cursor-pointer">
                      {c.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 mt-1 inline-block">
                      {c.industry || 'General Industry'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditModal(c)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                      title="Edit Company"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenDeleteConfirm(c)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                      title="Delete Company"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mt-4">
                  {c.location?.city && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {c.location.city}
                        {c.location.state ? `, ${c.location.state}` : ''}
                      </span>
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <a
                        href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline truncate"
                      >
                        {c.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {c.notes && (
                <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                  {c.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Company Modal */}
      <CompanyModal
        isOpen={isCompanyModalOpen}
        companyToEdit={companyToEdit}
        onClose={() => setIsCompanyModalOpen(false)}
        onSuccess={fetchCompanies}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Company"
        message={`Are you sure you want to delete "${companyToDelete?.name}"? All associated history will be unlinked.`}
        confirmText="Delete Company"
        isLoading={isDeleting}
        onConfirm={handleDeleteCompany}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
