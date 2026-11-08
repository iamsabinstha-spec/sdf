import React from 'react';
import { Printer, X, CheckCircle, Droplets } from 'lucide-react';
import { OrganizationSettings } from '../types';
import { toNepaliDigits, formatCurrency } from '../utils/nepaliDate';

export interface ReceiptData {
  title: string;
  receiptNo: string;
  dateBS: string;
  customerOrPayerName: string;
  customerOrMeterId?: string;
  phone?: string;
  address?: string;
  monthBS?: string;
  previousReading?: number;
  currentReading?: number;
  consumedUnits?: number;
  breakdown?: Array<{ label: string; amount: number }>;
  totalAmount: number;
  amountInWords: string;
  paymentMethod: string;
  remarks?: string;
  collectedBy: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: ReceiptData | null;
  settings: OrganizationSettings;
}

export const ReceiptPrintModal: React.FC<Props> = ({
  isOpen,
  onClose,
  data,
  settings,
}) => {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="no-print flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              आधिकारिक रसिद प्रिन्ट (Official Receipt)
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
            >
              <Printer className="h-4 w-4" />
              <span>प्रिन्ट गर्नुहोस् (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="overflow-y-auto p-8 text-slate-900 font-sans print:p-4 print:text-black">
          <div className="rounded-2xl border-2 border-slate-300 p-6 print:border-black print:p-4 relative">
            {/* Header */}
            <div className="text-center border-b border-slate-300 pb-4 mb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Droplets className="h-5 w-5" />
                </div>
                <h1 className="text-lg font-extrabold text-slate-900">
                  {settings.name}
                </h1>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {settings.address} | फोन: {toNepaliDigits(settings.phone)}
              </p>
              <div className="flex justify-center gap-4 text-[11px] text-slate-500 mt-1">
                <span>दर्ता नं: {toNepaliDigits(settings.regNo)}</span>
                <span>•</span>
                <span>प्यान नं: {toNepaliDigits(settings.panNo)}</span>
              </div>
              <div className="mt-3 inline-block rounded-full bg-blue-100 px-4 py-1 text-xs font-bold text-blue-900 border border-blue-200">
                {data.title}
              </div>
            </div>

            {/* Receipt Meta info */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200 print:bg-transparent print:border-none print:p-0">
              <div>
                <p>
                  <span className="font-semibold text-slate-500">रसिद नं: </span>
                  <span className="font-bold text-slate-900">{data.receiptNo}</span>
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-slate-500">ग्राहक / प्राप्तकर्ता: </span>
                  <span className="font-bold text-slate-900">{data.customerOrPayerName}</span>
                </p>
                {data.customerOrMeterId && (
                  <p className="mt-1">
                    <span className="font-semibold text-slate-500">ग्राहक / मिटर नं: </span>
                    <span className="font-medium text-slate-800">{toNepaliDigits(data.customerOrMeterId)}</span>
                  </p>
                )}
                {data.address && (
                  <p className="mt-1">
                    <span className="font-semibold text-slate-500">ठेगाना: </span>
                    <span className="text-slate-800">{data.address}</span>
                  </p>
                )}
              </div>
              <div className="text-right">
                <p>
                  <span className="font-semibold text-slate-500">मिति (BS): </span>
                  <span className="font-bold text-slate-900">{toNepaliDigits(data.dateBS)}</span>
                </p>
                {data.monthBS && (
                  <p className="mt-1">
                    <span className="font-semibold text-slate-500">महिना: </span>
                    <span className="font-bold text-blue-700">{data.monthBS}</span>
                  </p>
                )}
                {data.phone && (
                  <p className="mt-1">
                    <span className="font-semibold text-slate-500">मोबाइल: </span>
                    <span className="text-slate-800">{toNepaliDigits(data.phone)}</span>
                  </p>
                )}
                <p className="mt-1">
                  <span className="font-semibold text-slate-500">भुक्तानी माध्यम: </span>
                  <span className="rounded-md bg-slate-200 px-2 py-0.5 font-semibold text-[11px]">
                    {data.paymentMethod}
                  </span>
                </p>
              </div>
            </div>

            {/* Reading Details Table if applicable */}
            {data.previousReading !== undefined && data.currentReading !== undefined && (
              <div className="mb-4 overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="p-2 text-center">साविक अङ्क</th>
                      <th className="p-2 text-center">हालको अङ्क</th>
                      <th className="p-2 text-center">खपत युनिट</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center font-bold text-slate-800">
                      <td className="p-2">{toNepaliDigits(data.previousReading)}</td>
                      <td className="p-2">{toNepaliDigits(data.currentReading)}</td>
                      <td className="p-2 text-blue-600">{toNepaliDigits(data.consumedUnits || 0)} युनिट</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Breakdown Items */}
            {data.breakdown && data.breakdown.length > 0 && (
              <div className="mb-4 overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="p-2 text-left">विवरण / शीर्षक</th>
                      <th className="p-2 text-right">रकम (रू.)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.breakdown.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 text-slate-700">{item.label}</td>
                        <td className="p-2 text-right font-medium">{toNepaliDigits(item.amount.toFixed(2))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Total and Words */}
            <div className="rounded-xl bg-blue-50/70 p-3 border border-blue-100 mb-6 print:bg-transparent print:border-black">
              <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 border-b border-blue-200 pb-2 mb-2">
                <span>कुल प्राप्त रकम (Total Received):</span>
                <span className="text-base text-blue-800 font-black">{formatCurrency(data.totalAmount)}</span>
              </div>
              <p className="text-xs text-slate-800 font-medium">
                <span className="font-bold text-slate-600">अक्षरमा: </span>
                <span className="italic font-bold text-slate-900">{data.amountInWords}</span>
              </p>
              {data.remarks && (
                <p className="text-[11px] text-slate-500 mt-1">
                  <span className="font-semibold">कैफियत:</span> {data.remarks}
                </p>
              )}
            </div>

            {/* Footer Signatures */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-center">
              <div>
                <div className="h-10 border-b border-slate-400 border-dashed mx-6"></div>
                <p className="font-semibold text-slate-700 mt-1">बुझाउनेको दस्तखत</p>
              </div>
              <div>
                <div className="h-10 border-b border-slate-400 border-dashed mx-6"></div>
                <p className="font-bold text-slate-900 mt-1">
                  {data.collectedBy || settings.authorizedPerson}
                </p>
                <p className="text-[10px] text-slate-500">बुझिलिने अधिकृत / खजाञ्ची</p>
              </div>
            </div>

            <div className="text-center mt-6 text-[10px] text-slate-400">
              * कम्प्युटर बिलिङ प्रणालीबाट प्रमाणित रसिद *
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
