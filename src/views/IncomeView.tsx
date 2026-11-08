import React, { useState } from 'react';
import {
  TrendingUp,
  PlusCircle,
  Printer,
  Calendar,
  Search,
  CheckCircle,
  FileText,
  DollarSign,
  Filter,
} from 'lucide-react';
import { IncomeRecord, OrganizationSettings, MasterAuditLog } from '../types';
import {
  toNepaliDigits,
  formatCurrency,
  numberToNepaliWords,
} from '../utils/nepaliDate';
import { ReceiptData } from '../components/ReceiptPrintModal';

interface Props {
  settings: OrganizationSettings;
  incomes: IncomeRecord[];
  onSaveIncomes: (incomes: IncomeRecord[]) => void;
  onAddAuditLog: (log: MasterAuditLog) => void;
  onPrintReceipt: (data: ReceiptData) => void;
}

export const INCOME_CATEGORIES = [
  'मर्मत आम्दानी',
  'नयाँ धारा सेवा शुल्क',
  'अनुदान',
  'कसैले दिएको सहयोग',
  'अन्य आम्दानी',
];

export const IncomeView: React.FC<Props> = ({
  settings,
  incomes,
  onSaveIncomes,
  onAddAuditLog,
  onPrintReceipt,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'entry'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [successToast, setSuccessToast] = useState('');

  // Form State
  const [category, setCategory] = useState<string>(INCOME_CATEGORIES[0]);
  const [dateBS, setDateBS] = useState<string>(settings.currentSystemDateBS); // Auto BS Date
  const [payerName, setPayerName] = useState<string>('');
  const [payerPhone, setPayerPhone] = useState<string>('');
  const [amount, setAmount] = useState<number>(5000);
  const [paymentMethod, setPaymentMethod] = useState<string>('नगद');
  const [remarks, setRemarks] = useState<string>('');

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  const getNextIncomeReceiptNo = () => {
    const year = settings.currentSystemDateBS.split('/')[0] || '२०८१';
    const count = incomes.length + 1;
    return `INC-${year}-${String(count).padStart(3, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payerName.trim() || amount <= 0) {
      alert('कृपया बुझाउने व्यक्तिको नाम र रकम प्रविष्ट गर्नुहोस्।');
      return;
    }

    const receiptNo = getNextIncomeReceiptNo();
    const words = numberToNepaliWords(amount);

    const record: IncomeRecord = {
      id: `INC-${Date.now()}`,
      receiptNo,
      dateBS: dateBS.trim() || settings.currentSystemDateBS,
      category,
      payerName,
      phone: payerPhone,
      amount,
      amountInWords: words,
      paymentMethod,
      remarks,
      collectedBy: settings.authorizedPerson,
    };

    onSaveIncomes([record, ...incomes]);

    // Audit Log
    onAddAuditLog({
      id: `LOG-${Date.now()}`,
      dateBS: record.dateBS,
      module: 'आम्दानी',
      referenceNo: receiptNo,
      memberName: payerName,
      type: 'आम्दानी',
      debit: 0,
      credit: amount,
      description: `${category} आम्दानी संकलन (${payerName}) - रू ${amount}`,
    });

    setSuccessToast(`आम्दानी रसिद नं. ${receiptNo} सफलतापूर्वक दर्ता भयो!`);
    setTimeout(() => setSuccessToast(''), 4000);

    // Prompt print
    onPrintReceipt({
      title: 'खानेपानी तथा सरसफाइ संस्था - विविध आम्दानी रसिद',
      receiptNo,
      dateBS: record.dateBS,
      customerOrPayerName: payerName,
      phone: payerPhone,
      breakdown: [{ label: category, amount }],
      totalAmount: amount,
      amountInWords: words,
      paymentMethod,
      remarks,
      collectedBy: settings.authorizedPerson,
    });

    // Reset Form
    setPayerName('');
    setPayerPhone('');
    setRemarks('');
    setActiveTab('list');
  };

  const filteredIncomes = incomes.filter((i) => {
    const matchCat = filterCategory === 'ALL' || i.category === filterCategory;
    const matchQuery =
      i.payerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-600 p-3 text-white shadow-md shadow-emerald-500/20">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              विविध आम्दानी व्यवस्थापन & रसिद
            </h2>
            <p className="text-xs text-slate-500">
              मर्मत आम्दानी, नयाँ धारा सेवा शुल्क, अनुदान, सहयोग तथा अन्य आम्दानी (नेपाली मिति अटोमेटिक)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-right">
            <span className="text-[10px] text-emerald-800 font-bold block uppercase tracking-wider">
              कुल आम्दानी:
            </span>
            <span className="text-base font-black text-emerald-700">
              {formatCurrency(totalIncome)}
            </span>
          </div>

          <button
            onClick={() => setActiveTab('entry')}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>+ नयाँ आम्दानी दाखिला</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('list')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'list'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          आम्दानी विवरण सूची ({toNepaliDigits(incomes.length)})
        </button>
        <button
          onClick={() => setActiveTab('entry')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'entry'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          + नयाँ आम्दानी इन्ट्री फारम
        </button>
      </div>

      {/* TAB 1: Incomes List Table */}
      {activeTab === 'list' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
            {/* Filter by Category */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                onClick={() => setFilterCategory('ALL')}
                className={`rounded-xl px-3 py-1.5 font-bold transition ${
                  filterCategory === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                सबै शीर्षक
              </button>
              {INCOME_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 font-bold transition ${
                    filterCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="बुझाउनेको नाम वा रसिद खोज्नुहोस्..."
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
                  <th className="p-3">आम्दानी शीर्षक</th>
                  <th className="p-3">बुझाउने व्यक्ति / निकाय</th>
                  <th className="p-3 text-right">रकम (रू.)</th>
                  <th className="p-3">भुक्तानी माध्यम</th>
                  <th className="p-3">कैफियत</th>
                  <th className="p-3 text-center">प्रिन्ट</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncomes.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3 font-bold text-blue-700">{inc.receiptNo}</td>
                    <td className="p-3 text-slate-600 font-medium">{toNepaliDigits(inc.dateBS)}</td>
                    <td className="p-3">
                      <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-bold text-emerald-800 text-[11px]">
                        {inc.category}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-900">
                      <div>{inc.payerName}</div>
                      {inc.phone && <div className="text-[10px] text-slate-400">{toNepaliDigits(inc.phone)}</div>}
                    </td>
                    <td className="p-3 text-right font-black text-emerald-700">
                      {toNepaliDigits(inc.amount.toFixed(2))}
                    </td>
                    <td className="p-3 text-slate-600 font-medium">{inc.paymentMethod}</td>
                    <td className="p-3 text-slate-500">{inc.remarks}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() =>
                          onPrintReceipt({
                            title: 'खानेपानी तथा सरसफाइ संस्था - विविध आम्दानी रसिद',
                            receiptNo: inc.receiptNo,
                            dateBS: inc.dateBS,
                            customerOrPayerName: inc.payerName,
                            phone: inc.phone,
                            breakdown: [{ label: inc.category, amount: inc.amount }],
                            totalAmount: inc.amount,
                            amountInWords: inc.amountInWords,
                            paymentMethod: inc.paymentMethod,
                            remarks: inc.remarks,
                            collectedBy: inc.collectedBy,
                          })
                        }
                        className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
                        title="रसिद प्रिन्ट गर्नुहोस्"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Income Entry Form */}
      {activeTab === 'entry' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            नयाँ विविध आम्दानी रसिद दाखिला फारम
          </h3>
          <p className="text-xs text-slate-500">
            नेपाली मिति अटोमेटिक आएको छ, शीर्षक छान्नुहोस् र रकम प्रविष्ट गर्नुहोस्।
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  आम्दानी शीर्षक छान्नुहोस्:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-emerald-800 bg-white"
                >
                  {INCOME_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  आम्दानी मिति (अटोमेटिक / फेर्न मिल्ने):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={dateBS}
                    onChange={(e) => setDateBS(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 pl-8 font-bold text-slate-900"
                    required
                  />
                  <Calendar className="absolute left-2.5 top-3 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">रकम (रू.):</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-emerald-500 bg-emerald-50/30 p-2.5 text-sm font-black text-emerald-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  बुझाउने व्यक्ति / दाताको नाम:
                </label>
                <input
                  type="text"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="जस्तै: दिलीप तामाङ / नगरपालिका"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">फोन नम्बर:</label>
                <input
                  type="text"
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value)}
                  placeholder="९८४१००००००"
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">भुक्तानी माध्यम:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold"
                >
                  <option value="नगद">नगद (Cash)</option>
                  <option value="बैंक ट्रान्सफर">बैंक ट्रान्सफर / चेक</option>
                  <option value="eSewa/Fonepay">eSewa / Fonepay / QR</option>
                  <option value="अन्य">अन्य</option>
                </select>
              </div>
            </div>

            {/* Amount In Words */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                रकम अक्षरमा (Amount in Words):
              </span>
              <span className="text-xs font-bold text-slate-900 italic mt-0.5 block">
                {numberToNepaliWords(amount)}
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">कैफियत / विवरण:</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="जस्तै: नयाँ व्यक्तिगत धारा जडान शुल्क बापत"
                className="w-full rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="rounded-xl border border-slate-300 px-5 py-2.5 font-bold text-slate-700 hover:bg-slate-100"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white shadow-md hover:bg-emerald-700 transition"
              >
                <Printer className="h-4 w-4" />
                <span>आम्दानी दर्ता गरी रसिद प्रिन्ट गर्नुहोस्</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
