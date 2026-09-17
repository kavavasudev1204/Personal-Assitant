import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../services/api';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setImportedCount(null);
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const bstr = event.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        setPreviewData(data);
      } catch (err) {
        setError('Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.');
      }
    };

    reader.readAsBinaryString(selectedFile);
  };

  const handleConfirmImport = async () => {
    if (previewData.length === 0) {
      setError('No data rows found in Excel sheet to import.');
      return;
    }

    setIsImporting(true);
    setError('');

    try {
      let count = 0;
      for (const row of previewData) {
        const companyName = row['Company'] || row['Company Name'] || row['company'] || 'Unknown Company';
        const contactPerson = row['Contact Person'] || row['Contact'] || row['contactPerson'] || 'Primary Contact';
        const email = row['Email'] || row['email'] || '';
        const phone = row['Phone'] || row['phone'] || '';
        const city = row['City'] || row['Location'] || '';
        const productOrService = row['Product / Service'] || row['Requirement'] || row['productOrService'] || 'General Requirement';
        const status = row['Status'] || 'New';

        // 1. Create or find company
        let compRes = await api.get(`/companies?search=${encodeURIComponent(companyName)}`);
        let companyId;
        if (compRes.data.success && compRes.data.companies.length > 0) {
          companyId = compRes.data.companies[0]._id;
        } else {
          const createComp = await api.post('/companies', { name: companyName, email, phone, location: { city } });
          if (createComp.data.success) {
            companyId = createComp.data.company._id;
          }
        }

        // 2. Create Lead
        await api.post('/leads', {
          companyId,
          contactPerson,
          email,
          phone,
          location: { city },
          productOrService,
          status,
          leadType: 'New',
        });
        count++;
      }

      setImportedCount(count);
      onSuccess();
      setTimeout(() => {
        onClose();
        setPreviewData([]);
        setFile(null);
        setImportedCount(null);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error importing Excel records.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-700 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center text-white font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Import Leads from Excel Workbook</h3>
              <p className="text-xs text-emerald-100">Excel-first workflow compatibility & automatic lead creation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-100 hover:text-white p-1 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {importedCount !== null && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Successfully imported {importedCount} lead records into MongoDB!</span>
            </div>
          )}

          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-emerald-400 transition bg-slate-50/50">
            <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-bold text-slate-800">Select Excel Workbook File (.xlsx, .xls)</p>
            <p className="text-xs text-slate-400 mt-1 mb-3">Columns supported: Company, Contact Person, Email, Phone, City, Product / Service</p>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition cursor-pointer"
            />
          </div>

          {previewData.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Excel Preview ({previewData.length} rows detected):</span>
              </div>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Company</th>
                      <th className="p-2">Contact</th>
                      <th className="p-2">Requirement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-2 font-semibold text-slate-900">{row['Company'] || row['Company Name'] || row['company'] || 'N/A'}</td>
                        <td className="p-2 text-slate-600">{row['Contact Person'] || row['Contact'] || row['contactPerson'] || 'N/A'}</td>
                        <td className="p-2 text-slate-600">{row['Product / Service'] || row['Requirement'] || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={previewData.length === 0 || isImporting}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
          >
            {isImporting ? 'Importing Rows to MongoDB...' : `Import ${previewData.length} Records`}
          </button>
        </div>
      </div>
    </div>
  );
};
