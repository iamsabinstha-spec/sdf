import React, { useState } from 'react';
import {
  UserCheck2,
  PlusCircle,
  Calendar,
  Truck,
  Printer,
  DollarSign,
  CheckCircle,
  Search,
  Filter,
} from 'lucide-react';
import {
  StaffRecord,
  StaffPayroll,
  TankerWaterSale,
  OrganizationSettings,
  MasterAuditLog,
} from '../types';
import {
  NEPALI_MONTHS,
  toNepaliDigits,
  formatCurrency,
  numberToNepaliWords,
} from '../utils/nepaliDate';

interface Props {
  settings: OrganizationSettings;
  staff: StaffRecord[];
  payrolls: StaffPayroll[];
  tankerSales: TankerWaterSale[];
  onSaveStaff: (staff: StaffRecord[]) => void;
  onSavePayrolls: (payrolls: StaffPayroll[]) => void;
  onAddAuditLog: (log: MasterAuditLog) => void;
}

export const StaffView: React.FC<Props> = ({
  settings,
  staff,
  payrolls,
  tankerSales,
  onSaveStaff,
  onSavePayrolls,
  onAddAuditLog,
}) => {
  const [activeTab, setActiveTab] = useState<'payrolls' | 'new-payroll' | 'staff-list'>('payrolls');
  const [selectedMonth, setSelectedMonth] = useState<string>('२०८१-कार्तिक');
  const [successToast, setSuccessToast] = useState('');

  // Payroll Form State
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staff[0]?.id || '');
  const [entryDateBS, setEntryDateBS] = useState<string>(settings.currentSystemDateBS); // Auto BS Date
  const [formMonth, setFormMonth] = useState<string>('२०८१-कार्तिक');
  const [baseSalary, setBaseSalary] = useState<number>(staff[0]?.monthlySalary || 22000);
  const [allowance, setAllowance] = useState<number>(2000);
  const [uniformAllowance, setUniformAllowance] = useState<number>(0);
  const [festivalAllowance, setFestivalAllowance] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>('मासिक पारिश्रमिक भुक्तानी');

  // Find tanker wage earned by this staff in this month
  const calculateTankerWages = (staffId: string, month: string) => {
    return tankerSales
      .filter((t) => t.driverStaffId === staffId && t.monthBS === month)
      .reduce((sum, t) => sum + t.driverWageAmount, 0);
  };

  const calculatedTankerWage = calculateTankerWages(selectedStaffId, formMonth);
  const totalPayable =
    baseSalary + allowance + uniformAllowance + festivalAllowance + calculatedTankerWage;

  const handleStaffChange = (id: string) => {
    setSelectedStaffId(id);
    const st = staff.find((s) => s.id === id);
    if (st) {
      setBaseSalary(st.monthlySalary);
    }
  };

  const handlePayrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = staff.find((s) => s.id === selectedStaffId);
    if (!st) return;

    const words = numberToNepaliWords(totalPayable);
    const newPayroll: StaffPayroll = {
      id: `PR-${Date.now()}`,
      staffId: st.id,
      staffName: st.name,
      monthBS: formMonth,
      dateBS: entryDateBS.trim() || settings.currentSystemDateBS,
      salaryAmount: baseSalary,
      allowance,
      uniformAllowance,
      festivalAllowance,
      tankerWageEarned: calculatedTankerWage,
      totalPaid: totalPayable,
      amountInWords: words,
      remarks,
    };

    onSavePayrolls([newPayroll, ...payrolls]);

    // Audit Log
    onAddAuditLog({
      id: `LOG-${Date.now()}`,
      dateBS: entryDateBS,
      module: 'कर्मचारी तलब',
      referenceNo: newPayroll.id,
      memberName: st.name,
      type: 'कर्मचारी भुक्तानी',
      debit: totalPayable,
      credit: 0,
      description: `${st.name} लाई ${formMonth} महिनाको तलब तथा ट्याङ्कर ज्याला भुक्तानी - रू ${totalPayable}`,
    });

    setSuccessToast(`${st.name} को तलब तथा भत्ता विवरण सुरक्षित भयो!`);
    setTimeout(() => setSuccessToast(''), 4000);
    setActiveTab('payrolls');
  };

  // Filtered Payrolls by selected month
  const filteredPayrolls = payrolls.filter((p) => p.monthBS === selectedMonth);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-600 p-3 text-white shadow-md shadow-indigo-500/20">
            <UserCheck2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              कर्मचारी तलब, सुविधा, पोशाक & गाडी पानी बिक्री ज्याला
            </h2>
            <p className="text-xs text-slate-500">
              मासिक तलब, भत्ता, पोशाक, चाडपर्व खर्च तथा ट्याङ्कर पानी बिक्री गरे बापतको चालक ज्याला अटो-हिसाब
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('new-payroll')}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ तलब तथा ज्याला दाखिला</span>
        </button>
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
          onClick={() => setActiveTab('payrolls')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'payrolls'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          मासिक तलब तथा ज्याला स्टेटमेन्ट
        </button>
        <button
          onClick={() => setActiveTab('new-payroll')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'new-payroll'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          + तलब भुक्तानी दर्ता फारम
        </button>
        <button
          onClick={() => setActiveTab('staff-list')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'staff-list'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          कर्मचारी सूची ({toNepaliDigits(staff.length)})
        </button>
      </div>

      {/* TAB 1: Monthly Statement with Tanker Wage */}
      {activeTab === 'payrolls' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                महिना अनुसार तलब र पानी बिक्री ज्याला विवरण
              </h3>
              <p className="text-xs text-slate-500">
                महिना सेलेक्ट गर्दाखेरि त्यो महिनाभरिको तलब र पानी ढुवानी ज्याला देखिन्छ
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">महिना छान्नुहोस्:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-xl border border-slate-300 p-2 text-xs font-bold text-indigo-700 bg-white"
              >
                <option value="२०८१-असार">२०८१-असार</option>
                <option value="२०८१-साउन">२०८१-साउन</option>
                <option value="२०८१-भदौ">२०८१-भदौ</option>
                <option value="२०८१-असोज">२०८१-असोज</option>
                <option value="२०८१-कार्तिक">२०८१-कार्तिक</option>
                <option value="२०८१-मंसिर">२०८१-मंसिर</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">मिति (BS)</th>
                  <th className="p-3">कर्मचारीको नाम</th>
                  <th className="p-3">महिना</th>
                  <th className="p-3 text-right">मासिक तलब</th>
                  <th className="p-3 text-right">सेवा सुविधा/भत्ता</th>
                  <th className="p-3 text-right">पोशाक खर्च</th>
                  <th className="p-3 text-right">चाडपर्व खर्च</th>
                  <th className="p-3 text-right font-bold text-indigo-700">
                    गाडी पानी बिक्री ज्याला
                  </th>
                  <th className="p-3 text-right font-black">जम्मा भुक्तानी (रू.)</th>
                  <th className="p-3">कैफियत</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayrolls.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-6 text-center text-slate-400">
                      यस महिनाको कुनै तलब भुक्तानी रेकर्ड भेटिएन।
                    </td>
                  </tr>
                ) : (
                  filteredPayrolls.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="p-3 text-slate-600 font-medium">{toNepaliDigits(p.dateBS)}</td>
                      <td className="p-3 font-semibold text-slate-900">{p.staffName}</td>
                      <td className="p-3 text-slate-700">{p.monthBS}</td>
                      <td className="p-3 text-right">{toNepaliDigits(p.salaryAmount.toFixed(2))}</td>
                      <td className="p-3 text-right">{toNepaliDigits(p.allowance.toFixed(2))}</td>
                      <td className="p-3 text-right">{toNepaliDigits(p.uniformAllowance.toFixed(2))}</td>
                      <td className="p-3 text-right">{toNepaliDigits(p.festivalAllowance.toFixed(2))}</td>
                      <td className="p-3 text-right font-black text-indigo-700 bg-indigo-50/40">
                        {toNepaliDigits(p.tankerWageEarned.toFixed(2))}
                      </td>
                      <td className="p-3 text-right font-black text-slate-900">
                        {toNepaliDigits(p.totalPaid.toFixed(2))}
                      </td>
                      <td className="p-3 text-slate-500">{p.remarks}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Payroll Form */}
      {activeTab === 'new-payroll' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            कर्मचारी तलब, भत्ता तथा ट्याङ्कर ज्याला दाखिला फारम
          </h3>
          <p className="text-xs text-slate-500">
            नेपाली मिति अटोमेटिक आएको छ, कर्मचारी र महिना छान्दा ट्याङ्कर पानी बिक्री गरेको ज्याला अटो-लोड हुन्छ।
          </p>

          <form onSubmit={handlePayrollSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">कर्मचारी छान्नुहोस्:</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => handleStaffChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-800"
                >
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">तलब महिना:</label>
                <select
                  value={formMonth}
                  onChange={(e) => setFormMonth(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-indigo-700"
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
                  इन्ट्री मिति (अटोमेटिक नेपाली मिति BS):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={entryDateBS}
                    onChange={(e) => setEntryDateBS(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 pl-8 font-bold text-slate-900"
                    required
                  />
                  <Calendar className="absolute left-2.5 top-3 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">मासिक तलब (रू.):</label>
                <input
                  type="number"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">सेवा सुविधा / भत्ता (रू.):</label>
                <input
                  type="number"
                  value={allowance}
                  onChange={(e) => setAllowance(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">पोशाक खर्च (रू.):</label>
                <input
                  type="number"
                  value={uniformAllowance}
                  onChange={(e) => setUniformAllowance(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">चाडपर्व खर्च (रू.):</label>
                <input
                  type="number"
                  value={festivalAllowance}
                  onChange={(e) => setFestivalAllowance(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>
            </div>

            {/* Tanker Wage Auto Loaded */}
            <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-indigo-900 block">
                  गाडीमा पानी बिक्री गरेको ज्याला ({formMonth}):
                </span>
                <span className="text-[11px] text-indigo-700">
                  यस महिना ट्याङ्कर पानी ढुवानी गरे बापत चालकले आर्जन गरेको कुल ज्याला
                </span>
              </div>
              <span className="text-base font-black text-indigo-800">
                {formatCurrency(calculatedTankerWage)}
              </span>
            </div>

            {/* Total and Words */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex justify-between items-center">
              <div>
                <span className="text-[11px] text-slate-500 block">कुल भुक्तानी रकम:</span>
                <span className="text-base font-black text-slate-900">
                  {formatCurrency(totalPayable)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">रकम अक्षरमा:</span>
                <span className="text-xs font-bold text-slate-800 italic">
                  {numberToNepaliWords(totalPayable)}
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

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 font-bold text-white shadow-md hover:bg-indigo-700 transition"
              >
                <span>तलब भुक्तानी सुरक्षित गर्नुहोस्</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Staff List */}
      {activeTab === 'staff-list' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            कर्मचारी विवरण सूची
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {staff.map((s) => (
              <div key={s.id} className="rounded-2xl border border-slate-200 p-5 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                    {s.status}
                  </span>
                </div>
                <p className="text-xs text-blue-700 font-semibold">{s.designation}</p>
                <p className="text-xs text-slate-500">फोन: {toNepaliDigits(s.phone)}</p>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500">मासिक तलब:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(s.monthlySalary)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
