import React, { useState } from 'react';
import {
  Database,
  Search,
  Filter,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { MasterAuditLog, Customer, OrganizationSettings } from '../types';
import { toNepaliDigits, formatCurrency } from '../utils/nepaliDate';

interface Props {
  settings: OrganizationSettings;
  customers: Customer[];
  auditLogs: MasterAuditLog[];
}

export const MasterDatabaseView: React.FC<Props> = ({
  settings,
  customers,
  auditLogs,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMemberId, setFilterMemberId] = useState<string>('ALL');
  const [filterModule, setFilterModule] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchMember =
      filterMemberId === 'ALL' || log.memberId === filterMemberId;
    const matchModule = filterModule === 'ALL' || log.module === filterModule;
    const matchType = filterType === 'ALL' || log.type === filterType;
    const matchQuery =
      (log.description && log.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.memberName && log.memberName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.referenceNo && log.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchMember && matchModule && matchType && matchQuery;
  });

  const totalDebit = filteredLogs.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = filteredLogs.reduce((sum, l) => sum + l.credit, 0);

  // Export filtered logs to CSV
  const handleExportCSV = () => {
    const headers = [
      'Date BS',
      'Module',
      'Reference No',
      'Member ID',
      'Member Name',
      'Type',
      'Debit (रू.)',
      'Credit (रू.)',
      'Description',
    ];

    const rows = filteredLogs.map((l) => [
      l.dateBS,
      `"${l.module}"`,
      l.referenceNo,
      l.memberId || '',
      `"${l.memberName || ''}"`,
      l.type,
      l.debit,
      l.credit,
      `"${l.description}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `khanepani_master_ledger_${settings.currentSystemDateBS}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-800 p-3 text-white shadow-md">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              मेन डाटाबेस तथा एकीकृत लेखा लेजर
            </h2>
            <p className="text-xs text-slate-500">
              मेम्बर वाइज कुन आइकनबाट आम्दानी भएको छ वा खर्च भएको छ हरेक कारोबारको पूर्ण लेखा अभिलेख
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition"
          >
            <Download className="h-4 w-4" />
            <span>लेजर एक्सेल (CSV) डाउनलोड</span>
          </button>
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">कुल क्रेडिट (जम्मा / आम्दानी):</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {formatCurrency(totalCredit)}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            महसुल, आम्दानी, किस्ता, पानी बिक्री
          </span>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">कुल डेबिट (खर्च / भुक्तानी):</span>
          <div className="mt-2 text-2xl font-black text-rose-600">
            {formatCurrency(totalDebit)}
          </div>
          <span className="text-[11px] text-rose-700 font-semibold mt-1 block">
            शीर्षकगत खर्च, तलब, ऋण लगानी
          </span>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">कुल अभिलेख संख्या:</span>
          <div className="mt-2 text-2xl font-black text-blue-700">
            {toNepaliDigits(filteredLogs.length)} कारोबार
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            अडिट तथा सुरक्षा ब्याकअप प्रमाणित
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          {/* Memberwise Filter */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              मेम्बर वाइज छान्नुहोस्:
            </label>
            <select
              value={filterMemberId}
              onChange={(e) => setFilterMemberId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2 font-semibold text-slate-800"
            >
              <option value="ALL">सबै मेम्बरहरू (All Members)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Module Filter */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">कुन आइकन / मोड्युल:</label>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2 font-semibold text-slate-800"
            >
              <option value="ALL">सबै मोड्युलहरू</option>
              <option value="महसुल संकलन">महसुल संकलन (Amount Entry)</option>
              <option value="युनिट रिडिङ">युनिट रिडिङ (Unit Entry)</option>
              <option value="ऋण लगानी">ऋण लगानी (Loan Disburse)</option>
              <option value="ऋण किस्ता असुली">ऋण किस्ता (Installment)</option>
              <option value="बैंक कारोबार">बैंक कारोबार (Bank)</option>
              <option value="आम्दानी">आम्दानी (Income)</option>
              <option value="खर्च भुक्तानी">खर्च (Expense)</option>
              <option value="कर्मचारी तलब">कर्मचारी तलब (Staff)</option>
              <option value="गाडी पानी बिक्री">गाडी पानी बिक्री (Tanker)</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">प्रकार:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2 font-semibold text-slate-800"
            >
              <option value="ALL">सबै कारोबार प्रकार</option>
              <option value="महसुल">महसुल</option>
              <option value="आम्दानी">आम्दानी</option>
              <option value="खर्च">खर्च</option>
              <option value="ऋण लगानी">ऋण लगानी</option>
              <option value="किस्ता असुली">किस्ता असुली</option>
              <option value="पानी बिक्री">पानी बिक्री</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">खोज्नुहोस्:</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="विवरण वा सन्दर्भ नं खोज्नुहोस्..."
                className="w-full rounded-xl border border-slate-300 p-2 pl-8 text-xs text-slate-800"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">मिति (BS)</th>
                <th className="p-3">मोड्युल / आइकन</th>
                <th className="p-3">सन्दर्भ नं</th>
                <th className="p-3">मेम्बर / सम्बन्धित व्यक्ति</th>
                <th className="p-3 text-center">प्रकार</th>
                <th className="p-3">कारोबार विवरण</th>
                <th className="p-3 text-right">डेबिट (रू.)</th>
                <th className="p-3 text-right">क्रेडिट (रू.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3 text-slate-600 font-medium whitespace-nowrap">
                    {toNepaliDigits(log.dateBS)}
                  </td>
                  <td className="p-3 font-semibold text-slate-800">{log.module}</td>
                  <td className="p-3 font-mono font-bold text-blue-700">{log.referenceNo}</td>
                  <td className="p-3 font-semibold text-slate-900">
                    <div>{log.memberName || '-'}</div>
                    {log.memberId && (
                      <div className="text-[10px] text-blue-600">{log.memberId}</div>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {log.type}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 max-w-xs">{log.description}</td>
                  <td className="p-3 text-right font-bold text-rose-700">
                    {log.debit > 0 ? toNepaliDigits(log.debit.toFixed(2)) : '-'}
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-700">
                    {log.credit > 0 ? toNepaliDigits(log.credit.toFixed(2)) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
