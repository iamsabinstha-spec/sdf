import React, { useState } from 'react';
import {
  BellRing,
  Smartphone,
  Send,
  X,
  AlertTriangle,
  Clock,
  PhoneCall,
  User,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import { LoanInvestment, OrganizationSettings } from '../types';
import {
  toNepaliDigits,
  formatCurrency,
  isLoanOverdue,
  getApproxBSDaysDiff,
} from '../utils/nepaliDate';
import {
  buildWhatsAppUrl,
  createLoanOverdueWhatsAppMessage,
} from '../utils/whatsapp';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  loans: LoanInvestment[];
  settings: OrganizationSettings;
}

export const LoanAlertModal: React.FC<Props> = ({
  isOpen,
  onClose,
  loans,
  settings,
}) => {
  const [sentToast, setSentToast] = useState<string>('');

  if (!isOpen) return null;

  // Filter overdue loans
  const overdueLoans = loans.filter((l) =>
    l.status === 'भाखा नाघेको' ||
    (l.status === 'सक्रिय' && isLoanOverdue(settings.currentSystemDateBS, l.dueDateBS))
  );

  const handleSendToManager = (loan: LoanInvestment) => {
    const text = createLoanOverdueWhatsAppMessage(
      settings.name,
      loan.customerName,
      loan.loanNo,
      loan.remainingPrincipal,
      loan.accruedInterest,
      loan.dueDateBS,
      settings.phone,
      true // manager alert
    );
    const url = buildWhatsAppUrl(settings.managerMobileForAlerts, text);
    window.open(url, '_blank');
    setSentToast(`व्यवस्थापकको मोबाइल (${settings.managerMobileForAlerts}) मा सूचना पठाइयो!`);
    setTimeout(() => setSentToast(''), 4000);
  };

  const handleSendToBorrower = (loan: LoanInvestment) => {
    const text = createLoanOverdueWhatsAppMessage(
      settings.name,
      loan.customerName,
      loan.loanNo,
      loan.remainingPrincipal,
      loan.accruedInterest,
      loan.dueDateBS,
      settings.phone,
      false // borrower alert
    );
    const url = buildWhatsAppUrl(loan.phone, text);
    window.open(url, '_blank');
    setSentToast(`ऋणी (${loan.customerName} - ${loan.phone}) लाई WhatsApp सूचना पठाइयो!`);
    setTimeout(() => setSentToast(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-rose-600 p-2.5 text-white shadow-md shadow-rose-500/20">
              <BellRing className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                ऋणको म्याद सकिएको / भाखा नाघेको मोबाइल नोटिफिकेसन
              </h3>
              <p className="text-xs text-rose-700">
                चलिरहेको मिति ({settings.currentSystemDateBS}) अनुसार भाखा नाघेका ऋणहरूको सूची
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Toast */}
        {sentToast && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{sentToast}</span>
          </div>
        )}

        {/* Manager Phone Box */}
        <div className="mx-6 mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs flex items-center justify-between text-amber-900">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-amber-600" />
            <span>
              <strong>व्यवस्थापकको अलर्ट मोबाइल नं: </strong>
              {toNepaliDigits(settings.managerMobileForAlerts)}
            </span>
          </div>
          <span className="text-[11px] text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full font-medium">
            (सेटिङबाट परिवर्तन गर्न सकिने)
          </span>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {overdueLoans.length === 0 ? (
            <div className="text-center py-10">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">
                कुनै पनि ऋणको भाखा नाघेको छैन!
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                सबै ऋण लगानीहरू नियमित छन् र तोकिएको समयसीमा भित्रै छन्।
              </p>
            </div>
          ) : (
            overdueLoans.map((loan) => {
              const daysDiff = getApproxBSDaysDiff(loan.dueDateBS, settings.currentSystemDateBS);
              return (
                <div
                  key={loan.id}
                  className="rounded-2xl border border-rose-200 bg-rose-50/30 p-4 hover:border-rose-300 transition"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-rose-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200">
                          {loan.loanNo}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {loan.customerName}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>प्रयोजन: {loan.purpose}</span>
                        <span>•</span>
                        <span>फोन: {toNepaliDigits(loan.phone)}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-2.5 py-1 text-white text-[11px] font-bold">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{toNepaliDigits(Math.max(1, daysDiff))} दिन भाखा नाघेको</span>
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div className="grid grid-cols-3 gap-3 my-3 text-xs bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 block text-[11px]">बाँकी सावाँ:</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {formatCurrency(loan.remainingPrincipal)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">सञ्चित ब्याज:</span>
                      <span className="font-bold text-amber-600 text-sm">
                        {formatCurrency(loan.accruedInterest)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">भाखा म्याद मिति:</span>
                      <span className="font-bold text-rose-600 text-sm">
                        {toNepaliDigits(loan.dueDateBS)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleSendToManager(loan)}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-900 shadow-xs transition"
                    >
                      <Smartphone className="h-3.5 w-3.5 text-cyan-400" />
                      <span>मेरो मोबाइलमा अलर्ट पठाउनुहोस्</span>
                    </button>

                    <button
                      onClick={() => handleSendToBorrower(loan)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs shadow-emerald-500/20 transition"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>ऋणीलाई WhatsApp ताकेता पठाउनुहोस्</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex justify-between items-center text-xs text-slate-500">
          <span>कुल भाखा नाघेको ऋण: {toNepaliDigits(overdueLoans.length)} वटा</span>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-100"
          >
            बन्द गर्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
};
