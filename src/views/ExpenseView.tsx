import React, { useState } from 'react';
import {
  TrendingDown,
  PlusCircle,
  Calendar,
  Search,
  CheckCircle,
  Printer,
  FileSpreadsheet,
  Filter,
  DollarSign,
} from 'lucide-react';
import { ExpenseRecord, OrganizationSettings, MasterAuditLog } from '../types';
import {
  toNepaliDigits,
  formatCurrency,
  numberToNepaliWords,
} from '../utils/nepaliDate';

interface Props {
  settings: OrganizationSettings;
  expenses: ExpenseRecord[];
  onSaveExpenses: (expenses: ExpenseRecord[]) => void;
  onAddAuditLog: (log: MasterAuditLog) => void;
}

export const EXPENSE_CATEGORIES = [
  'विद्युत महसुल',
  'मर्मत खर्च',
  'सामग्री खरिद',
  'लेखा परीक्षण शुल्क',
  'गाडीभाडा खर्च',
  'चिया खाना खाजा खर्च',
  'साधारण सभा खर्च',
  'प्रिन्ट खर्च',
  'रिचार्ज खर्च',
  'पेट्रोल खर्च',
  'मसलन्द तथा stationary खर्च',
  'अन्य खर्चहरू',
];

export const ExpenseView: React.FC<Props> = ({
  settings,
  expenses,
  onSaveExpenses,
  onAddAuditLog,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'entry' | 'category-summary'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterFromDate, setFilterFromDate] = useState<string>('२०८०/०१/०१');
  const [filterToDate, setFilterToDate] = useState<string>(settings.currentSystemDateBS);
  const [successToast, setSuccessToast] = useState('');

  // Form State
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [dateBS, setDateBS] = useState<string>(settings.currentSystemDateBS);
  const [paidTo, setPaidTo] = useState<string>('');
  const [amount, setAmount] = useState<number>(3500);
  const [paymentMethod, setPaymentMethod] = useState<string>('नगद');
  const [remarks, setRemarks] = useState<string>('');

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  const getNextExpenseVoucherNo = () => {
    const year = settings.currentSystemDateBS.split('/')[0] || '२०८१';
    const count = expenses.length + 1;
    return `EXP-${year}-${String(count).padStart(3, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paidTo.trim() || amount <= 0) {
      alert('कृपया भुक्तानी पाउने व्यक्ति/फर्मको नाम र रकम प्रविष्ट गर्नुहोस्।');
      return;
    }

    const voucherNo = getNextExpenseVoucherNo();
    const words = numberToNepaliWords(amount);

    const record: ExpenseRecord = {
      id: `EXP-${Date.now()}`,
      voucherNo,
      dateBS: dateBS.trim() || settings.currentSystemDateBS,
      category,
      paidTo,
      amount,
      amountInWords: words,
      paymentMethod,
      approvedBy: settings.authorizedPerson,
      remarks,
    };

    onSaveExpenses([record, ...expenses]);

    // Audit Log
    onAddAuditLog({
      id: `LOG-${Date.now()}`,
      dateBS: record.dateBS,
      module: 'खर्च भुक्तानी',
      referenceNo: voucherNo,
      type: 'खर्च',
      debit: amount,
      credit: 0,
      description: `${category} भुक्तानी (${paidTo}) - रू ${amount}`,
    });

    setSuccessToast(`खर्च भौचर नं. ${voucherNo} सफलतापूर्वक दर्ता भयो!`);
    setTimeout(() => setSuccessToast(''), 4000);

    setPaidTo('');
    setRemarks('');
    setActiveTab('list');
  };

  // Group expenses by category
  const categoryTotals: Record<string, number> = {};
  EXPENSE_CATEGORIES.forEach((cat) => {
    categoryTotals[cat] = 0;
  });
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const filteredExpenses = expenses.filter((e) => {
    const matchCat = filterCategory === 'ALL' || e.category === filterCategory;
    const matchQuery =
      e.paidTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.voucherNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-rose-600 p-3 text-white shadow-md shadow-rose-500/20">
            <TrendingDown className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              खर्च व्यवस्थापन तथा शीर्षकगत स्टेटमेन्ट
            </h2>
            <p className="text-xs text-slate-500">
              विद्युत, मर्मत, सामग्री, चिया खाजा, साधारण सभा, मसलन्द आदि शीर्षकहरूमा खर्च दर्ता र मिति अनुसार स्टेटमेन्ट
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-2 text-right">
            <span className="text-[10px] text-rose-800 font-bold block uppercase tracking-wider">
              कुल खर्च रकम:
            </span>
            <span className="text-base font-black text-rose-700">
              {formatCurrency(totalExpense)}
            </span>
          </div>

          <button
            onClick={() => setActiveTab('entry')}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>+ नयाँ खर्च दाखिला</span>
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
          खर्च भौचर सूची ({toNepaliDigits(expenses.length)})
        </button>
        <button
          onClick={() => setActiveTab('category-summary')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'category-summary'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          शीर्षकगत खर्च स्टेटमेन्ट (Date-wise)
        </button>
        <button
          onClick={() => setActiveTab('entry')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'entry'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          + नयाँ खर्च इन्ट्री फारम
        </button>
      </div>

      {/* TAB 1: Expenses List */}
      {activeTab === 'list' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
            {/* Category Badges Filter */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                onClick={() => setFilterCategory('ALL')}
                className={`rounded-xl px-3 py-1 font-bold transition ${
                  filterCategory === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                सबै
              </button>
              {EXPENSE_CATEGORIES.slice(0, 6).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`rounded-xl px-3 py-1 font-bold transition ${
                    filterCategory === cat
                      ? 'bg-rose-600 text-white shadow-xs'
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
                placeholder="पाउने व्यक्ति वा भौचर खोज्नुहोस्..."
                className="w-64 rounded-xl border border-slate-300 p-2 pl-8 text-xs text-slate-800"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">भौचर नं</th>
                  <th className="p-3">मिति (BS)</th>
                  <th className="p-3">खर्च शीर्षक</th>
                  <th className="p-3">भुक्तानी पाउने व्यक्ति / फर्म</th>
                  <th className="p-3 text-right">रकम (रू.)</th>
                  <th className="p-3">भुक्तानी माध्यम</th>
                  <th className="p-3">स्वीकृत गर्ने</th>
                  <th className="p-3">कैफियत</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3 font-bold text-blue-700">{exp.voucherNo}</td>
                    <td className="p-3 text-slate-600 font-medium">{toNepaliDigits(exp.dateBS)}</td>
                    <td className="p-3">
                      <span className="rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 font-bold text-rose-800 text-[11px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-900">{exp.paidTo}</td>
                    <td className="p-3 text-right font-black text-rose-700">
                      {toNepaliDigits(exp.amount.toFixed(2))}
                    </td>
                    <td className="p-3 text-slate-600">{exp.paymentMethod}</td>
                    <td className="p-3 text-slate-700">{exp.approvedBy}</td>
                    <td className="p-3 text-slate-500">{exp.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Categorywise Expense Statement with Date Filter */}
      {activeTab === 'category-summary' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                कुन शीर्षकमा कति खर्च भयो स्टेटमेन्ट (Category-wise Statement)
              </h3>
              <p className="text-xs text-slate-500">
                कुन मितिदेखि कुन मितिसम्म कुन शीर्षकमा कति खर्च भयो हेर्ने र प्रिन्ट गर्ने
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <Printer className="h-4 w-4" />
              <span>खर्च स्टेटमेन्ट प्रिन्ट</span>
            </button>
          </div>

          {/* Date Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="font-bold text-slate-700 block mb-1">सुरु मिति (BS):</label>
              <input
                type="text"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">अन्तिम मिति (BS):</label>
              <input
                type="text"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 bg-white"
              />
            </div>
          </div>

          {/* Summary Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">क्र.सं.</th>
                  <th className="p-3">खर्चको शीर्षक (Expenditure Head)</th>
                  <th className="p-3 text-right">खर्च भएको कुल रकम (रू.)</th>
                  <th className="p-3 text-center">प्रतिशत (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {EXPENSE_CATEGORIES.map((cat, idx) => {
                  const amt = categoryTotals[cat] || 0;
                  const pct = totalExpense > 0 ? ((amt / totalExpense) * 100).toFixed(1) : '0';
                  return (
                    <tr key={cat} className="hover:bg-slate-50/50">
                      <td className="p-3 text-slate-400 font-bold">{toNepaliDigits(idx + 1)}</td>
                      <td className="p-3 font-semibold text-slate-900">{cat}</td>
                      <td className="p-3 text-right font-black text-rose-700">
                        {toNepaliDigits(amt.toFixed(2))}
                      </td>
                      <td className="p-3 text-center text-slate-600 font-semibold">
                        {toNepaliDigits(pct)}%
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-50 font-black border-t-2 border-slate-300 text-slate-900">
                  <td colSpan={2} className="p-3 text-right">
                    जम्मा कुल खर्च:
                  </td>
                  <td className="p-3 text-right text-rose-800 text-sm">
                    {formatCurrency(totalExpense)}
                  </td>
                  <td className="p-3 text-center">१००%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Expense Entry Form */}
      {activeTab === 'entry' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            नयाँ खर्च भौचर दाखिला फारम
          </h3>
          <p className="text-xs text-slate-500">
            नेपाली मिति अटोमेटिक आएको छ, शीर्षक छान्नुहोस् र रकम प्रविष्ट गर्नुहोस्।
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  खर्च शीर्षक छान्नुहोस्:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-rose-800 bg-white"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  खर्च मिति (अटोमेटिक / फेर्न मिल्ने):
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
                <label className="font-bold text-slate-700 block mb-1">खर्च रकम (रू.):</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-rose-500 bg-rose-50/30 p-2.5 text-sm font-black text-rose-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  भुक्तानी पाउने व्यक्ति वा फर्मको नाम:
                </label>
                <input
                  type="text"
                  value={paidTo}
                  onChange={(e) => setPaidTo(e.target.value)}
                  placeholder="जस्तै: विद्युत प्राधिकरण / सिन्धु हार्डवेयर"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold"
                  required
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
                  <option value="चेक">चेक (Cheque)</option>
                  <option value="eSewa/Fonepay">eSewa / Fonepay / QR</option>
                  <option value="बैंक ट्रान्सफर">बैंक ट्रान्सफर</option>
                </select>
              </div>
            </div>

            {/* Words */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                रकम अक्षरमा (Amount in Words):
              </span>
              <span className="text-xs font-bold text-slate-900 italic mt-0.5 block">
                {numberToNepaliWords(amount)}
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">कैफियत / प्रयोजन:</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="जस्तै: मुख्य पाइपलाइन लिकेज मर्मत सामान खरिद"
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
                className="flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 font-bold text-white shadow-md hover:bg-rose-700 transition"
              >
                <span>खर्च भौचर सुरक्षित गर्नुहोस्</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
