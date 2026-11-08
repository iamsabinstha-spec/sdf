import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  Upload,
  Search,
  CheckCircle,
  Edit2,
  Trash2,
  Save,
  X,
  Calendar,
  FileText,
  Eye,
} from 'lucide-react';
import { Customer, OrganizationSettings, MasterAuditLog } from '../types';
import { toNepaliDigits } from '../utils/nepaliDate';

interface Props {
  settings: OrganizationSettings;
  customers: Customer[];
  onSaveCustomers: (customers: Customer[]) => void;
  onAddAuditLog: (log: MasterAuditLog) => void;
}

export const KycView: React.FC<Props> = ({
  settings,
  customers,
  onSaveCustomers,
  onAddAuditLog,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'import'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Selected customer for full KYC preview modal
  const [previewCustomer, setPreviewCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Generate Automatic Customer ID
  const getNextCustomerId = () => {
    const nextNum = customers.length + 1;
    return `KP-${String(nextNum).padStart(3, '0')}`;
  };

  // Form state for new customer
  const [newCustomer, setNewCustomer] = useState<Customer>({
    id: getNextCustomerId(),
    name: '',
    fatherName: '',
    grandfatherName: '',
    dobBS: '२०४०/०१/०१',
    phone: '',
    address: 'मेलम्ची-३',
    citizenshipNo: '',
    citizenshipIssueDateBS: '२०५८/०१/०१',
    landKittaNo: '',
    meterNo: `MTR-${100 + customers.length + 1}`,
    registeredDateBS: settings.currentSystemDateBS, // Auto current system date
    status: 'सक्रिय',
    previousReading: 0,
  });

  // Handle Create Customer Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name.trim()) {
      alert('कृपया ग्राहकको नाम प्रविष्ट गर्नुहोस्।');
      return;
    }

    const created: Customer = {
      ...newCustomer,
      id: newCustomer.id || getNextCustomerId(),
      registeredDateBS: newCustomer.registeredDateBS || settings.currentSystemDateBS,
    };

    onSaveCustomers([created, ...customers]);

    // Audit log
    onAddAuditLog({
      id: `LOG-${Date.now()}`,
      dateBS: settings.currentSystemDateBS,
      module: 'केवाईसी ग्राहक दर्ता',
      referenceNo: created.id,
      memberId: created.id,
      memberName: created.name,
      type: 'महसुल',
      debit: 0,
      credit: 0,
      description: `नयाँ ग्राहक दर्ता: ${created.name} (${created.id})`,
    });

    setSuccessToast(`ग्राहक ${created.name} (${created.id}) सफलतापूर्वक दर्ता हुनुभयो!`);
    setTimeout(() => setSuccessToast(''), 4000);

    // Reset Form
    setNewCustomer({
      id: `KP-${String(customers.length + 2).padStart(3, '0')}`,
      name: '',
      fatherName: '',
      grandfatherName: '',
      dobBS: '२०४०/०१/०१',
      phone: '',
      address: 'मेलम्ची-३',
      citizenshipNo: '',
      citizenshipIssueDateBS: '२०५८/०१/०१',
      landKittaNo: '',
      meterNo: `MTR-${100 + customers.length + 2}`,
      registeredDateBS: settings.currentSystemDateBS,
      status: 'सक्रिय',
      previousReading: 0,
    });
    setActiveTab('list');
  };

  // Edit Customer
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    const updatedList = customers.map((c) => (c.id === editingCustomer.id ? editingCustomer : c));
    onSaveCustomers(updatedList);
    setEditingCustomer(null);
    setSuccessToast('ग्राहकको विवरण सफलतापूर्वक अद्यावधिक गरियो!');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // Delete Customer
  const handleDeleteCustomer = (id: string) => {
    if (confirm('के तपाईं यो ग्राहक विवरण मेटाउन निश्चित हुनुहुन्छ?')) {
      const updatedList = customers.filter((c) => c.id !== id);
      onSaveCustomers(updatedList);
      setSuccessToast('ग्राहक रेकर्ड मेटाइयो!');
      setTimeout(() => setSuccessToast(''), 3000);
    }
  };

  // Export Customers to CSV (Excel compatible)
  const handleExportCSV = () => {
    const headers = [
      'Customer ID',
      'Name',
      'Father Name',
      'Grandfather Name',
      'DOB BS',
      'Phone',
      'Address',
      'Citizenship No',
      'Citizenship Date BS',
      'Land Kitta No',
      'Meter No',
      'Registered Date BS',
      'Status',
      'Previous Reading',
    ];

    const rows = customers.map((c) => [
      c.id,
      `"${c.name}"`,
      `"${c.fatherName}"`,
      `"${c.grandfatherName}"`,
      c.dobBS,
      c.phone,
      `"${c.address}"`,
      c.citizenshipNo,
      c.citizenshipIssueDateBS,
      c.landKittaNo,
      c.meterNo,
      c.registeredDateBS,
      c.status,
      c.previousReading,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `khanepani_customers_${settings.currentSystemDateBS}.csv`;
    link.click();
  };

  // Import Customers from CSV
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          alert('CSV फाइलमा कुनै डाटा भेटिएन।');
          return;
        }

        const newImported: Customer[] = [];
        let startIdx = customers.length + 1;

        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/"/g, '').trim());
          if (cols.length >= 2 && cols[1]) {
            newImported.push({
              id: cols[0] || `KP-${String(startIdx++).padStart(3, '0')}`,
              name: cols[1],
              fatherName: cols[2] || '',
              grandfatherName: cols[3] || '',
              dobBS: cols[4] || '२०४०/०१/०१',
              phone: cols[5] || '',
              address: cols[6] || 'मेलम्ची-३',
              citizenshipNo: cols[7] || '',
              citizenshipIssueDateBS: cols[8] || '२०५८/०१/०१',
              landKittaNo: cols[9] || '',
              meterNo: cols[10] || `MTR-${200 + i}`,
              registeredDateBS: cols[11] || settings.currentSystemDateBS,
              status: (cols[12] as 'सक्रिय' | 'निष्क्रिय') || 'सक्रिय',
              previousReading: Number(cols[13]) || 0,
            });
          }
        }

        if (newImported.length > 0) {
          onSaveCustomers([...newImported, ...customers]);
          setSuccessToast(
            `एक्सेल/CSV बाट ${toNepaliDigits(newImported.length)} जना ग्राहकहरू सफलतापूर्वक आयात गरियो!`
          );
          setTimeout(() => setSuccessToast(''), 4000);
          setActiveTab('list');
        } else {
          alert('मान्य ग्राहक रेकर्डहरू फेला परेनन्।');
        }
      } catch (err) {
        alert('CSV फाइल पढ्दा त्रुटि भयो।');
      }
    };
    reader.readAsText(file);
  };

  // Filtered List
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.meterNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-md shadow-blue-500/20">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              केवाईसी (KYC) तथा ग्राहक व्यवस्थापन
            </h2>
            <p className="text-xs text-slate-500">
              ग्राहक आइडी, बुवा/बाजेको नाम, नागरिकता, कित्ता नम्बर, अटोमेटिक मिति र बल्क एक्सेल आयात/निर्यात
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            <UserPlus className="h-4 w-4" />
            <span>नयाँ ग्राहक दर्ता</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <Download className="h-4 w-4" />
            <span>एक्सेल (CSV) डाउनलोड</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
          >
            <Upload className="h-4 w-4" />
            <span>एक्सेलबाट तान्नुहोस् (Import)</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {/* View Switcher Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('list')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'list'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          ग्राहक सूची ({toNepaliDigits(customers.length)})
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'create'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          + नयाँ ग्राहक दर्ता फारम
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'import'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          बल्क एक्सेल आयात (Import)
        </button>
      </div>

      {/* TAB 1: Customers Table List */}
      {activeTab === 'list' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">दर्ता भएका ग्राहकहरूको विवरण</h3>
              <p className="text-xs text-slate-500">कुल {toNepaliDigits(customers.length)} जना उपभोक्ता</p>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="नाम, आइडी, फोन वा मिटर नं..."
                className="w-72 rounded-xl border border-slate-300 p-2 pl-8 text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">ग्राहक आइडी</th>
                  <th className="p-3">ग्राहकको नाम</th>
                  <th className="p-3">बुवा / बाजेको नाम</th>
                  <th className="p-3">फोन नम्बर</th>
                  <th className="p-3">ठेगाना / टोल</th>
                  <th className="p-3">नागरिकता नं</th>
                  <th className="p-3">कित्ता नं</th>
                  <th className="p-3">मिटर नं</th>
                  <th className="p-3 text-center">साविक रिडिङ</th>
                  <th className="p-3 text-center">दर्ता मिति</th>
                  <th className="p-3 text-center">कार्यहरू</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3 font-bold text-blue-700">{cust.id}</td>
                    <td className="p-3 font-semibold text-slate-900">{cust.name}</td>
                    <td className="p-3 text-slate-600 text-[11px]">
                      <div>बुवा: {cust.fatherName || '-'}</div>
                      <div className="text-slate-400">बाजे: {cust.grandfatherName || '-'}</div>
                    </td>
                    <td className="p-3 font-medium text-slate-800">{toNepaliDigits(cust.phone)}</td>
                    <td className="p-3 text-slate-600">{cust.address}</td>
                    <td className="p-3 text-slate-600 text-[11px]">{toNepaliDigits(cust.citizenshipNo)}</td>
                    <td className="p-3 text-slate-600">{toNepaliDigits(cust.landKittaNo)}</td>
                    <td className="p-3 font-semibold text-slate-800">{cust.meterNo}</td>
                    <td className="p-3 text-center font-bold text-slate-700">
                      {toNepaliDigits(cust.previousReading)}
                    </td>
                    <td className="p-3 text-center text-slate-500 text-[11px]">
                      {toNepaliDigits(cust.registeredDateBS)}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setPreviewCustomer(cust)}
                          className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
                          title="पूरा केवाईसी हेर्नुहोस्"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingCustomer(cust)}
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                          title="सच्याउनुहोस्"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(cust.id)}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                          title="मेटाउनुहोस्"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* TAB 2: Customer Create Form */}
      {activeTab === 'create' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            नयाँ ग्राहक (उपभोक्ता) दर्ता फारम
          </h3>
          <p className="text-xs text-slate-500">
            सबै आवश्यक व्यक्तिगत, पारिवारिक, नागरिकता, कित्ता तथा मिटर विवरणहरू भर्नुहोस्।
          </p>

          <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
            {/* Automatic Fields Header */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ग्राहक आइडी (अटोमेटिक):
                </label>
                <input
                  type="text"
                  value={newCustomer.id}
                  onChange={(e) => setNewCustomer({ ...newCustomer, id: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-black text-blue-700 bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ग्राहक बनेको मिति (अटोमेटिक / फेर्न मिल्ने):
                </label>
                <input
                  type="text"
                  value={newCustomer.registeredDateBS}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, registeredDateBS: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 bg-white"
                  required
                />
              </div>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">ग्राहकको पूरा नाम:</label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="जस्तै: श्यामप्रसाद अधिकारी"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">बुवाको नाम:</label>
                <input
                  type="text"
                  value={newCustomer.fatherName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, fatherName: e.target.value })}
                  placeholder="बुवाको नाम"
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">बाजेको नाम:</label>
                <input
                  type="text"
                  value={newCustomer.grandfatherName}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, grandfatherName: e.target.value })
                  }
                  placeholder="बाजेको नाम"
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                  required
                />
              </div>
            </div>

            {/* Contact, DOB & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">जन्ममिति (BS):</label>
                <input
                  type="text"
                  value={newCustomer.dobBS}
                  onChange={(e) => setNewCustomer({ ...newCustomer, dobBS: e.target.value })}
                  placeholder="२०३५/०५/१२"
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">फोन / मोबाइल नम्बर:</label>
                <input
                  type="text"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="९८४१२३४५६७"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ठेगाना / टोल:</label>
                <input
                  type="text"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  placeholder="मेलम्ची-३, डाँडागाउँ"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold"
                  required
                />
              </div>
            </div>

            {/* Citizenship & Land Kitta */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">नागरिकता नम्बर:</label>
                <input
                  type="text"
                  value={newCustomer.citizenshipNo}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, citizenshipNo: e.target.value })
                  }
                  placeholder="२२-०१-७५-००१२३"
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">नागरिकता जारी मिति (BS):</label>
                <input
                  type="text"
                  value={newCustomer.citizenshipIssueDateBS}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, citizenshipIssueDateBS: e.target.value })
                  }
                  placeholder="२०५५/०६/२०"
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">जग्गा कित्ता नम्बर:</label>
                <input
                  type="text"
                  value={newCustomer.landKittaNo}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, landKittaNo: e.target.value })
                  }
                  placeholder="४०२"
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">धारा / मिटर नम्बर:</label>
                <input
                  type="text"
                  value={newCustomer.meterNo}
                  onChange={(e) => setNewCustomer({ ...newCustomer, meterNo: e.target.value })}
                  placeholder="MTR-108"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold"
                  required
                />
              </div>
            </div>

            {/* Initial Reading */}
            <div className="w-48">
              <label className="font-bold text-slate-700 block mb-1">
                सुरुवाती मिटर रिडिङ (Previous):
              </label>
              <input
                type="number"
                value={newCustomer.previousReading}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, previousReading: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-center"
              />
            </div>

            <div className="pt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="rounded-xl border border-slate-300 px-5 py-2.5 font-bold text-slate-700 hover:bg-slate-100"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white shadow-md hover:bg-blue-700 transition"
              >
                <Save className="h-4 w-4" />
                <span>ग्राहक दर्ता सुरक्षित गर्नुहोस्</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Import Excel / CSV */}
      {activeTab === 'import' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-emerald-700 font-bold text-sm">
            <Upload className="h-5 w-5" />
            <span>एक्सेल (Excel / CSV) बाट ग्राहकहरू बल्क आयात गर्नुहोस्</span>
          </div>

          <p className="text-xs text-slate-600">
            यदि तपाईंसँग पहिलेदेखि नै ग्राहकहरूको सूची एक्सेल वा स्प्रेडसिटमा छ भने त्यसलाई CSV फाइलको रूपमा सुरक्षित गरी यहाँ सिधै अपलोड गर्न सक्नुहुन्छ।
          </p>

          <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition">
                <Upload className="h-4 w-4" />
                <span>कम्प्युटरबाट CSV फाइल छान्नुहोस्</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCSVUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-[11px] text-slate-500">
              समर्थित ढाँचा: .csv (कॉलमहरू: ग्राहक आइडी, नाम, बुवा, बाजे, जन्ममिति, फोन, ठेगाना, नागरिकता, कित्ता, मिटर नं)
            </p>
          </div>
        </div>
      )}

      {/* Full KYC Preview Modal */}
      {previewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">पूर्ण ग्राहक केवाईसी विवरण</h3>
                  <span className="text-[11px] text-blue-700 font-semibold">{previewCustomer.id}</span>
                </div>
              </div>
              <button
                onClick={() => setPreviewCustomer(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[11px]">ग्राहकको नाम:</span>
                <span className="font-bold text-slate-900 text-sm">{previewCustomer.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">मोबाइल नम्बर:</span>
                <span className="font-bold text-slate-900 text-sm">{toNepaliDigits(previewCustomer.phone)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">बुवाको नाम:</span>
                <span className="font-semibold">{previewCustomer.fatherName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">बाजेको नाम:</span>
                <span className="font-semibold">{previewCustomer.grandfatherName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">ठेगाना / टोल:</span>
                <span className="font-semibold">{previewCustomer.address}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">जन्ममिति (BS):</span>
                <span>{toNepaliDigits(previewCustomer.dobBS)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">नागरिकता नं:</span>
                <span className="font-semibold">{toNepaliDigits(previewCustomer.citizenshipNo)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">जारी मिति:</span>
                <span>{toNepaliDigits(previewCustomer.citizenshipIssueDateBS)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">जग्गा कित्ता नं:</span>
                <span className="font-bold text-blue-800">{toNepaliDigits(previewCustomer.landKittaNo)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">धारा / मिटर नं:</span>
                <span className="font-bold text-slate-900">{previewCustomer.meterNo}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">ग्राहक बनेको मिति:</span>
                <span className="font-semibold text-emerald-700">
                  {toNepaliDigits(previewCustomer.registeredDateBS)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">साविक रिडिङ:</span>
                <span className="font-bold">{toNepaliDigits(previewCustomer.previousReading)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setPreviewCustomer(null)}
                className="rounded-xl bg-slate-800 px-5 py-2 font-bold text-white hover:bg-slate-900"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                ग्राहक विवरण सच्याउनुहोस् (Edit Customer)
              </h3>
              <button
                onClick={() => setEditingCustomer(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="text-slate-600 block mb-1">ग्राहकको नाम:</label>
                <input
                  type="text"
                  value={editingCustomer.name}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 p-2 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">फोन नम्बर:</label>
                  <input
                    type="text"
                    value={editingCustomer.phone}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, phone: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">ठेगाना:</label>
                  <input
                    type="text"
                    value={editingCustomer.address}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, address: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">नागरिकता नं:</label>
                  <input
                    type="text"
                    value={editingCustomer.citizenshipNo}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, citizenshipNo: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">कित्ता नं:</label>
                  <input
                    type="text"
                    value={editingCustomer.landKittaNo}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, landKittaNo: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">मिटर नं:</label>
                  <input
                    type="text"
                    value={editingCustomer.meterNo}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, meterNo: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">साविक रिडिङ:</label>
                  <input
                    type="number"
                    value={editingCustomer.previousReading}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        previousReading: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700"
                >
                  सुरक्षित गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
