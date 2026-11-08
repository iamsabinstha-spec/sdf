import React, { useState } from 'react';
import {
  Gauge,
  Send,
  Save,
  CheckCircle,
  AlertCircle,
  Calendar,
  Search,
  Filter,
  Check,
  Smartphone,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  Play,
  Pause,
  MessageSquare,
} from 'lucide-react';
import {
  Customer,
  UnitReading,
  OrganizationSettings,
  MasterAuditLog,
} from '../types';
import {
  NEPALI_MONTHS,
  toNepaliDigits,
  formatCurrency,
  calculateWaterBill,
} from '../utils/nepaliDate';
import {
  buildWhatsAppUrl,
  createWaterBillWhatsAppMessage,
} from '../utils/whatsapp';

interface Props {
  settings: OrganizationSettings;
  customers: Customer[];
  readings: UnitReading[];
  onSaveReadings: (readings: UnitReading[]) => void;
  onAddAuditLog: (log: MasterAuditLog) => void;
}

export const UnitEntryView: React.FC<Props> = ({
  settings,
  customers,
  readings,
  onSaveReadings,
  onAddAuditLog,
}) => {
  // Selected Month & Entry Date
  const currentYear = settings.currentSystemDateBS.split('/')[0] || '२०८१';
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>('कार्तिक');
  const [entryDateBS, setEntryDateBS] = useState<string>(settings.currentSystemDateBS);

  const monthKey = `${selectedYear}-${selectedMonth}`;

  // Local state for bulk input values: { customerId: currentReading }
  const [bulkInputs, setBulkInputs] = useState<Record<string, number | ''>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // WhatsApp Bulk Sending Modal State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [waQueueIndex, setWaQueueIndex] = useState(0);
  const [isQueueRunning, setIsQueueRunning] = useState(false);
  const [sentCustomerIds, setSentCustomerIds] = useState<Set<string>>(new Set());

  // Edit Single Reading Modal
  const [editingReading, setEditingReading] = useState<UnitReading | null>(null);

  // Filtered customers for bulk input
  const activeCustomers = customers.filter(
    (c) =>
      c.status === 'सक्रिय' &&
      (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.meterNo.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Existing readings for selected month
  const currentMonthReadings = readings.filter((r) => r.monthBS === monthKey);

  // Handle row input change
  const handleInputChange = (customerId: string, val: string) => {
    const num = val === '' ? '' : parseInt(val, 10);
    setBulkInputs((prev) => ({
      ...prev,
      [customerId]: isNaN(num as number) ? '' : num,
    }));
  };

  // Bulk Save all filled rows
  const handleSaveAll = () => {
    const newReadings: UnitReading[] = [];
    const updatedAll = [...readings];

    activeCustomers.forEach((cust) => {
      const currentVal = bulkInputs[cust.id];
      if (currentVal !== undefined && currentVal !== '' && currentVal >= cust.previousReading) {
        // Calculate
        const bill = calculateWaterBill(
          cust.previousReading,
          Number(currentVal),
          settings.minimumCharge,
          settings.minimumUnitsIncluded,
          settings.unitRateExceeding,
          settings.penaltyGraceDays,
          settings.penaltyPercent,
          0
        );

        // Check if existing reading exists for this month
        const existingIdx = updatedAll.findIndex(
          (r) => r.customerId === cust.id && r.monthBS === monthKey
        );

        const record: UnitReading = {
          id: existingIdx >= 0 ? updatedAll[existingIdx].id : `UR-${Date.now()}-${cust.id}`,
          monthBS: monthKey,
          entryDateBS: entryDateBS.trim() || settings.currentSystemDateBS,
          customerId: cust.id,
          customerName: cust.name,
          phone: cust.phone,
          meterNo: cust.meterNo,
          previousReading: cust.previousReading,
          currentReading: Number(currentVal),
          consumedUnits: bill.consumedUnits,
          baseAmount: bill.baseAmount,
          extraAmount: bill.extraAmount,
          penaltyAmount: bill.penaltyAmount,
          totalAmount: bill.totalAmount,
          paymentStatus: existingIdx >= 0 ? updatedAll[existingIdx].paymentStatus : 'बाँकी',
          paidReceiptNo: existingIdx >= 0 ? updatedAll[existingIdx].paidReceiptNo : undefined,
          paidDateBS: existingIdx >= 0 ? updatedAll[existingIdx].paidDateBS : undefined,
        };

        if (existingIdx >= 0) {
          updatedAll[existingIdx] = record;
        } else {
          updatedAll.unshift(record);
        }
        newReadings.push(record);

        // Audit Log
        onAddAuditLog({
          id: `LOG-${Date.now()}-${cust.id}`,
          dateBS: entryDateBS,
          module: 'युनिट रिडिङ',
          referenceNo: record.id,
          memberId: cust.id,
          memberName: cust.name,
          type: 'महसुल',
          debit: 0,
          credit: record.totalAmount,
          description: `${monthKey} महिनाको ${record.consumedUnits} युनिट रिडिङ दर्ता (रू ${record.totalAmount})`,
        });
      }
    });

    if (newReadings.length === 0) {
      alert('कृपया कम्तीमा एक ग्राहकको नयाँ रिडिङ अङ्क प्रविष्ट गर्नुहोस्।');
      return;
    }

    onSaveReadings(updatedAll);
    setBulkInputs({});
    setSuccessToast(
      `${toNepaliDigits(newReadings.length)} जना ग्राहकहरूको युनिट रिडिङ सफलतापूर्वक सुरक्षित भयो!`
    );
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // Edit / Update an existing reading
  const handleUpdateSingleReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReading) return;

    const bill = calculateWaterBill(
      editingReading.previousReading,
      editingReading.currentReading,
      settings.minimumCharge,
      settings.minimumUnitsIncluded,
      settings.unitRateExceeding,
      settings.penaltyGraceDays,
      settings.penaltyPercent,
      0
    );

    const updated: UnitReading = {
      ...editingReading,
      consumedUnits: bill.consumedUnits,
      baseAmount: bill.baseAmount,
      extraAmount: bill.extraAmount,
      penaltyAmount: bill.penaltyAmount,
      totalAmount: bill.totalAmount,
    };

    const updatedList = readings.map((r) => (r.id === updated.id ? updated : r));
    onSaveReadings(updatedList);
    setEditingReading(null);
    setSuccessToast('रिडिङ सफलतापूर्वक सच्याइयो!');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleDeleteReading = (id: string) => {
    if (confirm('के तपाईं यो युनिट रिडिङ रेकर्ड मेटाउन निश्चित हुनुहुन्छ?')) {
      const updatedList = readings.filter((r) => r.id !== id);
      onSaveReadings(updatedList);
    }
  };

  // Open WhatsApp for single reading
  const handleSendSingleWhatsApp = (r: UnitReading) => {
    const text = createWaterBillWhatsAppMessage(
      settings.name,
      r.customerName,
      r.meterNo,
      r.monthBS,
      r.previousReading,
      r.currentReading,
      r.consumedUnits,
      r.totalAmount,
      settings.currentSystemDateBS,
      settings.phone
    );
    const url = buildWhatsAppUrl(r.phone, text);
    window.open(url, '_blank');
    setSentCustomerIds((prev) => new Set(prev).add(r.customerId));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-md shadow-blue-500/20">
            <Gauge className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              मासिक बल्क युनिट इन्ट्री & WhatsApp सूचना
            </h2>
            <p className="text-xs text-slate-500">
              महिना छान्नुहोस्, मिटरको हालको अङ्क इन्ट्री गर्नुहोस् र एकै क्लिकमा ग्राहकहरूलाई WhatsApp बिल पठाउनुहोस्
            </p>
          </div>
        </div>

        {/* WhatsApp Launch Button */}
        <button
          onClick={() => setIsWhatsAppModalOpen(true)}
          disabled={currentMonthReadings.length === 0}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 transition shrink-0"
        >
          <Smartphone className="h-4 w-4" />
          <span>WhatsApp बल्क मेसेज पठाउनुहोस् ({toNepaliDigits(currentMonthReadings.length)})</span>
        </button>
      </div>

      {successToast && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {/* Control Panel: Month Selector & Entry Date (Auto BS with modify option) */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          {/* Year */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">साल छान्नुहोस्:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2 font-bold text-slate-800 focus:border-blue-600 focus:outline-hidden"
            >
              <option value="२०८०">२०८०</option>
              <option value="२०८१">२०८१</option>
              <option value="२०८२">२०८२</option>
              <option value="२०८३">२०८३</option>
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">महिना छान्नुहोस्:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2 font-bold text-blue-700 focus:border-blue-600 focus:outline-hidden"
            >
              {NEPALI_MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Entry Date (Auto with modify option) */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              इन्ट्री मिति (अटोमेटिक / फेर्न मिल्ने):
            </label>
            <div className="relative">
              <input
                type="text"
                value={entryDateBS}
                onChange={(e) => setEntryDateBS(e.target.value)}
                placeholder="२०८१/०७/२२"
                className="w-full rounded-xl border border-slate-300 p-2 pl-8 font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
              />
              <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* Search Box */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">ग्राहक खोज्नुहोस्:</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="नाम, आइडी वा मिटर नं..."
                className="w-full rounded-xl border border-slate-300 p-2 pl-8 text-slate-800 focus:border-blue-600 focus:outline-hidden"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Entry Table */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              बल्क मिटर रिडिङ इन्ट्री तालिका ({monthKey})
            </h3>
            <p className="text-xs text-slate-500">
              साविक अङ्क स्वतः आएको छ, हालको अङ्क टाइप गर्दा रकम स्वतः हिसाब हुनेछ।
            </p>
          </div>

          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            <Save className="h-4 w-4" />
            <span>सबै इन्ट्री सुरक्षित गर्नुहोस्</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">ग्राहक आइडी</th>
                <th className="p-3">ग्राहकको नाम</th>
                <th className="p-3">मिटर नं</th>
                <th className="p-3 text-center">साविक अङ्क (Prev)</th>
                <th className="p-3 text-center w-36">हालको अङ्क (Current)</th>
                <th className="p-3 text-center">खपत युनिट</th>
                <th className="p-3 text-right">रकम (रू.)</th>
                <th className="p-3 text-center">स्थिति / कार्य</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeCustomers.map((cust) => {
                const existing = currentMonthReadings.find((r) => r.customerId === cust.id);
                const inputVal = bulkInputs[cust.id] !== undefined ? bulkInputs[cust.id] : '';

                // Calculate preview values
                const currentNum = inputVal !== '' ? Number(inputVal) : existing ? existing.currentReading : cust.previousReading;
                const calc = calculateWaterBill(
                  cust.previousReading,
                  currentNum,
                  settings.minimumCharge,
                  settings.minimumUnitsIncluded,
                  settings.unitRateExceeding,
                  settings.penaltyGraceDays,
                  settings.penaltyPercent,
                  0
                );

                const hasSaved = !!existing;

                return (
                  <tr key={cust.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-bold text-blue-700">{cust.id}</td>
                    <td className="p-3 font-semibold text-slate-900">
                      <div>{cust.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{cust.address}</div>
                    </td>
                    <td className="p-3 text-slate-600">{toNepaliDigits(cust.meterNo)}</td>
                    <td className="p-3 text-center font-bold text-slate-700 bg-slate-50/50">
                      {toNepaliDigits(cust.previousReading)}
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min={cust.previousReading}
                        placeholder={existing ? existing.currentReading.toString() : `${cust.previousReading}`}
                        value={inputVal}
                        onChange={(e) => handleInputChange(cust.id, e.target.value)}
                        className={`w-28 rounded-xl border p-2 text-center text-xs font-black focus:outline-hidden ${
                          inputVal !== ''
                            ? 'border-blue-600 bg-blue-50/50 text-blue-900'
                            : 'border-slate-300 text-slate-900'
                        }`}
                      />
                    </td>
                    <td className="p-3 text-center font-extrabold text-blue-700">
                      {toNepaliDigits(calc.consumedUnits)}
                    </td>
                    <td className="p-3 text-right font-black text-slate-900">
                      {toNepaliDigits(calc.totalAmount.toFixed(2))}
                    </td>
                    <td className="p-3 text-center">
                      {hasSaved ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                            दर्ता भयो
                          </span>
                          <button
                            onClick={() => handleSendSingleWhatsApp(existing)}
                            className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
                            title="WhatsApp सन्देश पठाउनुहोस्"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingReading(existing)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                            title="सच्याउनुहोस्"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">बाँकी</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safe WhatsApp Bulk Queue Modal */}
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    सुरक्षित बल्क WhatsApp मेसेजिङ प्रणाली
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    WhatsApp ब्लक नहुने गरी सुरक्षित समय-अन्तरालमा सन्देश पठाउने विधि
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Anti-Ban Explanation */}
            <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900">
              <p className="font-semibold">
                🛡️ WhatsApp सुरक्षा गाइड:
              </p>
              <p className="text-[11px] mt-1 text-emerald-800">
                १०० जनालाई एकै सेकेन्डमा सर्भरबाट स्पाम पठाउँदा नम्बर ब्लक हुने जोखिम हुन्छ। त्यसैले हाम्रो प्रणालीले आधिकारिक र सुरक्षित <strong>wa.me</strong> लिङ्क र व्यक्तिगत नाम/युनिट राखेर ग्राहकलाई सिधै मेसेज पठाउँछ।
              </p>
            </div>

            {/* List of messages ready to go */}
            <div className="mt-4 max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
              {currentMonthReadings.map((r, idx) => {
                const isSent = sentCustomerIds.has(r.customerId);
                return (
                  <div key={r.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{r.customerName}</span>
                      <span className="text-slate-500 text-[11px] ml-2">({r.phone})</span>
                      <div className="text-[11px] text-blue-600 font-semibold">
                        {r.consumedUnits} युनिट • {formatCurrency(r.totalAmount)}
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => handleSendSingleWhatsApp(r)}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                          isSent
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                        }`}
                      >
                        {isSent ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>पठाइयो</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            <span>१-क्लिक पठाउनुहोस्</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500">
                जम्मा: {toNepaliDigits(currentMonthReadings.length)} वटा मेसेज
              </span>
              <button
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-100"
              >
                सम्पन्न भयो
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Single Reading Modal */}
      {editingReading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                युनिट रिडिङ सच्याउनुहोस् (Edit Reading)
              </h3>
              <button
                onClick={() => setEditingReading(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSingleReading} className="space-y-4 text-xs mt-4">
              <div>
                <label className="text-slate-600 block mb-1">ग्राहकको नाम:</label>
                <input
                  type="text"
                  disabled
                  value={editingReading.customerName}
                  className="w-full rounded-xl bg-slate-100 border border-slate-200 p-2 font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">साविक अङ्क:</label>
                  <input
                    type="number"
                    value={editingReading.previousReading}
                    onChange={(e) =>
                      setEditingReading({
                        ...editingReading,
                        previousReading: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">हालको अङ्क:</label>
                  <input
                    type="number"
                    value={editingReading.currentReading}
                    onChange={(e) =>
                      setEditingReading({
                        ...editingReading,
                        currentReading: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-blue-600 p-2 font-bold text-blue-900 bg-blue-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1">कैफियत:</label>
                <input
                  type="text"
                  value={editingReading.remarks || ''}
                  onChange={(e) =>
                    setEditingReading({ ...editingReading, remarks: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 p-2"
                />
              </div>

              <div className="pt-2 flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleDeleteReading(editingReading.id)}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>मेटाउनुहोस्</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>सच्याइएको सुरक्षित गर्नुहोस्</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
