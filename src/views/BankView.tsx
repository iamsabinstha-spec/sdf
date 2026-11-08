import React, { useState } from 'react';
import {
  Building2,
  ArrowDownRight,
  ArrowUpRight,
  PlusCircle,
  Calendar,
  Printer,
  CheckCircle,
  Search,
  Filter,
  CreditCard,
  Layers,
} from 'lucide-react';
import {
  BankAccount,
  BankTransaction,
  OrganizationSettings,
  MasterAuditLog,
} from '../types';
import { toNepaliDigits, formatCurrency } from '../utils/nepaliDate';

interface Props {
  settings: OrganizationSettings;
  banks: BankAccount[];
  bankTransactions: BankTransaction[];
  onSaveBanks: (banks: BankAccount[]) => void;
  onSaveTransactions: (txns: BankTransaction[]) => void;
  onAddAuditLog: (log: MasterAuditLog) => void;
}

export const BankView: React.FC<Props> = ({
  settings,
  banks,
  bankTransactions,
  onSaveBanks,
  onSaveTransactions,
  onAddAuditLog,
}) => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'entry' | 'statements'>('accounts');
  const [successToast, setSuccessToast] = useState('');

  // Transaction Entry Form State
  const [selectedBankId, setSelectedBankId] = useState<string>(banks[0]?.id || '');
  const [txnType, setTxnType] = useState<'डिपोजिट' | 'विथड्र'>('डिपोजिट');
  const [entryDateBS, setEntryDateBS] = useState<string>(settings.currentSystemDateBS);
  const [txnAmount, setTxnAmount] = useState<number>(25000);
  const [voucherNo, setVoucherNo] = useState<string>('VCH-');
  const [personName, setPersonName] = useState<string>(settings.authorizedPerson);
  const [remarks, setRemarks] = useState<string>('मासिक आम्दानी संकलन दाखिला');

  // Statement Filters
  const [filterBankId, setFilterBankId] = useState<string>('ALL');
  const [filterFromDate, setFilterFromDate] = useState<string>('२०८०/०१/०१');
  const [filterToDate, setFilterToDate] = useState<string>(settings.currentSystemDateBS);

  // Add New Bank Account State
  const [newBankName, setNewBankName] = useState('');
  const [newAccountNo, setNewAccountNo] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [newBalance, setNewBalance] = useState<number>(0);
  const [showAddBank, setShowAddBank] = useState(false);

  // Total balance across all bank accounts
  const totalBalance = banks.reduce((sum, b) => sum + b.balance, 0);

  // Handle Transaction Submit
  const handleTxnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bank = banks.find((b) => b.id === selectedBankId);
    if (!bank) return;
    if (txnAmount <= 0) {
      alert('कृपया मान्य रकम प्रविष्ट गर्नुहोस्।');
      return;
    }

    if (txnType === 'विथड्र' && txnAmount > bank.balance) {
      alert('बैंक खातामा मौज्दात रकम भन्दा बढी विथड्र गर्न मिल्दैन!');
      return;
    }

    const newBalance =
      txnType === 'डिपोजिट' ? bank.balance + txnAmount : bank.balance - txnAmount;

    const newTxn: BankTransaction = {
      id: `BTX-${Date.now()}`,
      bankId: bank.id,
      bankName: bank.bankName,
      dateBS: entryDateBS.trim() || settings.currentSystemDateBS,
      type: txnType,
      amount: txnAmount,
      voucherNo: voucherNo || `BNK-${Date.now().toString().slice(-4)}`,
      depositedOrWithdrawnBy: personName,
      remarks,
      balanceAfter: newBalance,
    };

    // Update bank balance
    const updatedBanks = banks.map((b) => (b.id === bank.id ? { ...b, balance: newBalance } : b));
    onSaveBanks(updatedBanks);
    onSaveTransactions([newTxn, ...bankTransactions]);

    // Audit Log
    onAddAuditLog({
      id: `LOG-${Date.now()}`,
      dateBS: entryDateBS,
      module: 'बैंक कारोबार',
      referenceNo: newTxn.voucherNo,
      type: txnType === 'डिपोजिट' ? 'बैंक डिपोजिट' : 'बैंक विथड्र',
      debit: txnType === 'विथड्र' ? txnAmount : 0,
      credit: txnType === 'डिपोजिट' ? txnAmount : 0,
      description: `${bank.bankName} मा ${txnType} (भौचर: ${newTxn.voucherNo}) - रू ${txnAmount}`,
    });

    setSuccessToast(`बैंक ${txnType} सफलतापूर्वक सुरक्षित भयो!`);
    setTimeout(() => setSuccessToast(''), 4000);
    setActiveTab('statements');
  };

  // Add new bank account
  const handleAddBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName.trim() || !newAccountNo.trim()) return;

    const newAccount: BankAccount = {
      id: `BNK-${Date.now()}`,
      bankName: newBankName,
      accountNo: newAccountNo,
      branch: newBranch || 'शाखा',
      accountType: 'चल्ती',
      balance: Number(newBalance) || 0,
    };

    onSaveBanks([...banks, newAccount]);
    setShowAddBank(false);
    setNewBankName('');
    setNewAccountNo('');
    setNewBranch('');
    setNewBalance(0);
    setSuccessToast('नयाँ बैंक खाता सफलतापूर्वक थपियो!');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Filtered transactions for statement
  const filteredTxns = bankTransactions.filter(
    (t) => filterBankId === 'ALL' || t.bankId === filterBankId
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-md shadow-blue-500/20">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              बैंक कारोबार तथा मौज्दात व्यवस्थापन
            </h2>
            <p className="text-xs text-slate-500">
              डिपोजिट र विथड्र इन्ट्री, अटोमेटिक/परिवर्तनशील मिति, बैंकवाइज स्टेटमेन्ट र कुल मौज्दात
            </p>
          </div>
        </div>

        {/* Global Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('entry')}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>+ डिपोजिट / विथड्र इन्ट्री</span>
          </button>
          <button
            onClick={() => setShowAddBank(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <span>+ नयाँ बैंक खाता</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {/* Total Balance Ribbon */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-emerald-100 text-xs font-semibold block uppercase tracking-wider">
            सबै बैंक खाताहरूमा कुल मौज्दात (Total Bank Balance):
          </span>
          <div className="text-2xl sm:text-3xl font-black mt-1">
            {formatCurrency(totalBalance)}
          </div>
        </div>
        <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 text-xs font-bold">
          कुल बैंक खाताहरू: {toNepaliDigits(banks.length)} वटा
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'accounts'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          कुन कुन बैंकमा खाता छ (Accounts)
        </button>
        <button
          onClick={() => setActiveTab('entry')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'entry'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          डिपोजिट / विथड्र इन्ट्री फारम
        </button>
        <button
          onClick={() => setActiveTab('statements')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'statements'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          बैंकवाइज स्टेटमेन्ट (Date-wise)
        </button>
      </div>

      {/* TAB 1: Bank Accounts Cards */}
      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {banks.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs hover:border-blue-300 transition space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{b.bankName}</h3>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {b.accountType}
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-slate-600">
                <p>
                  <strong>खाता नम्बर: </strong>
                  <span className="font-mono font-bold text-slate-900">{toNepaliDigits(b.accountNo)}</span>
                </p>
                <p>
                  <strong>शाखा: </strong>
                  {b.branch}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-[11px] text-slate-500 font-medium">खाता मौज्दात:</span>
                <span className="text-lg font-black text-emerald-600">
                  {formatCurrency(b.balance)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Deposit / Withdrawal Entry Form */}
      {activeTab === 'entry' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            बैंक डिपोजिट / विथड्र इन्ट्री फारम
          </h3>
          <p className="text-xs text-slate-500">
            मिति अटोमेटिक आएको छ, आवश्यक परेमा परिवर्तन गर्न सकिन्छ।
          </p>

          <form onSubmit={handleTxnSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">बैंक खाता छान्नुहोस्:</label>
                <select
                  value={selectedBankId}
                  onChange={(e) => setSelectedBankId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-800 focus:border-blue-600 focus:outline-hidden"
                >
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} (मौज्दात: {formatCurrency(b.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">कारोबार प्रकार:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxnType('डिपोजिट')}
                    className={`rounded-xl py-2 font-bold border transition ${
                      txnType === 'डिपोजिट'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    + डिपोजिट (जम्मा)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxnType('विथड्र')}
                    className={`rounded-xl py-2 font-bold border transition ${
                      txnType === 'विथड्र'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    - विथड्र (झिक्ने)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  कारोबार मिति (अटोमेटिक / फेर्न मिल्ने):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={entryDateBS}
                    onChange={(e) => setEntryDateBS(e.target.value)}
                    placeholder="२०८१/०७/२२"
                    className="w-full rounded-xl border border-slate-300 p-2.5 pl-8 font-bold text-slate-900"
                    required
                  />
                  <Calendar className="absolute left-2.5 top-3 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">रकम (रू.):</label>
                <input
                  type="number"
                  value={txnAmount}
                  onChange={(e) => setTxnAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-blue-600 bg-blue-50/30 p-2.5 text-sm font-black text-blue-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  भौचर / चेक नम्बर:
                </label>
                <input
                  type="text"
                  value={voucherNo}
                  onChange={(e) => setVoucherNo(e.target.value)}
                  placeholder="VCH-RBB-001"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  दाखिला गर्ने / झिक्ने व्यक्तिको नाम:
                </label>
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">कैफियत / प्रयोजन:</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="जस्तै: महसुल संकलन रकम बैंक दाखिला"
                className="w-full rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white shadow-md hover:bg-blue-700 transition"
              >
                <span>बैंक कारोबार सुरक्षित गर्नुहोस्</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Statements with Bank & Date Filter */}
      {activeTab === 'statements' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">बैंकवाइज स्टेटमेन्ट (Statements)</h3>
              <p className="text-xs text-slate-500">
                कुन मितिदेखि कुन मितिसम्मको कारोबार विवरण हेर्ने र प्रिन्ट गर्ने अप्सन
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <Printer className="h-4 w-4" />
              <span>स्टेटमेन्ट प्रिन्ट</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="font-bold text-slate-700 block mb-1">बैंक खाता छान्नुहोस्:</label>
              <select
                value={filterBankId}
                onChange={(e) => setFilterBankId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 bg-white font-semibold"
              >
                <option value="ALL">सबै बैंक खाताहरू (All Banks)</option>
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bankName}
                  </option>
                ))}
              </select>
            </div>

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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">मिति (BS)</th>
                  <th className="p-3">बैंकको नाम</th>
                  <th className="p-3">भौचर / चेक नं</th>
                  <th className="p-3 text-center">प्रकार</th>
                  <th className="p-3">दाखिला / झिक्ने व्यक्ति</th>
                  <th className="p-3 text-right">रकम (रू.)</th>
                  <th className="p-3 text-right">मौज्दात (रू.)</th>
                  <th className="p-3">कैफियत</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTxns.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="p-3 text-slate-600 font-medium">{toNepaliDigits(t.dateBS)}</td>
                    <td className="p-3 font-semibold text-slate-900">{t.bankName}</td>
                    <td className="p-3 font-mono font-bold text-blue-700">{t.voucherNo}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          t.type === 'डिपोजिट'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700">{t.depositedOrWithdrawnBy}</td>
                    <td
                      className={`p-3 text-right font-black ${
                        t.type === 'डिपोजिट' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {toNepaliDigits(t.amount.toFixed(2))}
                    </td>
                    <td className="p-3 text-right font-black text-slate-900">
                      {toNepaliDigits(t.balanceAfter.toFixed(2))}
                    </td>
                    <td className="p-3 text-slate-500">{t.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Bank Modal */}
      {showAddBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 text-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200">
              नयाँ बैंक खाता दर्ता गर्नुहोस्
            </h3>

            <form onSubmit={handleAddBankSubmit} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">बैंकको पूरा नाम:</label>
                <input
                  type="text"
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  placeholder="जस्तै: नबिल बैंक लि."
                  className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">खाता नम्बर:</label>
                <input
                  type="text"
                  value={newAccountNo}
                  onChange={(e) => setNewAccountNo(e.target.value)}
                  placeholder="००१०२३४५६७८९"
                  className="w-full rounded-xl border border-slate-300 p-2 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">शाखा:</label>
                  <input
                    type="text"
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    placeholder="मेलम्ची शाखा"
                    className="w-full rounded-xl border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">सुरुवाती मौज्दात (रू.):</label>
                  <input
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2 font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBank(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700"
                >
                  खाता सुरक्षित गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
