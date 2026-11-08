import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Scale,
  Building,
  CheckCircle,
} from 'lucide-react';
import {
  Customer,
  UnitReading,
  PaymentReceipt,
  LoanInvestment,
  LoanInstallment,
  BankAccount,
  IncomeRecord,
  ExpenseRecord,
  TankerWaterSale,
  OrganizationSettings,
} from '../types';
import {
  toNepaliDigits,
  formatCurrency,
  isLoanOverdue,
  getApproxBSDaysDiff,
} from '../utils/nepaliDate';

interface Props {
  settings: OrganizationSettings;
  customers: Customer[];
  readings: UnitReading[];
  receipts: PaymentReceipt[];
  loans: LoanInvestment[];
  installments: LoanInstallment[];
  banks: BankAccount[];
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
  tankerSales: TankerWaterSale[];
}

export const ReportsView: React.FC<Props> = ({
  settings,
  customers,
  readings,
  receipts,
  loans,
  installments,
  banks,
  incomes,
  expenses,
  tankerSales,
}) => {
  const [reportType, setReportType] = useState<
    'customer-usage' | 'loan-report' | 'pnl' | 'balance-sheet' | 'cash-flow' | 'trial-balance'
  >('customer-usage');

  const [filterCustomerId, setFilterCustomerId] = useState<string>('ALL');
  const [startDateBS, setStartDateBS] = useState<string>('२०८०/०१/०१');
  const [endDateBS, setEndDateBS] = useState<string>(settings.currentSystemDateBS);

  const handlePrint = () => {
    window.print();
  };

  // Financial aggregates
  const totalWaterBillRevenue = receipts.reduce((sum, r) => sum + r.amount, 0);
  const totalOtherIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalTankerIncome = tankerSales.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalRevenue = totalWaterBillRevenue + totalOtherIncome + totalTankerIncome;

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalTankerWagesPaid = tankerSales.reduce((sum, t) => sum + t.driverWageAmount, 0);
  const totalExpensesAll = totalExpenseAmount + totalTankerWagesPaid;

  const netSurplus = totalRevenue - totalExpensesAll;

  const totalBankBalance = banks.reduce((sum, b) => sum + b.balance, 0);
  const totalLoanRemaining = loans.reduce((sum, l) => sum + l.remainingPrincipal, 0);
  const totalUnpaidBills = readings
    .filter((r) => r.paymentStatus === 'बाँकी')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  const totalAssets = totalBankBalance + totalLoanRemaining + totalUnpaidBills;

  // Filtered readings for Customer Usage Report
  const filteredCustomerReadings = readings.filter((r) => {
    const matchCust = filterCustomerId === 'ALL' || r.customerId === filterCustomerId;
    return matchCust;
  });

  // Overdue loans
  const overdueLoansList = loans.filter((l) =>
    l.status === 'भाखा नाघेको' ||
    (l.status === 'सक्रिय' && isLoanOverdue(settings.currentSystemDateBS, l.dueDateBS))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner (Hidden in Print) */}
      <div className="no-print rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-600 p-3 text-white shadow-md shadow-indigo-500/20">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              वित्तीय तथा सञ्चालन प्रतिवेदन (Reports)
            </h2>
            <p className="text-xs text-slate-500">
              ग्राहक वार्षिक युनिट, ऋण भाखा नाघेको विवरण, नाफा नोक्सान, वासलात, क्यास फ्लो, सन्तुलन परीक्षण (A4 Print Ready)
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition shrink-0"
        >
          <Printer className="h-4 w-4" />
          <span>यो रिपोर्ट A4 मा प्रिन्ट गर्नुहोस् (Print)</span>
        </button>
      </div>

      {/* Report Types Navigation (Hidden in Print) */}
      <div className="no-print flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setReportType('customer-usage')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            reportType === 'customer-usage'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          १. ग्राहक वार्षिक / अवधि युनिट & रकम रिपोर्ट
        </button>

        <button
          onClick={() => setReportType('loan-report')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            reportType === 'loan-report'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          २. ऋण लगानी, असुली & भाखा नाघेको रिपोर्ट
        </button>

        <button
          onClick={() => setReportType('pnl')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            reportType === 'pnl'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          ३. नाफा नोक्सान तथा आयव्यय हिसाब
        </button>

        <button
          onClick={() => setReportType('balance-sheet')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            reportType === 'balance-sheet'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          ४. वासलात (Balance Sheet)
        </button>

        <button
          onClick={() => setReportType('cash-flow')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            reportType === 'cash-flow'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          ५. नगद प्रवाह (Cash Flow)
        </button>

        <button
          onClick={() => setReportType('trial-balance')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            reportType === 'trial-balance'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          ६. सन्तुलन परीक्षण (Trial Balance)
        </button>
      </div>

      {/* Date & Customer Filters Bar (Hidden in Print) */}
      <div className="no-print rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              ग्राहक छान्नुहोस् (सबै वा एक):
            </label>
            <select
              value={filterCustomerId}
              onChange={(e) => setFilterCustomerId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2 font-semibold text-slate-800"
            >
              <option value="ALL">सबै ग्राहकहरू (All Customers)</option>
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
              value={startDateBS}
              onChange={(e) => setStartDateBS(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">अन्तिम मिति (BS):</label>
            <input
              type="text"
              value={endDateBS}
              onChange={(e) => setEndDateBS(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
            />
          </div>
        </div>
      </div>

      {/* A4 Printable Report Sheet Container */}
      <div className="rounded-2xl bg-white p-8 border border-slate-300 shadow-sm print:border-none print:p-0 print:shadow-none text-black">
        {/* Printable Official Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-xl font-black text-slate-900 print:text-black">{settings.name}</h1>
          <p className="text-xs font-semibold text-slate-700 print:text-black">
            {settings.address} | फोन: {toNepaliDigits(settings.phone)} | दर्ता नं: {toNepaliDigits(settings.regNo)} | प्यान नं: {toNepaliDigits(settings.panNo)}
          </p>
          <div className="mt-2 inline-block rounded-md border border-black px-4 py-1 text-xs font-bold uppercase tracking-wider">
            {reportType === 'customer-usage' && 'ग्राहक वार्षिक तथा अवधि खपत र महसुल प्रतिवेदन'}
            {reportType === 'loan-report' && 'ऋण लगानी, किस्ता असुली & भाखा नाघेको प्रतिवेदन'}
            {reportType === 'pnl' && 'नाफा नोक्सान तथा आय-व्यय हिसाब विवरण'}
            {reportType === 'balance-sheet' && 'आर्थिक वर्षको वासलात (Balance Sheet)'}
            {reportType === 'cash-flow' && 'नगद प्रवाह विवरण (Cash Flow Statement)'}
            {reportType === 'trial-balance' && 'सन्तुलन परीक्षण (Trial Balance)'}
          </div>
          <p className="text-[11px] text-slate-500 print:text-black mt-1">
            अवधि: {toNepaliDigits(startDateBS)} देखि {toNepaliDigits(endDateBS)} सम्म | प्रतिवेदन मिति: {toNepaliDigits(settings.currentSystemDateBS)}
          </p>
        </div>

        {/* REPORT 1: Customer Usage & Amount Report */}
        {reportType === 'customer-usage' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-slate-100 print:bg-slate-200 font-bold text-center">
                    <th className="border border-black p-2">क्र.सं.</th>
                    <th className="border border-black p-2">ग्राहक आइडी</th>
                    <th className="border border-black p-2 text-left">ग्राहकको नाम</th>
                    <th className="border border-black p-2">महिना</th>
                    <th className="border border-black p-2 text-right">साविक</th>
                    <th className="border border-black p-2 text-right">हाल</th>
                    <th className="border border-black p-2 text-right">जम्मा युनिट</th>
                    <th className="border border-black p-2 text-right">महसुल रकम (रू.)</th>
                    <th className="border border-black p-2 text-right">जरिवाना (रू.)</th>
                    <th className="border border-black p-2 text-right">कुल तिर्नुपर्ने (रू.)</th>
                    <th className="border border-black p-2 text-center">भुक्तानी स्थिति</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomerReadings.map((r, idx) => (
                    <tr key={r.id} className="text-center">
                      <td className="border border-black p-1.5">{toNepaliDigits(idx + 1)}</td>
                      <td className="border border-black p-1.5 font-bold">{r.customerId}</td>
                      <td className="border border-black p-1.5 text-left font-semibold">{r.customerName}</td>
                      <td className="border border-black p-1.5">{r.monthBS}</td>
                      <td className="border border-black p-1.5 text-right">{toNepaliDigits(r.previousReading)}</td>
                      <td className="border border-black p-1.5 text-right">{toNepaliDigits(r.currentReading)}</td>
                      <td className="border border-black p-1.5 text-right font-bold text-blue-700">
                        {toNepaliDigits(r.consumedUnits)}
                      </td>
                      <td className="border border-black p-1.5 text-right font-medium">
                        {toNepaliDigits((r.baseAmount + r.extraAmount).toFixed(2))}
                      </td>
                      <td className="border border-black p-1.5 text-right text-rose-700">
                        {toNepaliDigits(r.penaltyAmount.toFixed(2))}
                      </td>
                      <td className="border border-black p-1.5 text-right font-black">
                        {toNepaliDigits(r.totalAmount.toFixed(2))}
                      </td>
                      <td className="border border-black p-1.5">
                        <span className="font-bold">{r.paymentStatus}</span>
                      </td>
                    </tr>
                  ))}
                  {/* Total summary row */}
                  <tr className="border-t-2 border-black font-black bg-slate-100 print:bg-slate-200">
                    <td colSpan={6} className="border border-black p-2 text-right">
                      जम्मा कुल योग (Total):
                    </td>
                    <td className="border border-black p-2 text-right text-blue-800">
                      {toNepaliDigits(filteredCustomerReadings.reduce((sum, r) => sum + r.consumedUnits, 0))} युनिट
                    </td>
                    <td className="border border-black p-2 text-right">
                      {formatCurrency(
                        filteredCustomerReadings.reduce((sum, r) => sum + r.baseAmount + r.extraAmount, 0)
                      )}
                    </td>
                    <td className="border border-black p-2 text-right text-rose-700">
                      {formatCurrency(filteredCustomerReadings.reduce((sum, r) => sum + r.penaltyAmount, 0))}
                    </td>
                    <td className="border border-black p-2 text-right font-black">
                      {formatCurrency(filteredCustomerReadings.reduce((sum, r) => sum + r.totalAmount, 0))}
                    </td>
                    <td className="border border-black p-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 2: Loan Overdue & Maturity Report */}
        {reportType === 'loan-report' && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-4 gap-4 text-xs font-semibold p-4 rounded-xl border border-black mb-4">
              <div>
                <span>कुल ऋण लगानी:</span>
                <span className="block font-black text-sm">{formatCurrency(loans.reduce((s, l) => s + l.principalAmount, 0))}</span>
              </div>
              <div>
                <span>बाँकी सावाँ:</span>
                <span className="block font-black text-sm">{formatCurrency(totalLoanRemaining)}</span>
              </div>
              <div>
                <span>असुली भएको ब्याज:</span>
                <span className="block font-black text-sm text-emerald-700">{formatCurrency(installments.reduce((s, i) => s + i.interestPaid, 0))}</span>
              </div>
              <div>
                <span>भाखा नाघेको ऋण संख्या:</span>
                <span className="block font-black text-sm text-rose-700">{toNepaliDigits(overdueLoansList.length)} वटा</span>
              </div>
            </div>

            <h4 className="font-bold text-sm text-rose-900 border-b border-black pb-1">
              भाखा नाघिसकेको / म्याद समाप्त भएका ऋणहरूको विवरण (Overdue Loans)
            </h4>

            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-black p-2">ऋण नं</th>
                  <th className="border border-black p-2 text-left">ऋणीको नाम</th>
                  <th className="border border-black p-2">सम्पर्क फोन</th>
                  <th className="border border-black p-2 text-right">लगानी सावाँ (रू.)</th>
                  <th className="border border-black p-2 text-right">बाँकी सावाँ (रू.)</th>
                  <th className="border border-black p-2 text-center">भाखा मिति (Due Date)</th>
                  <th className="border border-black p-2 text-center">भाखा नाघेको दिन</th>
                  <th className="border border-black p-2 text-right">सञ्चित ब्याज (रू.)</th>
                </tr>
              </thead>
              <tbody>
                {overdueLoansList.map((l) => {
                  const days = getApproxBSDaysDiff(l.dueDateBS, settings.currentSystemDateBS);
                  return (
                    <tr key={l.id} className="text-center font-medium">
                      <td className="border border-black p-2 font-bold">{l.loanNo}</td>
                      <td className="border border-black p-2 text-left font-bold">{l.customerName}</td>
                      <td className="border border-black p-2">{toNepaliDigits(l.phone)}</td>
                      <td className="border border-black p-2 text-right">{toNepaliDigits(l.principalAmount.toFixed(2))}</td>
                      <td className="border border-black p-2 text-right font-black text-rose-700">
                        {toNepaliDigits(l.remainingPrincipal.toFixed(2))}
                      </td>
                      <td className="border border-black p-2 font-bold text-rose-700">{toNepaliDigits(l.dueDateBS)}</td>
                      <td className="border border-black p-2 font-black">{toNepaliDigits(Math.max(1, days))} दिन</td>
                      <td className="border border-black p-2 text-right font-bold">{toNepaliDigits(l.accruedInterest.toFixed(2))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 3: Profit and Loss Statement */}
        {reportType === 'pnl' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6 text-xs">
              {/* Income Side */}
              <div className="border border-black p-4 space-y-3">
                <h4 className="font-black text-sm border-b border-black pb-1 flex justify-between">
                  <span>आम्दानी पक्ष (Incomes)</span>
                  <span>रकम (रू.)</span>
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>१. खानेपानी महसुल संकलन:</span>
                    <span className="font-bold">{toNepaliDigits(totalWaterBillRevenue.toFixed(2))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>२. गाडीमा ट्याङ्कर पानी बिक्री:</span>
                    <span className="font-bold">{toNepaliDigits(totalTankerIncome.toFixed(2))}</span>
                  </div>
                  {incomes.map((inc) => (
                    <div key={inc.id} className="flex justify-between text-slate-700">
                      <span>• {inc.category} ({inc.payerName}):</span>
                      <span>{toNepaliDigits(inc.amount.toFixed(2))}</span>
                    </div>
                  ))}
                  <div className="border-t border-black pt-2 flex justify-between font-black text-emerald-800 text-sm">
                    <span>जम्मा आम्दानी (Total Revenue):</span>
                    <span>{formatCurrency(totalRevenue)}</span>
                  </div>
                </div>
              </div>

              {/* Expense Side */}
              <div className="border border-black p-4 space-y-3">
                <h4 className="font-black text-sm border-b border-black pb-1 flex justify-between">
                  <span>खर्च पक्ष (Expenditures)</span>
                  <span>रकम (रू.)</span>
                </h4>
                <div className="space-y-2">
                  {expenses.map((exp) => (
                    <div key={exp.id} className="flex justify-between text-slate-700">
                      <span>• {exp.category} ({exp.paidTo}):</span>
                      <span>{toNepaliDigits(exp.amount.toFixed(2))}</span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span>• ट्याङ्कर चालक ढुवानी ज्याला:</span>
                    <span className="font-bold">{toNepaliDigits(totalTankerWagesPaid.toFixed(2))}</span>
                  </div>
                  <div className="border-t border-black pt-2 flex justify-between font-black text-rose-800 text-sm">
                    <span>जम्मा खर्च (Total Expense):</span>
                    <span>{formatCurrency(totalExpensesAll)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Surplus Box */}
            <div className="p-4 border-2 border-black bg-slate-50 print:bg-transparent flex justify-between items-center text-sm font-black">
              <span>खुद बचत / बचत नाफा (Net Surplus):</span>
              <span className="text-base text-blue-900 font-black">{formatCurrency(netSurplus)}</span>
            </div>
          </div>
        )}

        {/* REPORT 4: Balance Sheet (वासलात) */}
        {reportType === 'balance-sheet' && (
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-2 gap-6">
              {/* Assets */}
              <div className="border border-black p-4 space-y-3">
                <h4 className="font-black text-sm border-b border-black pb-1 flex justify-between">
                  <span>सम्पत्ति पक्ष (Assets)</span>
                  <span>रकम (रू.)</span>
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span>बैंक मौज्दात (सबै बैंक खाताहरू):</span>
                    <span>{toNepaliDigits(totalBankBalance.toFixed(2))}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>ऋण लगानी बाँकी सावाँ:</span>
                    <span>{toNepaliDigits(totalLoanRemaining.toFixed(2))}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>उठाउन बाँकी महसुल बक्यौता:</span>
                    <span>{toNepaliDigits(totalUnpaidBills.toFixed(2))}</span>
                  </div>
                  <div className="border-t border-black pt-3 flex justify-between font-black text-sm">
                    <span>जम्मा सम्पत्ति (Total Assets):</span>
                    <span>{formatCurrency(totalAssets)}</span>
                  </div>
                </div>
              </div>

              {/* Liabilities & Capital Fund */}
              <div className="border border-black p-4 space-y-3">
                <h4 className="font-black text-sm border-b border-black pb-1 flex justify-between">
                  <span>पूँजी कोष तथा दायित्व (Liabilities & Capital)</span>
                  <span>रकम (रू.)</span>
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span>संस्थाको साधारण जगेडा कोष:</span>
                    <span>{toNepaliDigits((totalAssets - netSurplus).toFixed(2))}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>यस अवधिको बचत नाफा (Net Surplus):</span>
                    <span>{toNepaliDigits(netSurplus.toFixed(2))}</span>
                  </div>
                  <div className="border-t border-black pt-3 flex justify-between font-black text-sm">
                    <span>जम्मा दायित्व तथा पूँजी कोष:</span>
                    <span>{formatCurrency(totalAssets)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 5: Cash Flow */}
        {reportType === 'cash-flow' && (
          <div className="space-y-4 text-xs">
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  <th className="border border-black p-2 text-left">नगद प्रवाह विवरण (Cash Flow Activities)</th>
                  <th className="border border-black p-2 text-right">रकम (रू.)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 font-bold">१. सञ्चालन क्रियाकलापबाट नगद प्रवाह:</td>
                  <td className="border border-black p-2 text-right"></td>
                </tr>
                <tr>
                  <td className="border border-black p-2 pl-6">• ग्राहकहरूबाट महसुल संकलन</td>
                  <td className="border border-black p-2 text-right font-medium">{toNepaliDigits(totalWaterBillRevenue.toFixed(2))}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 pl-6">• ट्याङ्कर पानी बिक्री नगद आम्दानी</td>
                  <td className="border border-black p-2 text-right font-medium">{toNepaliDigits(totalTankerIncome.toFixed(2))}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 pl-6">• विविध आम्दानी तथा अनुदान संकलन</td>
                  <td className="border border-black p-2 text-right font-medium">{toNepaliDigits(totalOtherIncome.toFixed(2))}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 pl-6 text-rose-800">• खर्चहरू भुक्तानी (विद्युत, मर्मत, मसलन्द...)</td>
                  <td className="border border-black p-2 text-right font-medium text-rose-800">({toNepaliDigits(totalExpensesAll.toFixed(2))})</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold">२. वित्तीय तथा लगानी क्रियाकलाप:</td>
                  <td className="border border-black p-2 text-right"></td>
                </tr>
                <tr>
                  <td className="border border-black p-2 pl-6">• ऋण किस्ता तथा ब्याज असुली नगद प्रवाह</td>
                  <td className="border border-black p-2 text-right font-medium">
                    {toNepaliDigits(installments.reduce((s, i) => s + i.totalPaid, 0).toFixed(2))}
                  </td>
                </tr>
                <tr className="border-t-2 border-black font-black bg-slate-100 text-sm">
                  <td className="border border-black p-2">अन्तिम नगद तथा बैंक मौज्दात:</td>
                  <td className="border border-black p-2 text-right font-black text-blue-900">{formatCurrency(totalBankBalance)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 6: Trial Balance (सन्तुलन परीक्षण) */}
        {reportType === 'trial-balance' && (
          <div className="space-y-4 text-xs">
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-black p-2 text-left">खाताको नाम (Account Heads)</th>
                  <th className="border border-black p-2 text-right">डेबिट रकम (रू.)</th>
                  <th className="border border-black p-2 text-right">क्रेडिट रकम (रू.)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 font-semibold">बैंक खाता मौज्दातहरू</td>
                  <td className="border border-black p-2 text-right font-bold">{toNepaliDigits(totalBankBalance.toFixed(2))}</td>
                  <td className="border border-black p-2 text-right">-</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-semibold">ऋण लगानी सावाँ</td>
                  <td className="border border-black p-2 text-right font-bold">{toNepaliDigits(totalLoanRemaining.toFixed(2))}</td>
                  <td className="border border-black p-2 text-right">-</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-semibold">शीर्षकगत खर्चहरू</td>
                  <td className="border border-black p-2 text-right font-bold text-rose-700">{toNepaliDigits(totalExpensesAll.toFixed(2))}</td>
                  <td className="border border-black p-2 text-right">-</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-semibold">महसुल तथा पानी बिक्री आम्दानी</td>
                  <td className="border border-black p-2 text-right">-</td>
                  <td className="border border-black p-2 text-right font-bold text-emerald-700">
                    {toNepaliDigits((totalWaterBillRevenue + totalTankerIncome).toFixed(2))}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-semibold">विविध आम्दानी तथा अनुदान</td>
                  <td className="border border-black p-2 text-right">-</td>
                  <td className="border border-black p-2 text-right font-bold text-emerald-700">{toNepaliDigits(totalOtherIncome.toFixed(2))}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-semibold">जगेडा तथा पूँजी कोष</td>
                  <td className="border border-black p-2 text-right">-</td>
                  <td className="border border-black p-2 text-right font-bold">
                    {toNepaliDigits((totalBankBalance + totalLoanRemaining + totalExpensesAll - totalRevenue).toFixed(2))}
                  </td>
                </tr>
                <tr className="border-t-2 border-black font-black bg-slate-100 text-sm">
                  <td className="border border-black p-2">जम्मा सन्तुलन योग (Balanced):</td>
                  <td className="border border-black p-2 text-right font-black">
                    {formatCurrency(totalBankBalance + totalLoanRemaining + totalExpensesAll)}
                  </td>
                  <td className="border border-black p-2 text-right font-black">
                    {formatCurrency(totalBankBalance + totalLoanRemaining + totalExpensesAll)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Report Footer Signatures */}
        <div className="mt-12 pt-6 grid grid-cols-3 gap-6 text-xs text-center border-t border-slate-300">
          <div>
            <div className="border-b border-black border-dashed mx-6 h-6"></div>
            <p className="mt-1 font-bold">तयार गर्ने (लेखापाल)</p>
          </div>
          <div>
            <div className="border-b border-black border-dashed mx-6 h-6"></div>
            <p className="mt-1 font-bold">जाँच गर्ने (सचिव / व्यवस्थापक)</p>
          </div>
          <div>
            <div className="border-b border-black border-dashed mx-6 h-6"></div>
            <p className="mt-1 font-bold">प्रमाणित गर्ने ({settings.designation})</p>
          </div>
        </div>
      </div>
    </div>
  );
};
