import React, { useState } from 'react';
import { Printer, Calendar, Droplets, Users, CheckCircle2 } from 'lucide-react';
import { Customer, OrganizationSettings } from '../types';
import { NEPALI_MONTHS, toNepaliDigits } from '../utils/nepaliDate';

interface Props {
  settings: OrganizationSettings;
  customers: Customer[];
}

export const MeterSheetView: React.FC<Props> = ({ settings, customers }) => {
  const currentYear = settings.currentSystemDateBS.split('/')[0] || '२०८१';
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>('कार्तिक');
  const [meterReaderName, setMeterReaderName] = useState<string>('दिलमाया श्रेष्ठ');

  const monthLabel = `${selectedYear} साल ${selectedMonth} महिना`;

  const handlePrint = () => {
    window.print();
  };

  const activeCustomers = customers.filter((c) => c.status === 'सक्रिय');

  return (
    <div className="space-y-6">
      {/* Top Banner (Hidden in Print) */}
      <div className="no-print rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-md shadow-blue-500/20">
            <Printer className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              स्थलगत मिटर रिडिङ A4 सिट प्रिन्ट
            </h2>
            <p className="text-xs text-slate-500">
              फिल्डमा रिडिङ गर्न जाँदा साविक अङ्क अटोमेटिक, हालको अङ्क, खपत र रकम खाली भएको A4 सिट
            </p>
          </div>
        </div>

        {/* Print Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-700">साल:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-xl border border-slate-300 p-2 font-bold"
            >
              <option value="२०८०">२०८०</option>
              <option value="२०८१">२०८१</option>
              <option value="२०८२">२०८२</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-700">महिना:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-xl border border-slate-300 p-2 font-bold text-blue-700"
            >
              {NEPALI_MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-700">रिडरको नाम:</span>
            <input
              type="text"
              value={meterReaderName}
              onChange={(e) => setMeterReaderName(e.target.value)}
              className="rounded-xl border border-slate-300 p-2 w-36 font-semibold"
            />
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            <Printer className="h-4 w-4" />
            <span>A4 सिट प्रिन्ट गर्नुहोस् (Print A4)</span>
          </button>
        </div>
      </div>

      {/* A4 Sheet Container for Print & Screen Preview */}
      <div className="rounded-2xl bg-white p-8 border border-slate-300 shadow-sm print:border-none print:p-0 print:shadow-none text-black">
        {/* Official Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold no-print">
              <Droplets className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 print:text-black">
              {settings.name}
            </h1>
          </div>
          <p className="text-xs font-medium text-slate-700 print:text-black">
            {settings.address} | फोन नं: {toNepaliDigits(settings.phone)} | दर्ता नं: {toNepaliDigits(settings.regNo)}
          </p>
          <div className="mt-2 inline-block rounded-md border border-black bg-slate-100 px-4 py-1 text-xs font-black uppercase tracking-wider print:bg-transparent">
            स्थलगत खानेपानी मिटर रिडिङ सिट - {monthLabel}
          </div>
        </div>

        {/* Sheet Meta info */}
        <div className="flex justify-between items-center text-xs font-semibold mb-3 px-1">
          <div>
            <span>रिडिङ महिना: </span>
            <span className="font-bold underline">{monthLabel}</span>
          </div>
          <div>
            <span>मिटर रिडरको नाम: </span>
            <span className="font-bold underline">{meterReaderName}</span>
          </div>
          <div>
            <span>रिडिङ मिति: २०८१ / ..... / .....</span>
          </div>
        </div>

        {/* Main Printable Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-slate-100 print:bg-slate-200 text-center font-bold border-b border-black">
                <th className="border border-black p-2 w-10">क्र.सं.</th>
                <th className="border border-black p-2 w-20">ग्राहक आइडी</th>
                <th className="border border-black p-2 text-left">ग्राहकको नाम</th>
                <th className="border border-black p-2 text-left">ठेगाना / टोल</th>
                <th className="border border-black p-2 w-20">मिटर नं</th>
                <th className="border border-black p-2 w-24 bg-blue-50/50 print:bg-transparent">
                  साविक अङ्क (Auto)
                </th>
                <th className="border border-black p-2 w-28 text-center text-slate-700">
                  हालको अङ्क (खाली)
                </th>
                <th className="border border-black p-2 w-20 text-center text-slate-700">
                  खपत युनिट
                </th>
                <th className="border border-black p-2 w-24 text-center text-slate-700">
                  रकम (रू.)
                </th>
                <th className="border border-black p-2 w-28 text-center">
                  ग्राहक दस्तखत / कैफियत
                </th>
              </tr>
            </thead>
            <tbody>
              {activeCustomers.map((c, idx) => (
                <tr key={c.id} className="h-10 text-center">
                  <td className="border border-black p-1.5 font-medium">
                    {toNepaliDigits(idx + 1)}
                  </td>
                  <td className="border border-black p-1.5 font-bold">{c.id}</td>
                  <td className="border border-black p-1.5 text-left font-bold">{c.name}</td>
                  <td className="border border-black p-1.5 text-left text-[11px]">{c.address}</td>
                  <td className="border border-black p-1.5 font-mono">{toNepaliDigits(c.meterNo)}</td>
                  {/* Previous Reading (Automatic) */}
                  <td className="border border-black p-1.5 font-black text-slate-900 bg-slate-50/50 print:bg-transparent">
                    {toNepaliDigits(c.previousReading)}
                  </td>
                  {/* Current Reading (BLANK as requested) */}
                  <td className="border border-black p-1.5 bg-white"></td>
                  {/* Consumed Units (BLANK as requested) */}
                  <td className="border border-black p-1.5 bg-white"></td>
                  {/* Amount (BLANK as requested) */}
                  <td className="border border-black p-1.5 bg-white"></td>
                  {/* Remarks / Signature */}
                  <td className="border border-black p-1.5 bg-white"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sheet Footer Signatures */}
        <div className="mt-12 pt-6 grid grid-cols-3 gap-6 text-xs text-center">
          <div>
            <div className="border-b border-black border-dashed mx-6 h-6"></div>
            <p className="mt-1 font-bold">मिटर रिडरको दस्तखत</p>
          </div>
          <div>
            <div className="border-b border-black border-dashed mx-6 h-6"></div>
            <p className="mt-1 font-bold">जाँच गर्ने (लेखापाल / सचिव)</p>
          </div>
          <div>
            <div className="border-b border-black border-dashed mx-6 h-6"></div>
            <p className="mt-1 font-bold">स्वीकृत गर्ने (अध्यक्ष)</p>
          </div>
        </div>

        <div className="text-center mt-6 text-[10px] text-slate-500">
          * खानेपानी तथा सरसफाइ उपभोक्ता संस्था - स्थलगत मिटर रिडिङ प्रमाणिकरण सिट *
        </div>
      </div>
    </div>
  );
};
