import React from 'react';
import {
  Users,
  Gauge,
  Receipt,
  HandCoins,
  Building2,
  TrendingUp,
  TrendingDown,
  Truck,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Printer,
  Calendar,
  Sparkles,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';
import {
  Customer,
  UnitReading,
  PaymentReceipt,
  LoanInvestment,
  BankAccount,
  IncomeRecord,
  ExpenseRecord,
  TankerWaterSale,
  OrganizationSettings,
} from '../types';
import { toNepaliDigits, formatCurrency, isLoanOverdue } from '../utils/nepaliDate';
import { ActiveTab } from '../components/Sidebar';

interface Props {
  settings: OrganizationSettings;
  customers: Customer[];
  readings: UnitReading[];
  receipts: PaymentReceipt[];
  loans: LoanInvestment[];
  banks: BankAccount[];
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
  tankerSales: TankerWaterSale[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenLoanAlerts: () => void;
}

export const DashboardView: React.FC<Props> = ({
  settings,
  customers,
  readings,
  receipts,
  loans,
  banks,
  incomes,
  expenses,
  tankerSales,
  setActiveTab,
  onOpenLoanAlerts,
}) => {
  // Calculations
  const activeCustomers = customers.filter((c) => c.status === 'सक्रिय').length;

  const totalBankBalance = banks.reduce((sum, b) => sum + b.balance, 0);

  const totalLoanDisbursed = loans.reduce((sum, l) => sum + l.principalAmount, 0);
  const totalLoanRemaining = loans.reduce((sum, l) => sum + l.remainingPrincipal, 0);

  const totalBillCollected = receipts.reduce((sum, r) => sum + r.amount, 0);
  const totalIncomes = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalTankerIncome = tankerSales.reduce((sum, t) => sum + t.totalAmount, 0);

  // Check overdue loans
  const overdueLoans = loans.filter((l) =>
    l.status === 'भाखा नाघेको' ||
    (l.status === 'सक्रिय' && isLoanOverdue(settings.currentSystemDateBS, l.dueDateBS))
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-cyan-200 border border-white/20 mb-3">
            <Calendar className="h-3.5 w-3.5" />
            <span>आजको प्रणाली मिति: {settings.currentSystemDateBS} (नेपाली बिक्रम संवत्)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {settings.name}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-2 font-medium">
            डिजिटल खानेपानी तथा सरसफाइ उपभोक्ता समिति & सहकारी व्यवस्थापन प्रणाली।
            यहाँबाट सजिलै युनिट रिडिङ, रसिद प्रिन्ट, ऋण असुली, बैंक र सम्पूर्ण हिसाब नियन्त्रण गर्नुहोस्।
          </p>

          <div className="flex flex-wrap gap-2.5 mt-5">
            <button
              onClick={() => setActiveTab('unit-entry')}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-blue-900 shadow-md hover:bg-blue-50 transition"
            >
              <Gauge className="h-4 w-4 text-blue-600" />
              <span>युनिट इन्ट्री & WhatsApp</span>
            </button>
            <button
              onClick={() => setActiveTab('amount-entry')}
              className="flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-md hover:bg-cyan-300 transition"
            >
              <Receipt className="h-4 w-4" />
              <span>महसुल रसिद काट्ने</span>
            </button>
            <button
              onClick={() => setActiveTab('meter-sheet')}
              className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/30 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition"
            >
              <Printer className="h-4 w-4" />
              <span>A4 रिडिङ सिट प्रिन्ट</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
      </div>

      {/* Critical Alert Banner for Overdue Loans */}
      {overdueLoans.length > 0 && (
        <div className="rounded-2xl border-2 border-rose-400 bg-rose-50 p-4 sm:p-5 text-rose-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-rose-600 p-2.5 text-white shadow-md shadow-rose-500/20 shrink-0">
              <AlertTriangle className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-rose-950">
                ऋण भाखा नाघेको सूचना ({toNepaliDigits(overdueLoans.length)} वटा ऋणको म्याद सकिएको छ!)
              </h3>
              <p className="text-xs text-rose-800 mt-0.5">
                तोकिएको मिति समाप्त भइसकेकोले तुरुन्त व्यवस्थापकको मोबाइलमा एसएमएस वा ऋणीलाई WhatsApp ताकेता पठाउनुहोस्।
              </p>
            </div>
          </div>
          <button
            onClick={onOpenLoanAlerts}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/30 hover:bg-rose-700 transition shrink-0"
          >
            <PhoneCall className="h-4 w-4" />
            <span>मोबाइलमा अलर्ट हेर्नुहोस् / पठाउनुहोस्</span>
          </button>
        </div>
      )}

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Customers */}
        <div
          onClick={() => setActiveTab('kyc')}
          className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">कुल सक्रिय ग्राहक</span>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">
              {toNepaliDigits(activeCustomers)}
            </span>
            <span className="text-xs text-slate-500 ml-1.5">घरधुरी / सदस्य</span>
          </div>
          <p className="text-[11px] text-blue-600 font-semibold mt-2 flex items-center gap-1">
            <span>ग्राहक विवरण तथा KYC हेर्नुहोस्</span>
            <ArrowRight className="h-3 w-3" />
          </p>
        </div>

        {/* Metric 2: Bank Balance */}
        <div
          onClick={() => setActiveTab('bank')}
          className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">बैंक खाता कुल मौज्दात</span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-emerald-600">
              {formatCurrency(totalBankBalance)}
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
            <span>{toNepaliDigits(banks.length)} वटा बैंक खातामा जम्मा</span>
            <ArrowRight className="h-3 w-3" />
          </p>
        </div>

        {/* Metric 3: Loan Outstanding */}
        <div
          onClick={() => setActiveTab('loan')}
          className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">ऋण लगानी बाँकी सावाँ</span>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <HandCoins className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-slate-900">
              {formatCurrency(totalLoanRemaining)}
            </span>
          </div>
          <p className="text-[11px] text-amber-700 font-semibold mt-2 flex items-center gap-1">
            <span>कुल लगानी: {formatCurrency(totalLoanDisbursed)}</span>
            <ArrowRight className="h-3 w-3" />
          </p>
        </div>

        {/* Metric 4: Water Bill Collection */}
        <div
          onClick={() => setActiveTab('amount-entry')}
          className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">संकलित महसुल रकम</span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-indigo-700">
              {formatCurrency(totalBillCollected)}
            </span>
          </div>
          <p className="text-[11px] text-indigo-600 font-semibold mt-2 flex items-center gap-1">
            <span>रसिद काटेर रकम असुली गर्नुहोस्</span>
            <ArrowRight className="h-3 w-3" />
          </p>
        </div>
      </div>

      {/* Secondary Operational Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Incomes & Expenses */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800">आम्दानी तथा खर्च सारांश</h3>
            <span className="text-[10px] text-slate-400">यस आर्थिक वर्ष</span>
          </div>
          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                अन्य शीर्षक आम्दानी:
              </span>
              <span className="font-bold text-emerald-600">{formatCurrency(totalIncomes)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <TrendingDown className="h-4 w-4 text-rose-500" />
                कुल शीर्षकगत खर्च:
              </span>
              <span className="font-bold text-rose-600">{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-bold">
              <span className="text-slate-800">खुद बचत (Net Surplus):</span>
              <span className="text-blue-700 font-extrabold">
                {formatCurrency(totalIncomes + totalBillCollected - totalExpenses)}
              </span>
            </div>
          </div>
        </div>

        {/* Tanker Water Sales */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800">गाडीमा पानी बिक्री सारांश</h3>
            <span className="text-[10px] text-slate-400">ट्याङ्कर ढुवानी</span>
          </div>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">बिक्री गरिएको परिमाण:</span>
              <span className="font-bold text-slate-900">
                {toNepaliDigits(tankerSales.reduce((sum, t) => sum + t.litersSold, 0))} लिटर
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">कुल बिक्री आम्दानी:</span>
              <span className="font-bold text-indigo-700">{formatCurrency(totalTankerIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">चालकलाई भुक्तानी ज्याला:</span>
              <span className="font-bold text-slate-700">
                {formatCurrency(tankerSales.reduce((sum, t) => sum + t.driverWageAmount, 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Quick System Rates Checklist */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800">हाल लागू महसुल दर & जरिवाना</h3>
            <button
              onClick={() => setActiveTab('settings')}
              className="text-[10px] font-bold text-blue-600 hover:underline"
            >
              सेटिङमा फेर्ने
            </button>
          </div>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">न्यूनतम रकम ({toNepaliDigits(settings.minimumUnitsIncluded)} युनिट सम्म):</span>
              <span className="font-bold text-slate-900">रू {toNepaliDigits(settings.minimumCharge)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">न्यूनतमभन्दा बढी अतिरिक्त दर:</span>
              <span className="font-bold text-slate-900">रू {toNepaliDigits(settings.unitRateExceeding)} / युनिट</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">जरिवाना लाग्ने समय:</span>
              <span className="font-bold text-slate-900">{toNepaliDigits(settings.penaltyGraceDays)} दिन पछि</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">जरिवाना दर:</span>
              <span className="font-bold text-rose-600">{toNepaliDigits(settings.penaltyPercent)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Water Bills / Readings Table */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">पछिल्ला महसुल तथा युनिट रिडिङहरू</h3>
            <p className="text-xs text-slate-500">हालै संकलन तथा इन्ट्री गरिएका उपभोक्ताको विवरण</p>
          </div>
          <button
            onClick={() => setActiveTab('unit-entry')}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            <span>सबै हेर्नुहोस्</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">मिति (BS)</th>
                <th className="p-3">ग्राहक आइडी</th>
                <th className="p-3">ग्राहकको नाम</th>
                <th className="p-3">महिना</th>
                <th className="p-3 text-center">साविक</th>
                <th className="p-3 text-center">हाल</th>
                <th className="p-3 text-center">खपत</th>
                <th className="p-3 text-right">रकम (रू.)</th>
                <th className="p-3 text-center">भुक्तानी स्थिति</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {readings.slice(0, 5).map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-medium text-slate-600">{toNepaliDigits(r.entryDateBS)}</td>
                  <td className="p-3 font-bold text-blue-600">{r.customerId}</td>
                  <td className="p-3 font-semibold text-slate-900">{r.customerName}</td>
                  <td className="p-3 text-slate-700">{r.monthBS}</td>
                  <td className="p-3 text-center">{toNepaliDigits(r.previousReading)}</td>
                  <td className="p-3 text-center">{toNepaliDigits(r.currentReading)}</td>
                  <td className="p-3 text-center font-bold text-slate-800">
                    {toNepaliDigits(r.consumedUnits)}
                  </td>
                  <td className="p-3 text-right font-extrabold text-slate-900">
                    {toNepaliDigits(r.totalAmount.toFixed(2))}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        r.paymentStatus === 'चुक्ता'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {r.paymentStatus}
                    </span>
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
