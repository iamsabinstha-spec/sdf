import React, { useState } from 'react';
import {
  Receipt,
  Printer,
  Edit2,
  Trash2,
  PlusCircle,
  Search,
  CheckCircle,
  Calendar,
  Layers,
  Save,
  X,
  CreditCard,
} from 'lucide-react';
import {
  Customer,
  UnitReading,
  PaymentReceipt,
  OrganizationSettings,
  MasterAuditLog,
} from '../types';
import {
  toNepaliDigits,
  formatCurrency,
  numberToNepaliWords,
} from '../utils/nepaliDate';
import { ReceiptData } from '../components/ReceiptPrintModal';

interface Props {
  settings: OrganizationSettings;
  customers: Customer[];
  readings: UnitReading[];
  receipts: PaymentReceipt[];
  onSaveReceipts: (receipts: PaymentReceipt[]) => void;
  onUpdateReadings: (readings: UnitReading[]) => void;
  onAddAuditLog: (log: MasterAuditLog) => void;
  onPrintReceipt: (data: ReceiptData) => void;
}

export const AmountEntryView: React.FC<Props> = ({
  settings,
  customers,
  readings,
  receipts,
  onSaveReceipts,
  onUpdateReadings,
  onAddAuditLog,
  onPrintReceipt,
}) => {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'history'>('single');
  const [searchQuery, setSearchQuery] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Single Amount Entry State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [entryDateBS, setEntryDateBS] = useState<string>(settings.currentSystemDateBS);
  const [paymentMethod, setPaymentMethod] = useState<'नगद' | 'बैंक' | 'eSewa/Fonepay' | 'अन्य'>('नगद');
  const [manualAmount, setManualAmount] = useState<number | ''>('');
  const [remarks, setRemarks] = useState('');

  // Bulk Amount Entry State: Map of customerId -> amount
  const [bulkPayments, setBulkPayments] = useState<Record<string, number | ''>>({});

  // Editing existing receipt
  const [editingReceipt, setEditingReceipt] = useState<PaymentReceipt | null>(null);

  // Selected customer object
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Pending unpaid readings for selected customer
  const unpaidReadings = readings.filter(
    (r) => r.customerId === selectedCustomerId && r.paymentStatus === 'बाँकी'
  );

  // Calculate default single amount
  const pendingTotal = unpaidReadings.reduce((sum, r) => sum + r.totalAmount, 0);
  const currentPayAmount = manualAmount !== '' ? Number(manualAmount) : pendingTotal || 110;
  const currentAmountInWords = numberToNepaliWords(currentPayAmount);

  // Generate Automatic Receipt No
  const getNextReceiptNo = () => {
    const year = settings.currentSystemDateBS.split('/')[0] || '२०८१';
    const count = receipts.length + 1;
    const padded = String(count).padStart(4, '0');
    return `REC-${year}-${padded}`;
  };

  // Submit Single Payment
  const handleSinglePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    if (currentPayAmount <= 0) {
      alert('कृपया मान्य रकम प्रविष्ट गर्नुहोस्।');
      return;
    }

    const receiptNo = getNextReceiptNo();
    const newReceipt: PaymentReceipt = {
      id: `RCP-${Date.now()}`,
      receiptNo,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      dateBS: entryDateBS.trim() || settings.currentSystemDateBS,
      monthBS: unpaidReadings[0]?.monthBS || '२०८१-कार्तिक',
      amount: currentPayAmount,
      amountInWords: currentAmountInWords,
      paymentMethod,
      remarks: remarks || `${unpaidReadings[0]?.monthBS || 'मासिक'} खानेपानी महसुल दाखिला`,
      collectedBy: settings.authorizedPerson,
    };

    // Mark readings as paid
    const updatedReadings = readings.map((r) => {
      if (r.customerId === selectedCustomer.id && r.paymentStatus === 'बाँकी') {
        return {
          ...r,
          paymentStatus: 'चुक्ता' as const,
          paidReceiptNo: receiptNo,
          paidDateBS: entryDateBS,
        };
      }
      return r;
    });

    onUpdateReadings(updatedReadings);
    onSaveReceipts([newReceipt, ...receipts]);

    // Audit Log
    onAddAuditLog({
      id: `LOG-${Date.now()}`,
      dateBS: entryDateBS,
      module: 'महसुल रसिद',
      referenceNo: receiptNo,
      memberId: selectedCustomer.id,
      memberName: selectedCustomer.name,
      type: 'महसुल',
      debit: 0,
      credit: currentPayAmount,
      description: `${selectedCustomer.name} बाट महसुल रकम संकलन (${receiptNo})`,
    });

    setSuccessToast(`रसिद नं. ${receiptNo} सफलतापूर्वक दर्ता भयो!`);
    setTimeout(() => setSuccessToast(''), 4000);

    // Launch Receipt Print Modal immediately!
    onPrintReceipt({
      title: 'खानेपानी तथा सरसफाइ महसुल भुक्तानी रसिद',
      receiptNo,
      dateBS: entryDateBS,
      customerOrPayerName: selectedCustomer.name,
      customerOrMeterId: `${selectedCustomer.id} (मिटर: ${selectedCustomer.meterNo})`,
      phone: selectedCustomer.phone,
      address: selectedCustomer.address,
      monthBS: unpaidReadings[0]?.monthBS,
      previousReading: unpaidReadings[0]?.previousReading,
      currentReading: unpaidReadings[0]?.currentReading,
      consumedUnits: unpaidReadings[0]?.consumedUnits,
      breakdown: [
        { label: 'न्यूनतम महसुल शुल्क', amount: unpaidReadings[0]?.baseAmount || 110 },
        { label: 'अतिरिक्त युनिट शुल्क', amount: unpaidReadings[0]?.extraAmount || 0 },
        { label: 'जरिवाना / अन्य', amount: unpaidReadings[0]?.penaltyAmount || 0 },
      ],
      totalAmount: currentPayAmount,
      amountInWords: currentAmountInWords,
      paymentMethod,
      remarks,
      collectedBy: settings.authorizedPerson,
    });
  };

  // Submit Bulk Amount Entry
  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const createdReceipts: PaymentReceipt[] = [];
    let updatedReadings = [...readings];

    let currentReceiptIndex = receipts.length + 1;
    const year = settings.currentSystemDateBS.split('/')[0] || '२०८१';

    customers.forEach((cust) => {
      const val = bulkPayments[cust.id];
      if (val !== undefined && val !== '' && Number(val) > 0) {
        const amt = Number(val);
        const receiptNo = `REC-${year}-${String(currentReceiptIndex++).padStart(4, '0')}`;
        const words = numberToNepaliWords(amt);

        const rec: PaymentReceipt = {
          id: `RCP-${Date.now()}-${cust.id}`,
          receiptNo,
          customerId: cust.id,
          customerName: cust.name,
          dateBS: entryDateBS.trim() || settings.currentSystemDateBS,
          amount: amt,
          amountInWords: words,
          paymentMethod: 'नगद',
          remarks: 'बल्क महसुल संकलन',
          collectedBy: settings.authorizedPerson,
        };
        createdReceipts.push(rec);

        // Mark unpaid reading for this customer as paid
        updatedReadings = updatedReadings.map((r) => {
          if (r.customerId === cust.id && r.paymentStatus === 'बाँकी') {
            return {
              ...r,
              paymentStatus: 'चुक्ता' as const,
              paidReceiptNo: receiptNo,
              paidDateBS: entryDateBS,
            };
          }
          return r;
        });

        // Audit Log
        onAddAuditLog({
          id: `LOG-${Date.now()}-${cust.id}`,
          dateBS: entryDateBS,
          module: 'बल्क महसुल',
          referenceNo: receiptNo,
          memberId: cust.id,
          memberName: cust.name,
          type: 'महसुल',
          debit: 0,
          credit: amt,
          description: `${cust.name} बाट बल्क महसुल संकलन (${receiptNo})`,
        });
      }
    });

    if (createdReceipts.length === 0) {
      alert('कृपया कम्तीमा एक ग्राहकको भुक्तानी रकम प्रविष्ट गर्नुहोस्।');
      return;
    }

    onUpdateReadings(updatedReadings);
    onSaveReceipts([...createdReceipts, ...receipts]);
    setBulkPayments({});
    setSuccessToast(
      `${toNepaliDigits(createdReceipts.length)} वटा महसुल रसिदहरू सफलतापूर्वक दर्ता भए!`
    );
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // Modify / Update Mistaken Receipt
  const handleUpdateReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReceipt) return;

    const updatedWords = numberToNepaliWords(editingReceipt.amount);
    const updated: PaymentReceipt = {
      ...editingReceipt,
      amountInWords: updatedWords,
    };

    const updatedList = receipts.map((r) => (r.id === updated.id ? updated : r));
    onSaveReceipts(updatedList);
    setEditingReceipt(null);
    setSuccessToast('रसिदको विवरण सफलतापूर्वक मोडिफाई / सच्याइयो!');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleDeleteReceipt = (id: string) => {
    if (confirm('के तपाईं यो रसिद मेटाउन निश्चित हुनुहुन्छ?')) {
      const updatedList = receipts.filter((r) => r.id !== id);
      onSaveReceipts(updatedList);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-md shadow-blue-500/20">
            <Receipt className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              अमाउन्ट इन्ट्री, बिल भुक्तानी रसिद & सम्पादन
            </h2>
            <p className="text-xs text-slate-500">
              अटोमेटिक नेपाली मिति, अटो रसिद नम्बर, रकम अक्षरमा, १-क्लिक प्रिन्ट र गल्ती भएमा मोडिफाई गर्ने सुविधा
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('single')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'single'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            सिङ्गल रसिद काट्ने
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'bulk'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            बल्क अमाउन्ट इन्ट्री
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            रसिद इतिहास ({toNepaliDigits(receipts.length)})
          </button>
        </div>
      </div>

      {successToast && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {/* TAB 1: Single Amount Entry with Instant Receipt Print */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="md:col-span-2 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              सिङ्गल महसुल भुक्तानी दर्ता (Single Payment Collection)
            </h3>

            <form onSubmit={handleSinglePaymentSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ग्राहक छान्नुहोस्:
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value);
                      setManualAmount('');
                    }}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-800 focus:border-blue-600 focus:outline-hidden"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id} - {c.name} ({c.address})
                      </option>
                    ))}
                  </select>
                </div>

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
                      className="w-full rounded-xl border border-slate-300 p-2.5 pl-8 font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                    />
                    <Calendar className="absolute left-2.5 top-3 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Pending Bills info for selected customer */}
              <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-3">
                <div className="flex justify-between items-center text-blue-900">
                  <span className="font-bold">बाँकी महसुल विवरण:</span>
                  <span className="font-extrabold text-sm">
                    {unpaidReadings.length > 0
                      ? `${toNepaliDigits(unpaidReadings.length)} महिनाको बाँकी: ${formatCurrency(pendingTotal)}`
                      : 'कुनै बक्यौता बाँकी छैन'}
                  </span>
                </div>
                {unpaidReadings.length > 0 && (
                  <div className="mt-2 text-[11px] text-blue-800 space-y-1">
                    {unpaidReadings.map((r) => (
                      <div key={r.id} className="flex justify-between">
                        <span>
                          {r.monthBS} ({r.consumedUnits} युनिट, मिटर {r.meterNo}):
                        </span>
                        <span className="font-bold">{formatCurrency(r.totalAmount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    बुझिलिएको जम्मा रकम (रू.):
                  </label>
                  <input
                    type="number"
                    value={manualAmount !== '' ? manualAmount : pendingTotal || 110}
                    onChange={(e) => setManualAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-blue-600 bg-blue-50/30 p-2.5 text-sm font-black text-blue-900 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">भुक्तानी माध्यम:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as 'नगद' | 'बैंक' | 'eSewa/Fonepay' | 'अन्य')
                    }
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold text-slate-800"
                  >
                    <option value="नगद">नगद (Cash)</option>
                    <option value="बैंक">बैंक दाखिला (Bank Deposit)</option>
                    <option value="eSewa/Fonepay">eSewa / Fonepay / QR</option>
                    <option value="अन्य">अन्य</option>
                  </select>
                </div>
              </div>

              {/* Amount in Nepali Words */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  रकम अक्षरमा (Amount in Words):
                </span>
                <span className="text-xs font-black text-slate-900 italic mt-0.5 block">
                  {currentAmountInWords}
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">कैफियत / टिप्पणी:</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="जस्तै: नियमित मासिक महसुल भुक्तानी"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-800"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
                >
                  <Printer className="h-4 w-4" />
                  <span>रसिद दर्ता गरी तुरुन्त प्रिन्ट गर्नुहोस्</span>
                </button>
              </div>
            </form>
          </div>

          {/* Side preview info */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              रसिद प्रिन्ट पूर्वावलोकन
            </h3>
            <div className="rounded-2xl border-2 border-dashed border-slate-300 p-4 text-xs space-y-2 text-slate-700">
              <div className="text-center font-bold text-slate-900 text-sm">
                {settings.name}
              </div>
              <div className="text-center text-[10px] text-slate-500">
                रसिद नं: <span className="font-bold text-blue-700">{getNextReceiptNo()} (Auto)</span>
              </div>
              <div className="border-t border-slate-200 pt-2 space-y-1">
                <p>
                  <strong>ग्राहक: </strong>
                  {selectedCustomer?.name} ({selectedCustomer?.id})
                </p>
                <p>
                  <strong>मिति: </strong>
                  {entryDateBS}
                </p>
                <p>
                  <strong>रकम: </strong>
                  <span className="font-extrabold text-blue-800">{formatCurrency(currentPayAmount)}</span>
                </p>
                <p className="text-[11px] italic bg-slate-100 p-1.5 rounded-lg text-slate-800">
                  {currentAmountInWords}
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              * दर्ता गर्नासाथ A4 वा रसिद प्रिन्टरमा प्रिन्ट हुने आधिकारिक रसिद डायलग खुल्नेछ।
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Bulk Amount Entry */}
      {activeTab === 'bulk' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                बल्क अमाउन्ट इन्ट्री (Bulk Bill Collection)
              </h3>
              <p className="text-xs text-slate-500">
                एकै पटक धेरै ग्राहकहरूको महसुल भुक्तानी रकम इन्ट्री गर्नुहोस्, अटोमेटिक रसिद नम्बर जेनेरेट हुनेछ।
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-600">मिति:</span>
                <input
                  type="text"
                  value={entryDateBS}
                  onChange={(e) => setEntryDateBS(e.target.value)}
                  className="w-28 rounded-xl border border-slate-300 p-1.5 text-xs font-bold text-slate-800"
                />
              </div>

              <button
                onClick={handleBulkSubmit}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
              >
                <Save className="h-4 w-4" />
                <span>सबै बल्क रकम सुरक्षित गर्नुहोस्</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">ग्राहक आइडी</th>
                  <th className="p-3">ग्राहकको नाम</th>
                  <th className="p-3">ठेगाना / टोल</th>
                  <th className="p-3 text-right">बक्यौता रकम (रू.)</th>
                  <th className="p-3 text-center w-40">भुक्तानी रकम इन्ट्री (रू.)</th>
                  <th className="p-3">रकम अक्षरमा (पूर्वावलोकन)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => {
                  const custUnpaid = readings
                    .filter((r) => r.customerId === c.id && r.paymentStatus === 'बाँकी')
                    .reduce((sum, r) => sum + r.totalAmount, 0);

                  const inputVal = bulkPayments[c.id] !== undefined ? bulkPayments[c.id] : '';
                  const numVal = inputVal !== '' ? Number(inputVal) : 0;
                  const words = numVal > 0 ? numberToNepaliWords(numVal) : '-';

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-bold text-blue-700">{c.id}</td>
                      <td className="p-3 font-semibold text-slate-900">{c.name}</td>
                      <td className="p-3 text-slate-500">{c.address}</td>
                      <td className="p-3 text-right font-bold text-rose-600">
                        {toNepaliDigits(custUnpaid.toFixed(2))}
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          placeholder={custUnpaid > 0 ? `${custUnpaid}` : '0'}
                          value={inputVal}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Number(e.target.value);
                            setBulkPayments((prev) => ({ ...prev, [c.id]: val }));
                          }}
                          className={`w-32 rounded-xl border p-2 text-center font-bold text-xs ${
                            inputVal !== ''
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                              : 'border-slate-300'
                          }`}
                        />
                      </td>
                      <td className="p-3 text-slate-600 italic text-[11px]">{words}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Receipts History & Modify Option */}
      {activeTab === 'history' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                काटिएका रसिदहरूको इतिहास & सम्पादन (Modify / Reprint)
              </h3>
              <p className="text-xs text-slate-500">
                गल्ती भएको खण्डमा यहाँबाट रसिदको रकम वा विवरण सच्याउन वा पुनः प्रिन्ट गर्न सकिन्छ।
              </p>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="रसिद नं वा ग्राहकको नाम खोज्नुहोस्..."
                className="w-64 rounded-xl border border-slate-300 p-2 pl-8 text-xs text-slate-800"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">रसिद नं</th>
                  <th className="p-3">मिति (BS)</th>
                  <th className="p-3">ग्राहकको नाम</th>
                  <th className="p-3 text-right">रकम (रू.)</th>
                  <th className="p-3">रकम अक्षरमा</th>
                  <th className="p-3">माध्यम</th>
                  <th className="p-3 text-center">कार्यहरू</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receipts
                  .filter(
                    (r) =>
                      r.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      r.customerName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-bold text-blue-700">{rec.receiptNo}</td>
                      <td className="p-3 text-slate-600">{toNepaliDigits(rec.dateBS)}</td>
                      <td className="p-3 font-semibold text-slate-900">{rec.customerName}</td>
                      <td className="p-3 text-right font-black text-slate-900">
                        {toNepaliDigits(rec.amount.toFixed(2))}
                      </td>
                      <td className="p-3 text-slate-600 italic text-[11px]">
                        {rec.amountInWords}
                      </td>
                      <td className="p-3">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {rec.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Reprint Button */}
                          <button
                            onClick={() =>
                              onPrintReceipt({
                                title: 'खानेपानी तथा सरसफाइ महसुल भुक्तानी रसिद',
                                receiptNo: rec.receiptNo,
                                dateBS: rec.dateBS,
                                customerOrPayerName: rec.customerName,
                                customerOrMeterId: rec.customerId,
                                amountInWords: rec.amountInWords,
                                totalAmount: rec.amount,
                                paymentMethod: rec.paymentMethod,
                                remarks: rec.remarks,
                                collectedBy: rec.collectedBy,
                              })
                            }
                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
                            title="पुनः प्रिन्ट गर्नुहोस्"
                          >
                            <Printer className="h-4 w-4" />
                          </button>

                          {/* Modify / Edit Button */}
                          <button
                            onClick={() => setEditingReceipt(rec)}
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                            title="सच्याउनुहोस् (Modify)"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteReceipt(rec.id)}
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                            title="मेटाउनुहोस्"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Modify Receipt Modal */}
      {editingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                रसिद विवरण मोडिफाई / सम्पादन गर्नुहोस्
              </h3>
              <button
                onClick={() => setEditingReceipt(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateReceipt} className="space-y-4 text-xs mt-4">
              <div>
                <label className="text-slate-600 block mb-1">रसिद नं:</label>
                <input
                  type="text"
                  disabled
                  value={editingReceipt.receiptNo}
                  className="w-full rounded-xl bg-slate-100 border border-slate-200 p-2 font-bold text-blue-700"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">ग्राहकको नाम:</label>
                <input
                  type="text"
                  value={editingReceipt.customerName}
                  onChange={(e) =>
                    setEditingReceipt({ ...editingReceipt, customerName: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">मिति (BS):</label>
                  <input
                    type="text"
                    value={editingReceipt.dateBS}
                    onChange={(e) =>
                      setEditingReceipt({ ...editingReceipt, dateBS: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">रकम (रू.):</label>
                  <input
                    type="number"
                    value={editingReceipt.amount}
                    onChange={(e) =>
                      setEditingReceipt({
                        ...editingReceipt,
                        amount: Number(e.target.value),
                        amountInWords: numberToNepaliWords(Number(e.target.value)),
                      })
                    }
                    className="w-full rounded-xl border border-blue-600 p-2 font-black text-blue-900 bg-blue-50/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1">रकम अक्षरमा (Auto Updated):</label>
                <input
                  type="text"
                  readOnly
                  value={numberToNepaliWords(editingReceipt.amount)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2 italic text-slate-800"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">कैफियत:</label>
                <input
                  type="text"
                  value={editingReceipt.remarks || ''}
                  onChange={(e) =>
                    setEditingReceipt({ ...editingReceipt, remarks: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 p-2"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingReceipt(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-100"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700"
                >
                  <Save className="h-4 w-4" />
                  <span>परिवर्तन सुरक्षित गर्नुहोस्</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
