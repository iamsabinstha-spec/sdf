import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Calendar,
  DollarSign,
  Percent,
  Clock,
  Shield,
  Truck,
  Plus,
  Trash2,
  CheckCircle,
  Smartphone,
  Building,
  History,
  FileCheck2,
} from 'lucide-react';
import {
  OrganizationSettings,
  TariffHistoryItem,
  LoanRateHistoryItem,
  TankerRateHistoryItem,
} from '../types';
import { toNepaliDigits, formatCurrency } from '../utils/nepaliDate';

interface Props {
  settings: OrganizationSettings;
  onSaveSettings: (newSettings: OrganizationSettings) => void;
}

export const SettingsView: React.FC<Props> = ({ settings, onSaveSettings }) => {
  const [formData, setFormData] = useState<OrganizationSettings>(settings);
  const [activeSubTab, setActiveSubTab] = useState<
    'general' | 'tariff' | 'loan-rates' | 'tanker-rates'
  >('general');
  const [successToast, setSuccessToast] = useState('');

  // Tariff History Modal/Form State
  const [newTariff, setNewTariff] = useState<Partial<TariffHistoryItem>>({
    fromDate: '२०८१/०१/०१',
    toDate: '२०८१/१२/३०',
    minCharge: 110,
    minUnits: 10,
    perUnitRate: 22,
    penaltyGraceDays: 15,
    penaltyPercent: 10,
    decisionNo: '',
    remarks: '',
  });

  // Loan Rate Form State
  const [newLoanRate, setNewLoanRate] = useState<Partial<LoanRateHistoryItem>>({
    fromDate: '२०८१/०१/०१',
    toDate: '२०८१/१२/३०',
    annualInterestRate: 13.5,
    penaltyRate: 2,
    decisionNo: '',
    remarks: '',
  });

  // Tanker Rate Form State
  const [newTankerRate, setNewTankerRate] = useState<Partial<TankerRateHistoryItem>>({
    personOrCategory: 'सर्वसाधारण उपभोक्ता',
    fromDate: '२०८१/०१/०१',
    toDate: '२०८१/१२/३०',
    ratePerLiter: 0.35,
    driverWagePerLiter: 0.07,
    remarks: '',
  });

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveSettings(formData);
    setSuccessToast('सेटिङहरू सफलतापूर्वक सुरक्षित गरियो!');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // Add tariff history item
  const handleAddTariff = (e: React.FormEvent) => {
    e.preventDefault();
    const item: TariffHistoryItem = {
      id: `TR-${Date.now()}`,
      fromDate: newTariff.fromDate || '२०८१/०१/०१',
      toDate: newTariff.toDate || '२०८१/१२/३०',
      minCharge: Number(newTariff.minCharge) || 110,
      minUnits: Number(newTariff.minUnits) || 10,
      perUnitRate: Number(newTariff.perUnitRate) || 22,
      penaltyGraceDays: Number(newTariff.penaltyGraceDays) || 15,
      penaltyPercent: Number(newTariff.penaltyPercent) || 10,
      decisionNo: newTariff.decisionNo || 'समिति निर्णय',
      remarks: newTariff.remarks || '',
    };
    const updated = {
      ...formData,
      minimumCharge: item.minCharge,
      minimumUnitsIncluded: item.minUnits,
      unitRateExceeding: item.perUnitRate,
      penaltyGraceDays: item.penaltyGraceDays,
      penaltyPercent: item.penaltyPercent,
      tariffRateHistory: [item, ...formData.tariffRateHistory],
    };
    setFormData(updated);
    onSaveSettings(updated);
    setSuccessToast('नयाँ महसुल दर मिति दायरा अनुसार थपियो र सक्रिय गरियो!');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleDeleteTariff = (id: string) => {
    const updated = {
      ...formData,
      tariffRateHistory: formData.tariffRateHistory.filter((t) => t.id !== id),
    };
    setFormData(updated);
    onSaveSettings(updated);
  };

  // Add Loan Rate item
  const handleAddLoanRate = (e: React.FormEvent) => {
    e.preventDefault();
    const item: LoanRateHistoryItem = {
      id: `LR-${Date.now()}`,
      fromDate: newLoanRate.fromDate || '२०८१/०१/०१',
      toDate: newLoanRate.toDate || '२०८१/१२/३०',
      annualInterestRate: Number(newLoanRate.annualInterestRate) || 12,
      penaltyRate: Number(newLoanRate.penaltyRate) || 2,
      decisionNo: newLoanRate.decisionNo || 'समिति निर्णय',
      remarks: newLoanRate.remarks || '',
    };
    const updated = {
      ...formData,
      loanInterestRateHistory: [item, ...formData.loanInterestRateHistory],
    };
    setFormData(updated);
    onSaveSettings(updated);
    setSuccessToast('नयाँ ऋण ब्याजदर निर्णय तालिका थपियो!');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleDeleteLoanRate = (id: string) => {
    const updated = {
      ...formData,
      loanInterestRateHistory: formData.loanInterestRateHistory.filter((l) => l.id !== id),
    };
    setFormData(updated);
    onSaveSettings(updated);
  };

  // Add Tanker Rate item
  const handleAddTankerRate = (e: React.FormEvent) => {
    e.preventDefault();
    const item: TankerRateHistoryItem = {
      id: `TWR-${Date.now()}`,
      personOrCategory: newTankerRate.personOrCategory || 'सर्वसाधारण',
      fromDate: newTankerRate.fromDate || '२०८१/०१/०१',
      toDate: newTankerRate.toDate || '२०८१/१२/३०',
      ratePerLiter: Number(newTankerRate.ratePerLiter) || 0.35,
      driverWagePerLiter: Number(newTankerRate.driverWagePerLiter) || 0.07,
      remarks: newTankerRate.remarks || '',
    };
    const updated = {
      ...formData,
      tankerWaterRateHistory: [item, ...formData.tankerWaterRateHistory],
    };
    setFormData(updated);
    onSaveSettings(updated);
    setSuccessToast('गाडीमा पानी बिक्री तथा ज्याला दर तालिका थपियो!');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleDeleteTankerRate = (id: string) => {
    const updated = {
      ...formData,
      tankerWaterRateHistory: formData.tankerWaterRateHistory.filter((t) => t.id !== id),
    };
    setFormData(updated);
    onSaveSettings(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-md shadow-blue-500/20">
            <SettingsIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              प्रणाली तथा महसुल/ब्याजदर सेटिङ
            </h2>
            <p className="text-xs text-slate-500">
              चलिरहेको मिति, न्यूनतम रकम, अतिरिक्त युनिट शुल्क, जरिवाना दर, ऋण ब्याजदर र संस्थाको विवरण
            </p>
          </div>
        </div>

        {/* Global Save Button */}
        <button
          onClick={() => handleSave()}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition shrink-0"
        >
          <Save className="h-4 w-4" />
          <span>सबै परिवर्तन सुरक्षित गर्नुहोस्</span>
        </button>
      </div>

      {successToast && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('general')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeSubTab === 'general'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building className="h-4 w-4" />
          <span>१. संस्थाको विवरण & प्रणाली मिति</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tariff')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeSubTab === 'tariff'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>२. महसुल दर & जरिवाना तालिका</span>
        </button>

        <button
          onClick={() => setActiveSubTab('loan-rates')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeSubTab === 'loan-rates'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Percent className="h-4 w-4" />
          <span>३. ऋण ब्याजदर मिति अनुसार</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tanker-rates')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeSubTab === 'tanker-rates'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>४. गाडीमा पानी बिक्री & ज्याला दर</span>
        </button>
      </div>

      {/* TAB 1: General & Current System Date */}
      {activeSubTab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System Date & Manager Mobile Card */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-blue-700 font-bold text-sm">
              <Calendar className="h-5 w-5" />
              <span>सफ्टवेयरमा चलिरहेको मिति & मोबाइल अलर्ट</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                softwareमा चलिरहेको मिति (Current System Date BS)
              </label>
              <input
                type="text"
                value={formData.currentSystemDateBS}
                onChange={(e) =>
                  setFormData({ ...formData, currentSystemDateBS: e.target.value })
                }
                placeholder="२०८१/०७/२२"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                यहाँबाट मिति परिवर्तन गर्नासाथ सम्पूर्ण रिडिङ, जरिवाना गणना, र ऋणको भाखा म्याद स्वतः अद्यावधिक हुन्छ।
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ऋण म्याद सकिएको नोटिफिकेसन आउने व्यवस्थापकको मोबाइल नं
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.managerMobileForAlerts}
                  onChange={(e) =>
                    setFormData({ ...formData, managerMobileForAlerts: e.target.value })
                  }
                  placeholder="९८५१२३४५६७"
                  className="w-full rounded-xl border border-slate-300 p-2.5 pl-9 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                />
                <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                ऋणको भाखा नाघेमा यस नम्बरमा १-क्लिकमा WhatsApp/SMS अलर्ट पठाउन सकिन्छ।
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleSave()}
                className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
              >
                मिति र मोबाइल नम्बर अपडेट गर्नुहोस्
              </button>
            </div>
          </div>

          {/* Committee Details */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-blue-700 font-bold text-sm">
              <Building className="h-5 w-5" />
              <span>समितिको नाम, ठेगाना र आधिकारिक विवरण</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                संस्था / समितिको नाम:
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">ठेगाना:</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">सम्पर्क फोन नं:</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">दर्ता नं:</label>
                <input
                  type="text"
                  value={formData.regNo}
                  onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">प्यान (PAN) नं:</label>
                <input
                  type="text"
                  value={formData.panNo}
                  onChange={(e) => setFormData({ ...formData, panNo: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  आधिकारिक व्यक्ति (अध्यक्ष/सचिव):
                </label>
                <input
                  type="text"
                  value={formData.authorizedPerson}
                  onChange={(e) => setFormData({ ...formData, authorizedPerson: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">पद (Designation):</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Tariff & Penalty History (कुन मितिदेखि कुन मितिसम्म) */}
      {activeSubTab === 'tariff' && (
        <div className="space-y-6">
          {/* Active Baseline Rates Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 block">
                हालको न्यूनतम रकम:
              </span>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-xl font-black text-slate-900">
                  रू {toNepaliDigits(formData.minimumCharge)}
                </span>
                <span className="text-xs text-slate-500">
                  ({toNepaliDigits(formData.minimumUnitsIncluded)} युनिट सम्म)
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 block">
                न्यूनतमभन्दा बढी अतिरिक्त शुल्क:
              </span>
              <div className="mt-2">
                <span className="text-xl font-black text-slate-900">
                  रू {toNepaliDigits(formData.unitRateExceeding)}
                </span>
                <span className="text-xs text-slate-500 ml-1">प्रति युनिट</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 block">
                रिडिङ भएपछि जरिवाना लाग्ने दिन:
              </span>
              <div className="mt-2">
                <span className="text-xl font-black text-slate-900">
                  {toNepaliDigits(formData.penaltyGraceDays)}
                </span>
                <span className="text-xs text-slate-500 ml-1">दिनपछि</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 block">
                जरिवाना प्रतिशत दर:
              </span>
              <div className="mt-2">
                <span className="text-xl font-black text-rose-600">
                  {toNepaliDigits(formData.penaltyPercent)}%
                </span>
                <span className="text-xs text-slate-500 ml-1">अतिरिक्त</span>
              </div>
            </div>
          </div>

          {/* Add Tariff Form for Date to Date */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              कुन मितिदेखि कुन मितिसम्म जरिवाना दर, महसुल दर र न्यूनतम रकम परिवर्तन गर्ने अप्सन
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              समितिले नयाँ आर्थिक वर्ष वा बैठकको निर्णयअनुसार दर परिवर्तन गर्दा यहाँ मिति दायरासहित थप्नुहोस्।
            </p>

            <form onSubmit={handleAddTariff} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">सुरु मिति (BS):</label>
                <input
                  type="text"
                  value={newTariff.fromDate}
                  onChange={(e) => setNewTariff({ ...newTariff, fromDate: e.target.value })}
                  placeholder="२०८१/०१/०१"
                  className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">अन्तिम मिति (BS):</label>
                <input
                  type="text"
                  value={newTariff.toDate}
                  onChange={(e) => setNewTariff({ ...newTariff, toDate: e.target.value })}
                  placeholder="२०८१/१२/३०"
                  className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">न्यूनतम रकम (रू.):</label>
                <input
                  type="number"
                  value={newTariff.minCharge}
                  onChange={(e) => setNewTariff({ ...newTariff, minCharge: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">अतिरिक्त दर (प्रति युनिट):</label>
                <input
                  type="number"
                  value={newTariff.perUnitRate}
                  onChange={(e) => setNewTariff({ ...newTariff, perUnitRate: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">जरिवाना लाग्ने दिन:</label>
                <input
                  type="number"
                  value={newTariff.penaltyGraceDays}
                  onChange={(e) => setNewTariff({ ...newTariff, penaltyGraceDays: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">जरिवाना (%):</label>
                <input
                  type="number"
                  value={newTariff.penaltyPercent}
                  onChange={(e) => setNewTariff({ ...newTariff, penaltyPercent: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">निर्णय नं / मिति:</label>
                <input
                  type="text"
                  value={newTariff.decisionNo}
                  onChange={(e) => setNewTariff({ ...newTariff, decisionNo: e.target.value })}
                  placeholder="निर्णय नं. ५/०८१"
                  className="w-full rounded-xl border border-slate-300 p-2"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>यो दर तालिका थप्नुहोस्</span>
                </button>
              </div>
            </form>
          </div>

          {/* Historical / Scheduled Tariffs Table */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              लागू भएका महसुल दर तथा जरिवानाको इतिहास / तालिका:
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">मिति दायरा (देखि - सम्म)</th>
                    <th className="p-2.5 text-right">न्यूनतम रकम</th>
                    <th className="p-2.5 text-right">अतिरिक्त प्रति युनिट</th>
                    <th className="p-2.5 text-center">जरिवाना दिन</th>
                    <th className="p-2.5 text-center">जरिवाना %</th>
                    <th className="p-2.5">निर्णय विवरण</th>
                    <th className="p-2.5 text-center">हटाउने</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {formData.tariffRateHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-bold text-blue-700">
                        {toNepaliDigits(item.fromDate)} देखि {toNepaliDigits(item.toDate)} सम्म
                      </td>
                      <td className="p-2.5 text-right font-semibold">
                        रू {toNepaliDigits(item.minCharge)} ({toNepaliDigits(item.minUnits)} युनिट)
                      </td>
                      <td className="p-2.5 text-right font-semibold">
                        रू {toNepaliDigits(item.perUnitRate)}
                      </td>
                      <td className="p-2.5 text-center">{toNepaliDigits(item.penaltyGraceDays)} दिन</td>
                      <td className="p-2.5 text-center font-bold text-rose-600">
                        {toNepaliDigits(item.penaltyPercent)}%
                      </td>
                      <td className="p-2.5 text-slate-600">
                        {item.decisionNo} {item.remarks && `(${item.remarks})`}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteTariff(item.id)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Loan Interest Rates History (समितिको निर्णय अनुसार परिवर्तन हुन सक्ने) */}
      {activeSubTab === 'loan-rates' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              ऋण लगानीमा ब्याजदर कुन मितिदेखि कुन मितिसम्म कति ब्याजदर (समितिको निर्णय अनुसार)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              समितिको निर्णय अनुसार एक वर्षभित्रै वा वार्षिक रूपमा ब्याजदर परिवर्तन हुँदा यहाँ नयाँ दर दर्ता गर्नुहोस्।
            </p>

            <form onSubmit={handleAddLoanRate} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">सुरु मिति (BS):</label>
                <input
                  type="text"
                  value={newLoanRate.fromDate}
                  onChange={(e) => setNewLoanRate({ ...newLoanRate, fromDate: e.target.value })}
                  placeholder="२०८१/०१/०१"
                  className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">अन्तिम मिति (BS):</label>
                <input
                  type="text"
                  value={newLoanRate.toDate}
                  onChange={(e) => setNewLoanRate({ ...newLoanRate, toDate: e.target.value })}
                  placeholder="२०८१/१२/३०"
                  className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">वार्षिक ब्याजदर (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={newLoanRate.annualInterestRate}
                  onChange={(e) =>
                    setNewLoanRate({ ...newLoanRate, annualInterestRate: Number(e.target.value) })
                  }
                  placeholder="13.5"
                  className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">हर्जाना ब्याजदर (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={newLoanRate.penaltyRate}
                  onChange={(e) =>
                    setNewLoanRate({ ...newLoanRate, penaltyRate: Number(e.target.value) })
                  }
                  placeholder="2.0"
                  className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">समितिको निर्णय नं / कैफियत:</label>
                <input
                  type="text"
                  value={newLoanRate.decisionNo}
                  onChange={(e) =>
                    setNewLoanRate({ ...newLoanRate, decisionNo: e.target.value })
                  }
                  placeholder="निर्णय नं. ३ (नयाँ संशोधित ब्याजदर)"
                  className="w-full rounded-xl border border-slate-300 p-2"
                />
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 font-bold text-white shadow-xs hover:bg-blue-700 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>यो ऋण ब्याजदर निर्णय तालिका थप्नुहोस्</span>
                </button>
              </div>
            </form>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              ऋण लगानी ब्याजदर परिवर्तन इतिहास:
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">मिति दायरा</th>
                    <th className="p-2.5 text-center">वार्षिक ब्याजदर</th>
                    <th className="p-2.5 text-center">हर्जाना दर</th>
                    <th className="p-2.5">समिति निर्णय नं</th>
                    <th className="p-2.5 text-center">हटाउने</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {formData.loanInterestRateHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-bold text-blue-700">
                        {toNepaliDigits(item.fromDate)} देखि {toNepaliDigits(item.toDate)} सम्म
                      </td>
                      <td className="p-2.5 text-center font-black text-slate-900">
                        {toNepaliDigits(item.annualInterestRate)}%
                      </td>
                      <td className="p-2.5 text-center font-bold text-rose-600">
                        {toNepaliDigits(item.penaltyRate)}%
                      </td>
                      <td className="p-2.5 text-slate-600">
                        {item.decisionNo} {item.remarks && `(${item.remarks})`}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteLoanRate(item.id)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Tanker Water Rates per Person / Category */}
      {activeSubTab === 'tanker-rates' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              गाडीमा पानी बिक्री दर र चालक ज्याला दर (कुन व्यक्ति/वर्गलाई कुन दरमा बेच्ने र मिति दायरा)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              व्यक्तिगत, होटल, उद्योग, वा निर्माण कार्य अनुसार पानी बिक्री दर र चालकलाई दिने ज्याला दर सेट गर्नुहोस्।
            </p>

            <form onSubmit={handleAddTankerRate} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">व्यक्ति वा वर्ग (Category):</label>
                <input
                  type="text"
                  value={newTankerRate.personOrCategory}
                  onChange={(e) =>
                    setNewTankerRate({ ...newTankerRate, personOrCategory: e.target.value })
                  }
                  placeholder="जस्तै: सर्वसाधारण, होटल, उद्योग..."
                  className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">सुरु मिति (BS):</label>
                <input
                  type="text"
                  value={newTankerRate.fromDate}
                  onChange={(e) =>
                    setNewTankerRate({ ...newTankerRate, fromDate: e.target.value })
                  }
                  placeholder="२०८१/०१/०१"
                  className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">अन्तिम मिति (BS):</label>
                <input
                  type="text"
                  value={newTankerRate.toDate}
                  onChange={(e) =>
                    setNewTankerRate({ ...newTankerRate, toDate: e.target.value })
                  }
                  placeholder="२०८१/१२/३०"
                  className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  बिक्री दर (प्रति लिटर रू):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newTankerRate.ratePerLiter}
                  onChange={(e) =>
                    setNewTankerRate({ ...newTankerRate, ratePerLiter: Number(e.target.value) })
                  }
                  placeholder="0.35"
                  className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  चालक ज्याला दर (प्रति लिटर रू):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newTankerRate.driverWagePerLiter}
                  onChange={(e) =>
                    setNewTankerRate({ ...newTankerRate, driverWagePerLiter: Number(e.target.value) })
                  }
                  placeholder="0.07"
                  className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">कैफियत / टिप्पणी:</label>
                <input
                  type="text"
                  value={newTankerRate.remarks}
                  onChange={(e) =>
                    setNewTankerRate({ ...newTankerRate, remarks: e.target.value })
                  }
                  placeholder="प्रति १००० लिटर रू ३५० (ज्याला रू ७०)"
                  className="w-full rounded-xl border border-slate-300 p-2"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-cyan-600 py-2.5 font-bold text-white shadow-xs hover:bg-cyan-700 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>यो पानी दर तालिका थप्नुहोस्</span>
                </button>
              </div>
            </form>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              गाडी पानी बिक्री तथा ज्याला दर तालिका:
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">व्यक्ति / ग्राहक वर्ग</th>
                    <th className="p-2.5">मिति दायरा</th>
                    <th className="p-2.5 text-right">बिक्री दर (प्रति लिटर)</th>
                    <th className="p-2.5 text-right">चालक ज्याला दर (प्रति लिटर)</th>
                    <th className="p-2.5">कैफियत</th>
                    <th className="p-2.5 text-center">हटाउने</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {formData.tankerWaterRateHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-bold text-slate-900">{item.personOrCategory}</td>
                      <td className="p-2.5 font-medium text-slate-600">
                        {toNepaliDigits(item.fromDate)} देखि {toNepaliDigits(item.toDate)} सम्म
                      </td>
                      <td className="p-2.5 text-right font-black text-blue-700">
                        रू {toNepaliDigits(item.ratePerLiter.toFixed(2))}
                      </td>
                      <td className="p-2.5 text-right font-black text-emerald-700">
                        रू {toNepaliDigits(item.driverWagePerLiter.toFixed(2))}
                      </td>
                      <td className="p-2.5 text-slate-500">{item.remarks}</td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteTankerRate(item.id)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
