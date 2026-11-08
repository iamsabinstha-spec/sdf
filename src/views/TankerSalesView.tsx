import React, { useState } from 'react';
import {
  Truck,
  PlusCircle,
  Printer,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  FileSpreadsheet,
  User,
  DollarSign,
} from 'lucide-react';
import {
  TankerWaterSale,
  StaffRecord,
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
  staff: StaffRecord[];
  tankerSales: TankerWaterSale[];
  onSaveTankerSales: (sales: TankerWaterSale[]) => void;
  onAddAuditLog: (log: MasterAuditLog) => void;
  onPrintReceipt: (data: ReceiptData) => void;
}

export const TankerSalesView: React.FC<Props> = ({
  settings,
  staff,
  tankerSales,
  onSaveTankerSales,
  onAddAuditLog,
  onPrintReceipt,
}) => {
  const [activeTab, setActiveTab] = useState<'statement' | 'entry'>('statement');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState<string>('ALL');
  const [filterBuyer, setFilterBuyer] = useState<string>('ALL');
  const [successToast, setSuccessToast] = useState('');

  // Default rates from settings
  const defaultRateItem = settings.tankerWaterRateHistory[0] || {
    ratePerLiter: 0.35,
    driverWagePerLiter: 0.07,
  };

  // Form State
  const [selectedRateCategory, setSelectedRateCategory] = useState<string>(
    settings.tankerWaterRateHistory[0]?.personOrCategory || 'सर्वसाधारण उपभोक्ता'
  );
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const [destination, setDestination] = useState<string>('मेलम्ची बजार');
  const [dateBS, setDateBS] = useState<string>(settings.currentSystemDateBS); // Auto BS Date
  const [monthBS, setMonthBS] = useState<string>('२०८१-कार्तिक');
  const [litersSold, setLitersSold] = useState<number>(5000);
  const [ratePerLiter, setRatePerLiter] = useState<number>(defaultRateItem.ratePerLiter);
  const [wagePerLiter, setWagePerLiter] = useState<number>(defaultRateItem.driverWagePerLiter);
  const [selectedDriverId, setSelectedDriverId] = useState<string>(
    staff.find((s) => s.designation.includes('चालक'))?.id || staff[0]?.id || ''
  );
  const [paymentStatus, setPaymentStatus] = useState<'चुक्ता' | 'बाँकी'>('चुक्ता');
  const [paymentMethod, setPaymentMethod] = useState<string>('नगद');
  const [remarks, setRemarks] = useState<string>('१ टिप ट्याङ्कर पानी आपूर्ति');

  // Automatic calculations
  const totalAmount = Math.round(litersSold * ratePerLiter);
  const driverWageAmount = Math.round(litersSold * wagePerLiter);

  // When category changes, update rates
  const handleCategoryChange = (categoryName: string) => {
    setSelectedRateCategory(categoryName);
    const item = settings.tankerWaterRateHistory.find(
      (r) => r.personOrCategory === categoryName
    );
    if (item) {
      setRatePerLiter(item.ratePerLiter);
      setWagePerLiter(item.driverWagePerLiter);
    }
  };

  const getNextBillNo = () => {
    const year = settings.currentSystemDateBS.split('/')[0] || '२०८१';
    const count = tankerSales.length + 1;
    return `TNK-${year}-${String(count).padStart(3, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || litersSold <= 0) {
      alert('कृपया खरिदकर्ताको नाम र बिक्री गरेको लिटर प्रविष्ट गर्नुहोस्।');
      return;
    }

    const driverStaff = staff.find((s) => s.id === selectedDriverId);
    const billNo = getNextBillNo();
    const words = numberToNepaliWords(totalAmount);

    const newSale: TankerWaterSale = {
      id: `TNK-${Date.now()}`,
      billNo,
      dateBS: dateBS.trim() || settings.currentSystemDateBS,
      monthBS,
      buyerName,
      phone: buyerPhone,
      destination,
      litersSold,
      ratePerLiter,
      totalAmount,
      driverStaffId: driverStaff?.id,
      driverStaffName: driverStaff?.name || 'चालक',
      wagePerLiter,
      driverWageAmount,
      paymentStatus,
      paymentMethod,
      remarks,
    };

    onSaveTankerSales([newSale, ...tankerSales]);

    // Audit Log
    onAddAuditLog({
      id: `LOG-${Date.now()}`,
      dateBS: dateBS,
      module: 'गाडी पानी बिक्री',
      referenceNo: billNo,
      memberName: buyerName,
      type: 'पानी बिक्री',
      debit: 0,
      credit: totalAmount,
      description: `${buyerName} लाई ${litersSold} लिटर ट्याङ्कर पानी बिक्री (${billNo}) - रू ${totalAmount}`,
    });

    setSuccessToast(`ट्याङ्कर पानी बिक्री बिल नं. ${billNo} सफलतापूर्वक दर्ता भयो!`);
    setTimeout(() => setSuccessToast(''), 4000);

    // Print Receipt
    onPrintReceipt({
      title: 'खानेपानी ट्याङ्कर ढुवानी तथा बिक्री रसिद',
      receiptNo: billNo,
      dateBS: dateBS,
      customerOrPayerName: buyerName,
      phone: buyerPhone,
      address: destination,
      breakdown: [
        { label: `पानी बिक्री परिमाण: ${toNepaliDigits(litersSold)} लिटर (दर रू. ${ratePerLiter}/लि)`, amount: totalAmount },
        { label: `चालक ज्याला दायित्व (${toNepaliDigits(wagePerLiter)}/लि)`, amount: driverWageAmount },
      ],
      totalAmount,
      amountInWords: words,
      paymentMethod,
      remarks,
      collectedBy: settings.authorizedPerson,
    });

    // Reset Form
    setBuyerName('');
    setBuyerPhone('');
    setActiveTab('statement');
  };

  // Filtered sales
  const filteredSales = tankerSales.filter((s) => {
    const matchMonth = filterMonth === 'ALL' || s.monthBS === filterMonth;
    const matchBuyer = filterBuyer === 'ALL' || s.buyerName === filterBuyer;
    const matchQuery =
      s.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.billNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.destination.toLowerCase().includes(searchQuery.toLowerCase());
    return matchMonth && matchBuyer && matchQuery;
  });

  const totalFilteredLiters = filteredSales.reduce((sum, s) => sum + s.litersSold, 0);
  const totalFilteredAmount = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalFilteredWages = filteredSales.reduce((sum, s) => sum + s.driverWageAmount, 0);

  // Distinct buyers for filter
  const distinctBuyers = Array.from(new Set(tankerSales.map((s) => s.buyerName)));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-600 p-3 text-white shadow-md shadow-cyan-500/20">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              गाडीमा पानी बिक्री & चालक ज्याला व्यवस्थापन
            </h2>
            <p className="text-xs text-slate-500">
              व्यक्तिगत दर, लिटर राख्नासाथ दर र ज्याला स्वतः हिसाब, मन्थवाइज र व्यक्ति अनुसार स्टेटमेन्ट
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('entry')}
          className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-600/20 hover:bg-cyan-700 transition shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ नयाँ गाडी पानी बिक्री इन्ट्री</span>
        </button>
      </div>

      {successToast && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {/* Aggregated Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">कुल बिक्री परिमाण:</span>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {toNepaliDigits(totalFilteredLiters)} लिटर
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {toNepaliDigits(filteredSales.length)} वटा ट्याङ्कर बिलहरू
          </span>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">कुल पानी बिक्री आम्दानी:</span>
          <div className="mt-2 text-2xl font-black text-blue-700">
            {formatCurrency(totalFilteredAmount)}
          </div>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">
            संस्थाको खातामा जम्मा आम्दानी
          </span>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">चालकलाई भुक्तानी ज्याला:</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {formatCurrency(totalFilteredWages)}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            कर्मचारी तलबमा जोडिने रकम
          </span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('statement')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'statement'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          मन्थवाइज / व्यक्ति अनुसार स्टेटमेन्ट ({toNepaliDigits(tankerSales.length)})
        </button>
        <button
          onClick={() => setActiveTab('entry')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'entry'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          + नयाँ ट्याङ्कर बिक्री बिल दर्ता
        </button>
      </div>

      {/* TAB 1: Statement with Month & Person Selector */}
      {activeTab === 'statement' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                गाडीमा पानी बिक्री स्टेटमेन्ट (Statement)
              </h3>
              <p className="text-xs text-slate-500">
                महिना वा व्यक्ति छान्नुहोस् र कुन व्यक्तिलाई कति पानी बिक्री भयो हेर्नुहोस्
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
              <label className="font-bold text-slate-700 block mb-1">महिना छान्नुहोस्:</label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 bg-white font-semibold"
              >
                <option value="ALL">सबै महिनाहरू (All Months)</option>
                <option value="२०८१-असार">२०८१-असार</option>
                <option value="२०८१-साउन">२०८१-साउन</option>
                <option value="२०८१-भदौ">२०८१-भदौ</option>
                <option value="२०८१-असोज">२०८१-असोज</option>
                <option value="२०८१-कार्तिक">२०८१-कार्तिक</option>
                <option value="२०८१-मंसिर">२०८१-मंसिर</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">व्यक्ति / खरिदकर्ता छान्नुहोस्:</label>
              <select
                value={filterBuyer}
                onChange={(e) => setFilterBuyer(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 bg-white font-semibold"
              >
                <option value="ALL">सबै व्यक्तिहरू (All Buyers)</option>
                {distinctBuyers.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">बिल / स्थान खोज्नुहोस्:</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="स्थान वा बिल खोज्नुहोस्..."
                  className="w-full rounded-xl border border-slate-300 p-2 pl-8 bg-white"
                />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">बिल नं</th>
                  <th className="p-3">मिति (BS)</th>
                  <th className="p-3">महिना</th>
                  <th className="p-3">खरिदकर्ताको नाम</th>
                  <th className="p-3">गन्तव्य / स्थान</th>
                  <th className="p-3 text-right">बिक्री लिटर</th>
                  <th className="p-3 text-center">दर (रू.)</th>
                  <th className="p-3 text-right">कुल रकम (रू.)</th>
                  <th className="p-3">चालकको नाम</th>
                  <th className="p-3 text-right">चालक ज्याला (रू.)</th>
                  <th className="p-3 text-center">प्रिन्ट</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-blue-700">{s.billNo}</td>
                    <td className="p-3 text-slate-600 font-medium">{toNepaliDigits(s.dateBS)}</td>
                    <td className="p-3 text-slate-700">{s.monthBS}</td>
                    <td className="p-3 font-semibold text-slate-900">
                      <div>{s.buyerName}</div>
                      {s.phone && <div className="text-[10px] text-slate-400">{toNepaliDigits(s.phone)}</div>}
                    </td>
                    <td className="p-3 text-slate-600">{s.destination}</td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {toNepaliDigits(s.litersSold)} लि
                    </td>
                    <td className="p-3 text-center text-slate-700">
                      रू {toNepaliDigits(s.ratePerLiter.toFixed(2))}
                    </td>
                    <td className="p-3 text-right font-black text-blue-800">
                      {toNepaliDigits(s.totalAmount.toFixed(2))}
                    </td>
                    <td className="p-3 text-slate-700">{s.driverStaffName || '-'}</td>
                    <td className="p-3 text-right font-bold text-emerald-700">
                      {toNepaliDigits(s.driverWageAmount.toFixed(2))}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() =>
                          onPrintReceipt({
                            title: 'खानेपानी ट्याङ्कर ढुवानी तथा बिक्री रसिद',
                            receiptNo: s.billNo,
                            dateBS: s.dateBS,
                            customerOrPayerName: s.buyerName,
                            phone: s.phone,
                            address: s.destination,
                            breakdown: [
                              { label: `पानी बिक्री: ${toNepaliDigits(s.litersSold)} लिटर (दर रू. ${s.ratePerLiter})`, amount: s.totalAmount },
                              { label: `चालक ज्याला रकम`, amount: s.driverWageAmount },
                            ],
                            totalAmount: s.totalAmount,
                            amountInWords: numberToNepaliWords(s.totalAmount),
                            paymentMethod: s.paymentMethod,
                            remarks: s.remarks,
                            collectedBy: settings.authorizedPerson,
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

      {/* TAB 2: Tanker Sale Entry Form */}
      {activeTab === 'entry' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            नयाँ गाडीमा पानी बिक्री तथा ज्याला इन्ट्री फारम
          </h3>
          <p className="text-xs text-slate-500">
            कुन व्यक्ति वा वर्गलाई बिक्री गर्ने छान्नुहोस्, लिटर टाइप गर्नासाथ बिक्री रकम र चालक ज्याला स्वतः हिसाब हुनेछ।
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Category / Person Rate Preset Selector */}
            <div className="rounded-xl bg-cyan-50/70 border border-cyan-200 p-4">
              <label className="font-bold text-cyan-950 block mb-1">
                कुन व्यक्ति वा ग्राहक वर्गलाई बिक्री गर्ने (सेटिङ अनुसार दर):
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {settings.tankerWaterRateHistory.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleCategoryChange(item.personOrCategory)}
                    className={`rounded-xl px-4 py-2 font-bold text-xs transition border ${
                      selectedRateCategory === item.personOrCategory
                        ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {item.personOrCategory} (दर: रू {item.ratePerLiter}/लि)
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  खरिदकर्ता / फर्मको नाम:
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="जस्तै: होटल हिमालयन / श्याम थापा"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">सम्पर्क फोन नम्बर:</label>
                <input
                  type="text"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="९८५१००००००"
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">गन्तव्य / स्थान:</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="मेलम्ची बजार"
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  बिक्री मिति (अटोमेटिक / फेर्न मिल्ने):
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
                <label className="font-bold text-slate-700 block mb-1">बिक्री महिना:</label>
                <select
                  value={monthBS}
                  onChange={(e) => setMonthBS(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-800"
                >
                  <option value="२०८१-असार">२०८१-असार</option>
                  <option value="२०८१-साउन">२०८१-साउन</option>
                  <option value="२०८१-भदौ">२०८१-भदौ</option>
                  <option value="२०८१-असोज">२०८१-असोज</option>
                  <option value="२०८१-कार्तिक">२०८१-कार्तिक</option>
                  <option value="२०८१-मंसिर">२०८१-मंसिर</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ढुवानी गर्ने चालक (Staff):
                </label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-800"
                >
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.designation})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  बिक्री गरेको लिटर (Liters Sold):
                </label>
                <input
                  type="number"
                  value={litersSold}
                  onChange={(e) => setLitersSold(Number(e.target.value))}
                  className="w-full rounded-xl border border-cyan-500 bg-cyan-50/30 p-2.5 text-sm font-black text-cyan-950"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  बिक्री दर (प्रति लिटर रू. अटो लोड):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={ratePerLiter}
                  onChange={(e) => setRatePerLiter(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  चालक ज्याला दर (प्रति लिटर रू. अटो लोड):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={wagePerLiter}
                  onChange={(e) => setWagePerLiter(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold"
                  required
                />
              </div>
            </div>

            {/* Auto Computed Totals Bar */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-slate-500 block">
                  कुल बिक्री रकम (Liters × Rate):
                </span>
                <span className="text-xl font-black text-blue-900">{formatCurrency(totalAmount)}</span>
                <span className="text-[11px] text-slate-600 block mt-0.5 italic">
                  {numberToNepaliWords(totalAmount)}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">
                  चालकलाई जाने ज्याला (Liters × Wage Rate):
                </span>
                <span className="text-xl font-black text-emerald-700">
                  {formatCurrency(driverWageAmount)}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  (यो रकम कर्मचारी तलब सिटमा स्वतः जोडिनेछ)
                </span>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">कैफियत:</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('statement')}
                className="rounded-xl border border-slate-300 px-5 py-2.5 font-bold text-slate-700 hover:bg-slate-100"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-2.5 font-bold text-white shadow-md hover:bg-cyan-700 transition"
              >
                <Printer className="h-4 w-4" />
                <span>बिक्री सुरक्षित गरी रसिद प्रिन्ट गर्नुहोस्</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
