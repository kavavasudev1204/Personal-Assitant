import React, { useEffect, useState } from 'react';
import { X, Users, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { DuplicateLeadModal } from './DuplicateLeadModal';

interface LeadModalProps {
  isOpen: boolean;
  leadToEdit?: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const LeadModal: React.FC<LeadModalProps> = ({ isOpen, leadToEdit, onClose, onSuccess }) => {
  const [companyId, setCompanyId] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [leadSource, setLeadSource] = useState('Email');
  const [leadType, setLeadType] = useState('New');
  const [productOrService, setProductOrService] = useState('');
  const [assignedSalesPersonId, setAssignedSalesPersonId] = useState('');
  const [status, setStatus] = useState('New');
  const [priority, setPriority] = useState('Medium');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [remarks, setRemarks] = useState('');

  const [companies, setCompanies] = useState<any[]>([]);
  const [salesPeople, setSalesPeople] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Duplicate Check Modal State
  const [duplicateMatches, setDuplicateMatches] = useState<any[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get('/companies').then((res) => res.data.success && setCompanies(res.data.companies));
      api.get('/users?role=Sales').then((res) => {
        if (res.data.success) {
          setSalesPeople(res.data.users);
        } else {
          api.get('/users').then((r) => r.data.success && setSalesPeople(r.data.users));
        }
      });

      if (leadToEdit) {
        setCompanyId(leadToEdit.companyId?._id || leadToEdit.companyId || '');
        setContactPerson(leadToEdit.contactPerson || '');
        setEmail(leadToEdit.email || '');
        setPhone(leadToEdit.phone || '');
        setCity(leadToEdit.location?.city || '');
        setState(leadToEdit.location?.state || '');
        setLeadSource(leadToEdit.leadSource || 'Email');
        setLeadType(leadToEdit.leadType || 'New');
        setProductOrService(leadToEdit.productOrService || '');
        setAssignedSalesPersonId(leadToEdit.assignedSalesPersonId?._id || leadToEdit.assignedSalesPersonId || '');
        setStatus(leadToEdit.status || 'New');
        setPriority(leadToEdit.priority || 'Medium');
        setNextFollowUpDate(
          leadToEdit.nextFollowUpDate ? new Date(leadToEdit.nextFollowUpDate).toISOString().split('T')[0] : ''
        );
        setRemarks(leadToEdit.remarks || '');
      } else {
        setCompanyId('');
        setNewCompanyName('');
        setContactPerson('');
        setEmail('');
        setPhone('');
        setCity('');
        setState('');
        setLeadSource('Email');
        setLeadType('New');
        setProductOrService('');
        setAssignedSalesPersonId('');
        setStatus('New');
        setPriority('Medium');
        const defaultFollowUp = new Date();
        defaultFollowUp.setDate(defaultFollowUp.getDate() + 7);
        setNextFollowUpDate(defaultFollowUp.toISOString().split('T')[0]);
        setRemarks('');
      }
      setError('');
    }
  }, [isOpen, leadToEdit]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!contactPerson.trim()) {
      setError('Contact person is required.');
      return;
    }
    if (!productOrService.trim()) {
      setError('Product / Service requirement is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: For new leads, check duplicate matches first if not editing
      if (!leadToEdit && leadType === 'New') {
        const selectedCompanyObj = companies.find((c) => c._id === companyId);
        const compName = selectedCompanyObj ? selectedCompanyObj.name : newCompanyName;

        const checkRes = await api.post('/leads/check-duplicate', {
          companyName: compName,
          email,
          phone,
          contactPerson,
          city,
        });

        if (checkRes.data.success && checkRes.data.duplicates.length > 0) {
          setDuplicateMatches(checkRes.data.duplicates);
          setShowDuplicateModal(true);
          setIsSubmitting(false);
          return;
        }
      }

      await saveLeadRecord(leadType);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save lead.');
      setIsSubmitting(false);
    }
  };

  const saveLeadRecord = async (assignedLeadType: string) => {
    try {
      let finalCompanyId = companyId;

      // If user typed a new company name, create Company record first
      if (!finalCompanyId && newCompanyName.trim()) {
        const compRes = await api.post('/companies', {
          name: newCompanyName,
          phone,
          email,
          location: { city, state },
        });
        if (compRes.data.success) {
          finalCompanyId = compRes.data.company._id;
        }
      }

      const payload = {
        companyId: finalCompanyId,
        contactPerson,
        email,
        phone,
        location: { city, state },
        leadSource,
        leadType: assignedLeadType,
        productOrService,
        assignedSalesPersonId: assignedSalesPersonId || undefined,
        status,
        priority,
        nextFollowUpDate: nextFollowUpDate || undefined,
        remarks,
      };

      if (leadToEdit) {
        await api.put(`/leads/${leadToEdit._id}`, payload);
      } else {
        await api.post('/leads', payload);
      }

      setShowDuplicateModal(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save lead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseExisting = () => {
    setShowDuplicateModal(false);
    onClose();
  };

  const handleCreateTypeN = () => {
    setLeadType('N');
    saveLeadRecord('N');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">{leadToEdit ? 'Edit Lead Record' : 'Register New Lead'}</h3>
                <p className="text-xs text-indigo-300">Sales opportunity & duplicate checking</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Existing Company
                </label>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="">-- Select Company or enter below --</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.location?.city || 'No city'})
                    </option>
                  ))}
                </select>
              </div>

              {!companyId && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Or New Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. XYZ Environmental Ltd"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Product / Service *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wastewater Treatment System"
                  value={productOrService}
                  onChange={(e) => setProductOrService(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  placeholder="rajesh@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone</label>
                <input
                  type="text"
                  placeholder="+91 98123 45678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">City</label>
                <input
                  type="text"
                  placeholder="e.g. Surat"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">State</label>
                <input
                  type="text"
                  placeholder="e.g. Gujarat"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Lead Source</label>
                <select
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="Email">Email / CC</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Exhibition">Exhibition</option>
                  <option value="Tender">Tender</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Requirement Received">Requirement Received</option>
                  <option value="Quotation">Quotation</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned Sales Person
                </label>
                <select
                  value={assignedSalesPersonId}
                  onChange={(e) => setAssignedSalesPersonId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="">-- Unassigned --</option>
                  {salesPeople.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Next Follow-up Date
                </label>
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Remarks</label>
              <textarea
                rows={2}
                placeholder="Client comments, requirements, follow-up history..."
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
                {isSubmitting ? 'Checking Duplicates & Saving...' : leadToEdit ? 'Update Lead' : 'Register Lead'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Duplicate Checker Dialog */}
      <DuplicateLeadModal
        isOpen={showDuplicateModal}
        duplicateMatches={duplicateMatches}
        onUseExisting={handleUseExisting}
        onCreateTypeN={handleCreateTypeN}
        onCancel={() => setShowDuplicateModal(false)}
      />
    </>
  );
};
