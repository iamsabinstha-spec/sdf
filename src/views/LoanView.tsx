import React, { useState } from 'react';
import {
  HandCoins,
  PlusCircle,
  Receipt,
  FileSpreadsheet,
  AlertTriangle,
  Printer,
  Calendar,
  Search,
  CheckCircle,
  Smartphone,
  Send,
  Eye,
  Filter,
} from 'lucide-react';
import {
  Customer,
  LoanInvestment,
  LoanInstallment,
  OrganizationSettings,
  MasterAuditLog,
} from '../types';
import {
  toNepaliDigits,
  formatCurrency,
  numberToNepaliWords,
  isLoanOverdue,
  getApproxBSDaysDiff,
} from '../utils/nepaliDate';
import { ReceiptData } from '../components/ReceiptPrintModal';

interface Props {
  settings: OrganizationSettings;
  customers: Customer[];
  loans: LoanInvestment[];
  installments: LoanInstallment[];
  onSaveLoans: (loans: LoanInvestment[]) => void;
  onSaveInstallments: (installments: LoanInstallment[]) => void;
  onAddAuditLog: (log: MasterAuditLog) => void;
  onPrintReceipt: (data: ReceiptData) => void;
  onOpenLoanAlerts: () => void;
}

export const LoanView: React.FC<Props> = ({
  settings,
  customers,
  loans,
  installments,
  onSaveLoans,
  onSaveInstallments,
  onAddAuditLog,
  onPrintReceipt,
  onOpenLoanAlerts,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'disburse' | 'installment' | 'statements'
  >('overview');
  const [successToast, setSuccessToast] = useState('');

  // Disbursement Form State
  const defaultRate =
    settings.loanInterestRateHistory[0]?.annualInterestRate || 13.5;
  const [disburseCustomerId, setDisburseCustomerId] = useState<string>(customers[0]?.id || '');
  const [disburseAmount, setDisburseAmount] = useState<number>(100000);
  const [disburseRate, setDisburseRate] = useState<number>(defaultRate);
  const [disburseStartDate, setDisburseStartDate] = useState<string>(settings.currentSystemDateBS);
  const [disburseDuration, setDisburseDuration] = useState<number>(12);
  const [disburseDueDate, setDisburseDueDate] = useState<string>('२०८२/०७/२२');
  const [disbursePurpose, setDisbursePurpose] = useState<string>('कृषि तथा व्यवसाय');

  // Installment Collection Form State
  const [selectedLoanId, setSelectedLoanId] = useState<string>(loans[0]?.id || '');
  const [instDateBS, setInstDateBS] = useState<string>(settings.currentSystemDateBS);
  const [principalPaid, setPrincipalPaid] = useState<number>(10000);
  const [interestPaid, setInterestPaid] = useState<number>(1125);
  const [penaltyPaid, setPenaltyPaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('नगद');
  const [instRemarks, setInstRemarks] = useState<string>('मासिक किस्ता तथा ब्याज दाखिला');

  // Statement Filters
  const [filterMemberId, setFilterMemberId] = useState<string>('ALL');
  const [filterFromDate, setFilterFromDate] = useState<string>('२०८०/०१/०१');
  const [filterToDate, setFilterToDate] = useState<string>(settings.currentSystemDateBS);

  // Key Totals
  const totalDisbursed = loans.reduce((sum, l) => sum + l.principalAmount, 0);
  const totalRemaining = loans.reduce((sum, l) => sum + l.remainingPrincipal, 0);
  const totalPrincipalCollected = installments.reduce((sum, i) => sum + i.principalPaid, 0);
  const totalInterestCollected = installments.reduce((sum, i) => sum + i.interestPaid, 0);

  const overdueLoans = loans.filter((l) =>
    l.status === 'भाखा नाघेको' ||
    (l.status === 'सक्रिय' && isLoanOverdue(settings.currentSystemDateBS, l.dueDateBS))
  );

  // Selected Loan for Installment
  const currentLoan = loans.find((l) => l.id === selectedLoanId);

  // Auto calculate interest whenever loan is chosen
  const handleSelectLoanForInstallment = (loanId: string) => {
    setSelectedLoanId(loanId);
    const ln = loans.find((l) => l.id === loanId);
    if (ln) {
      // Monthly interest approximation: (Principal * Rate / 100) / 12
      const approxMonthlyInterest = Math.round((ln.remainingPrincipal * ln.interestRate) / 1200);
      setInterestPaid(approxMonthlyInterest);
      setPrincipalPaid(Math.min(10000, ln.remainingPrincipal));
    }
  };

  // Generate Installment Receipt No
  const getNextInstallmentReceiptNo = () => {
    const year = settings.currentSystemDateBS.split('/')[0] || '२०८१';
    const count = installments.length + 1;
    return `LREC-${year}-${String(count).padStart(4, '0')}`;
  };

  // Submit New Loan Disbursement
  const handleDisbursementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === disburseCustomerId);
    if (!cust) return;
    if (disburseAmount <= 0) {
      alert('कृपया मान्य ऋण रकम प्रविष्ट गर्नुहोस्।');
      return;
    }

    const loanNo = `LN-${settings.currentSystemDateBS.split('/')[0]}-${String(loans.length + 1).padStart(3, '0')}`;
    const newLoan: LoanInvestment = {
      id: `LOAN-${Date.now()}`,
      loanNo,
      customerId: cust.id,
      customerName: cust.name,
      phone: cust.phone,
      principalAmount: disburseAmount,
      interestRate: disburseRate,
      startDateBS: disburseStartDate,
      dueDateBS: disburseDueDate,
      durationMonths: disburseDuration,
      purpose: disbursePurpose,
      status: 'सक्रिय',
      totalPaidPrincipal: 0,
      totalPaidInterest: 0,
      remainingPrincipal: disburseAmount,
      accruedInterest: 0,
    };

    onSaveLoans([newLoan, ...loans]);

    // Audit Log
    onAddAuditLog({
      id: `LOG-${Date.now()}`,
      dateBS: disburseStartDate,
      module: 'ऋण लगानी',
      referenceNo: loanNo,
      memberId: cust.id,
      memberName: cust.name,
      type: 'ऋण लगानी',
      debit: disburseAmount,
      credit: 0,
      description: `${cust.name} लाई ऋण लगानी (${loanNo}) - रू ${disburseAmount}`,
    });

    setSuccessToast(`ऋण नं. ${loanNo} सफलतापूर्वक लगानी गरियो!`);
    setTimeout(() => setSuccessToast(''), 4000);
    setActiveTab('overview');
  };

  // Submit Installment Collection
  const handleInstallmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLoan) return;

    const totalPaid = Number(principalPaid) + Number(interestPaid) + Number(penaltyPaid);
    if (totalPaid <= 0) {
      alert('कृपया मान्य किस्ता रकम प्रविष्ट गर्नुहोस्।');
      return;
    }

    const receiptNo = getNextInstallmentReceiptNo();
    const words = numberToNepaliWords(totalPaid);

    const newInst: LoanInstallment = {
      id: `INST-${Date.now()}`,
      receiptNo,
      loanId: currentLoan.id,
      loanNo: currentLoan.loanNo,
      customerId: currentLoan.customerId,
      customerName: currentLoan.customerName,
      dateBS: instDateBS.trim() || settings.currentSystemDateBS,
      principalPaid: Number(principalPaid),
      interestPaid: Number(interestPaid),
      penaltyPaid: Number(penaltyPaid),
      totalPaid,
      amountInWords: words,
      paymentMethod,
      collectedBy: settings.authorizedPerson,
      remarks: instRemarks,
    };

    // Update Loan balance
    const updatedLoans = loans.map((l) => {
      if (l.id === currentLoan.id) {
        const newRem = Math.max(0, l.remainingPrincipal - Number(principalPaid));
        return {
          ...l,
          remainingPrincipal: newRem,
          totalPaidPrincipal: l.totalPaidPrincipal + Number(principalPaid),
          totalPaidInterest: l.totalPaidInterest + Number(interestPaid),
          status: (newRem === 0 ? 'चुक्ता' : l.status) as LoanInvestment['status'],
        };
      }
      return l;
    });

    onSaveLoans(updatedLoans);
    onSaveInstallments([newInst, ...installments]);

    // Audit Log
    onAddAuditLog({
      id: `LOG-${Date.now()}`,
      dateBS: instDateBS,
      module: 'ऋण किस्ता असुली',
      referenceNo: receiptNo,
      memberId: currentLoan.customerId,
      memberName: currentLoan.customerName,
      type: 'किस्ता असुली',
      debit: 0,
      credit: totalPaid,
      description: `${currentLoan.customerName} बाट ऋण किस्ता तथा ब्याज असुली (${receiptNo})`,
    });

    setSuccessToast(`किस्ता रसिद नं. ${receiptNo} सफलतापूर्वक दर्ता भयो!`);
    setTimeout(() => setSuccessToast(''), 4000);

    // Open Printable Receipt!
    onPrintReceipt({
      title: 'ऋण किस्ता तथा ब्याज भुक्तानी रसिद',
      receiptNo,
      dateBS: instDateBS,
      customerOrPayerName: currentLoan.customerName,
      customerOrMeterId: `ऋण नं: ${currentLoan.loanNo} (सदस्य: ${currentLoan.customerId})`,
      breakdown: [
        { label: 'सावाँ असुली रकम', amount: Number(principalPaid) },
        { label: 'ब्याज असुली रकम', amount: Number(interestPaid) },
        { label: 'हर्जाना / जरिवाना', amount: Number(penaltyPaid) },
        { label: 'बाँकी साँवा दायित्व', amount: Math.max(0, currentLoan.remainingPrincipal - Number(principalPaid)) },
      ],
      totalAmount: totalPaid,
      amountInWords: words,
      paymentMethod,
      remarks: instRemarks,
      collectedBy: settings.authorizedPerson,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-md shadow-blue-500/20">
            <HandCoins className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              ऋण लगानी, किस्ता असुली & मोबाइल म्याद अलर्ट
            </h2>
            <p className="text-xs text-slate-500">
              ऋण लगानी, अटो-ब्याज हिसाब, रसिद प्रिन्ट, मिति अनुसार सदस्य स्टेटमेन्ट र भाखा नाघेको मोबाइल सूचना
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {overdueLoans.length > 0 && (
            <button
              onClick={onOpenLoanAlerts}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition"
            >
              <Smartphone className="h-4 w-4 animate-bounce" />
              <span>म्याद सकिएको अलर्ट ({toNepaliDigits(overdueLoans.length)})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('disburse')}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>+ नयाँ ऋण लगानी</span>
          </button>

          <button
            onClick={() => setActiveTab('installment')}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
          >
            <Receipt className="h-4 w-4" />
            <span>किस्ता असुली रसिद काट्ने</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">कुल ऋण लगानी</span>
          <div className="mt-2 text-xl font-black text-slate-900">
            {formatCurrency(totalDisbursed)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {toNepaliDigits(loans.length)} जना ऋणी सदस्यहरू
          </span>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">बाँकी उठाउनुपर्ने सावाँ</span>
          <div className="mt-2 text-xl font-black text-blue-700">
            {formatCurrency(totalRemaining)}
          </div>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">
            असुली हुन बाँकी दायित्व
          </span>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">कुल ब्याज आम्दानी प्राप्त</span>
          <div className="mt-2 text-xl font-black text-emerald-600">
            {formatCurrency(totalInterestCollected)}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            सावाँ असुली: {formatCurrency(totalPrincipalCollected)}
          </span>
        </div>

        <div
          onClick={onOpenLoanAlerts}
          className={`rounded-2xl p-5 border shadow-xs transition cursor-pointer ${
            overdueLoans.length > 0
              ? 'bg-rose-50 border-rose-300 text-rose-950 hover:bg-rose-100'
              : 'bg-white border-slate-200/80'
          }`}
        >
          <span className="text-xs font-bold block">भाखा नाघेको / म्याद सकिएको</span>
          <div className="mt-2 text-xl font-black text-rose-600">
            {toNepaliDigits(overdueLoans.length)} वटा ऋण
          </div>
          <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1 mt-1">
            <Smartphone className="h-3.5 w-3.5" />
            <span>मोबाइलमा अलर्ट पठाउनुहोस्</span>
          </span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          ऋण लगानी सूची ({toNepaliDigits(loans.length)})
        </button>
        <button
          onClick={() => setActiveTab('disburse')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'disburse'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          + नयाँ ऋण लगानी दर्ता
        </button>
        <button
          onClick={() => setActiveTab('installment')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'installment'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          किस्ता असुली फारम
        </button>
        <button
          onClick={() => setActiveTab('statements')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'statements'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          सदस्यवार ऋण स्टेटमेन्ट (Date-wise)
        </button>
      </div>

      {/* TAB 1: Loans Overview Table */}
      {activeTab === 'overview' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                सम्पूर्ण ऋण लगानी विवरण (Loan Portfolio)
              </h3>
              <p className="text-xs text-slate-500">
                ऋणी सदस्यको नाम, सावाँ, ब्याजदर, भाखा म्याद र असुली प्रगति
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">ऋण नं</th>
                  <th className="p-3">ऋणीको नाम</th>
                  <th className="p-3">प्रयोजन</th>
                  <th className="p-3 text-right">कुल सावाँ (रू.)</th>
                  <th className="p-3 text-center">ब्याजदर</th>
                  <th className="p-3">लगानी मिति</th>
                  <th className="p-3">भाखा म्याद (Due Date)</th>
                  <th className="p-3 text-right">बाँकी सावाँ (रू.)</th>
                  <th className="p-3 text-center">स्थिति</th>
                  <th className="p-3 text-center">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.map((l) => {
                  const isOver =
                    l.status === 'भाखा नाघेको' ||
                    (l.status === 'सक्रिय' && isLoanOverdue(settings.currentSystemDateBS, l.dueDateBS));

                  return (
                    <tr key={l.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3 font-bold text-blue-700">{l.loanNo}</td>
                      <td className="p-3 font-semibold text-slate-900">
                        <div>{l.customerName}</div>
                        <div className="text-[10px] text-slate-400">{toNepaliDigits(l.phone)}</div>
                      </td>
                      <td className="p-3 text-slate-600">{l.purpose}</td>
                      <td className="p-3 text-right font-bold text-slate-900">
                        {toNepaliDigits(l.principalAmount.toFixed(2))}
                      </td>
                      <td className="p-3 text-center font-bold text-slate-800">
                        {toNepaliDigits(l.interestRate)}%
                      </td>
                      <td className="p-3 text-slate-600">{toNepaliDigits(l.startDateBS)}</td>
                      <td className="p-3">
                        <span className={`font-bold ${isOver ? 'text-rose-600' : 'text-slate-800'}`}>
                          {toNepaliDigits(l.dueDateBS)}
                        </span>
                      </td>
                      <td className="p-3 text-right font-black text-blue-800">
                        {toNepaliDigits(l.remainingPrincipal.toFixed(2))}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            l.remainingPrincipal === 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : isOver
                              ? 'bg-rose-100 text-rose-800 animate-pulse'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {l.remainingPrincipal === 0 ? 'चुक्ता' : isOver ? 'भाखा नाघेको' : 'सक्रिय'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            handleSelectLoanForInstallment(l.id);
                            setActiveTab('installment');
                          }}
                          className="rounded-xl bg-slate-100 px-3 py-1 font-bold text-slate-700 hover:bg-blue-600 hover:text-white transition"
                        >
                          किस्ता दाखिला
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: New Loan Disbursement */}
      {activeTab === 'disburse' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            नयाँ ऋण लगानी फारम (Loan Disbursement)
          </h3>
          <p className="text-xs text-slate-500">
            सदस्य छान्नुहोस्, सावाँ रकम, ब्याजदर, अवधि र भाखा म्याद तोकेर लगानी सुरक्षित गर्नुहोस्।
          </p>

          <form onSubmit={handleDisbursementSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ऋणी सदस्य छान्नुहोस्:
                </label>
                <select
                  value={disburseCustomerId}
                  onChange={(e) => setDisburseCustomerId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-800 focus:border-blue-600 focus:outline-hidden"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} - {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ऋण लगानी सावाँ रकम (रू.):
                </label>
                <input
                  type="number"
                  value={disburseAmount}
                  onChange={(e) => setDisburseAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-blue-600 bg-blue-50/30 p-2.5 text-sm font-black text-blue-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  वार्षिक ब्याजदर (%):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={disburseRate}
                  onChange={(e) => setDisburseRate(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  लगानी मिति (BS - अटोमेटिक):
                </label>
                <input
                  type="text"
                  value={disburseStartDate}
                  onChange={(e) => setDisburseStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">अवधि (महिना):</label>
                <input
                  type="number"
                  value={disburseDuration}
                  onChange={(e) => setDisburseDuration(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-center"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  भाखा / म्याद सकिने मिति (BS):
                </label>
                <input
                  type="text"
                  value={disburseDueDate}
                  onChange={(e) => setDisburseDueDate(e.target.value)}
                  className="w-full rounded-xl border border-rose-300 bg-rose-50/50 p-2.5 font-bold text-rose-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">ऋणको प्रयोजन:</label>
              <input
                type="text"
                value={disbursePurpose}
                onChange={(e) => setDisbursePurpose(e.target.value)}
                placeholder="जस्तै: कृषि व्यवसाय, घर मर्मत, पाइपलाइन जडान..."
                className="w-full rounded-xl border border-slate-300 p-2.5"
                required
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="rounded-xl border border-slate-300 px-5 py-2.5 font-bold text-slate-700 hover:bg-slate-100"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white shadow-md hover:bg-blue-700 transition"
              >
                <HandCoins className="h-4 w-4" />
                <span>ऋण लगानी स्वीकृत गर्नुहोस्</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Installment Collection Form */}
      {activeTab === 'installment' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            किस्ता असुली तथा रसिद प्रिन्ट फारम
          </h3>

          <form onSubmit={handleInstallmentSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">ऋण छान्नुहोस्:</label>
                <select
                  value={selectedLoanId}
                  onChange={(e) => handleSelectLoanForInstallment(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-800 focus:border-blue-600 focus:outline-hidden"
                >
                  {loans.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.loanNo} - {l.customerName} (बाँकी सावाँ: रू {toNepaliDigits(l.remainingPrincipal)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  असुली मिति (BS - अटोमेटिक):
                </label>
                <input
                  type="text"
                  value={instDateBS}
                  onChange={(e) => setInstDateBS(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Loan Card Preview */}
            {currentLoan && (
              <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-3 grid grid-cols-3 gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 block">ऋणीको नाम:</span>
                  <span className="font-bold text-slate-900">{currentLoan.customerName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">बाँकी सावाँ:</span>
                  <span className="font-black text-blue-800">{formatCurrency(currentLoan.remainingPrincipal)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">वार्षिक ब्याजदर:</span>
                  <span className="font-bold text-slate-800">{toNepaliDigits(currentLoan.interestRate)}%</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  सावाँ भुक्तानी रकम (रू.):
                </label>
                <input
                  type="number"
                  value={principalPaid}
                  onChange={(e) => setPrincipalPaid(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ब्याज भुक्तानी रकम (रू. अटो हिसाब):
                </label>
                <input
                  type="number"
                  value={interestPaid}
                  onChange={(e) => setInterestPaid(Number(e.target.value))}
                  className="w-full rounded-xl border border-emerald-400 bg-emerald-50/40 p-2.5 font-bold text-emerald-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">हर्जाना / जरिवाना (रू.):</label>
                <input
                  type="number"
                  value={penaltyPaid}
                  onChange={(e) => setPenaltyPaid(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>
            </div>

            {/* Total and Words */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex justify-between items-center">
              <div>
                <span className="text-[11px] text-slate-500 block">कुल प्राप्त किस्ता रकम:</span>
                <span className="text-base font-black text-blue-900">
                  {formatCurrency(Number(principalPaid) + Number(interestPaid) + Number(penaltyPaid))}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">रकम अक्षरमा:</span>
                <span className="text-xs font-bold text-slate-800 italic">
                  {numberToNepaliWords(Number(principalPaid) + Number(interestPaid) + Number(penaltyPaid))}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white shadow-md hover:bg-emerald-700 transition"
              >
                <Printer className="h-4 w-4" />
                <span>किस्ता बुझिलिई रसिद प्रिन्ट गर्नुहोस्</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: Memberwise Statements & Date Filters */}
      {activeTab === 'statements' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                सदस्यवार तथा मिति अनुसार ऋण स्टेटमेन्ट
              </h3>
              <p className="text-xs text-slate-500">
                कुन मितिदेखि कुन मितिसम्मको असुली विवरण हेर्ने र प्रिन्ट गर्ने अप्सन
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
              <label className="font-bold text-slate-700 block mb-1">सदस्य छान्नुहोस्:</label>
              <select
                value={filterMemberId}
                onChange={(e) => setFilterMemberId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 bg-white font-semibold"
              >
                <option value="ALL">सबै सदस्यहरू (All Members)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} - {c.name}
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

          {/* Statement Installments Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">रसिद नं</th>
                  <th className="p-3">मिति (BS)</th>
                  <th className="p-3">ऋणीको नाम</th>
                  <th className="p-3">ऋण नं</th>
                  <th className="p-3 text-right">सावाँ भुक्तानी (रू.)</th>
                  <th className="p-3 text-right">ब्याज भुक्तानी (रू.)</th>
                  <th className="p-3 text-right">जम्मा असुली (रू.)</th>
                  <th className="p-3 text-center">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {installments
                  .filter((inst) => filterMemberId === 'ALL' || inst.customerId === filterMemberId)
                  .map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-blue-700">{inst.receiptNo}</td>
                      <td className="p-3 text-slate-600">{toNepaliDigits(inst.dateBS)}</td>
                      <td className="p-3 font-semibold text-slate-900">{inst.customerName}</td>
                      <td className="p-3 text-slate-600">{inst.loanNo}</td>
                      <td className="p-3 text-right font-medium">{toNepaliDigits(inst.principalPaid.toFixed(2))}</td>
                      <td className="p-3 text-right font-medium text-emerald-700">
                        {toNepaliDigits(inst.interestPaid.toFixed(2))}
                      </td>
                      <td className="p-3 text-right font-black text-slate-900">
                        {toNepaliDigits(inst.totalPaid.toFixed(2))}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() =>
                            onPrintReceipt({
                              title: 'ऋण किस्ता भुक्तानी रसिद',
                              receiptNo: inst.receiptNo,
                              dateBS: inst.dateBS,
                              customerOrPayerName: inst.customerName,
                              customerOrMeterId: inst.loanNo,
                              totalAmount: inst.totalPaid,
                              amountInWords: inst.amountInWords,
                              paymentMethod: inst.paymentMethod,
                              remarks: inst.remarks,
                              collectedBy: inst.collectedBy,
                            })
                          }
                          className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
                          title="पुनः प्रिन्ट गर्नुहोस्"
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
    </div>
  );
};
