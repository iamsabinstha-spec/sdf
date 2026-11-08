import React, { useState } from 'react';
import {
  Calendar,
  BellRing,
  Droplets,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  Menu,
  Check,
  Smartphone,
  Layers,
  Globe,
  Share2,
  Copy,
  ExternalLink,
  X,
} from 'lucide-react';
import { OrganizationSettings, UserSession, LoanInvestment } from '../types';
import { toNepaliDigits, isLoanOverdue } from '../utils/nepaliDate';
import { SyncStatus } from '../utils/cloudSync';

interface Props {
  settings: OrganizationSettings;
  onUpdateSystemDate: (newDateBS: string) => void;
  currentSession: UserSession;
  onOpenLogin: () => void;
  onLogout: () => void;
  loans: LoanInvestment[];
  onOpenLoanAlerts: () => void;
  onToggleSidebarMobile: () => void;
  syncStatus?: SyncStatus;
  lastSyncTime?: string;
}

export const Navbar: React.FC<Props> = ({
  settings,
  onUpdateSystemDate,
  currentSession,
  onOpenLogin,
  onLogout,
  loans,
  onOpenLoanAlerts,
  onToggleSidebarMobile,
  syncStatus = 'connected',
  lastSyncTime = '',
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tempDate, setTempDate] = useState(settings.currentSystemDateBS);

  // Check how many loans are overdue
  const overdueCount = loans.filter((l) =>
    l.status === 'भाखा नाघेको' ||
    (l.status === 'सक्रिय' && isLoanOverdue(settings.currentSystemDateBS, l.dueDateBS))
  ).length;

  const handleSaveDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempDate.trim()) {
      onUpdateSystemDate(tempDate.trim());
      setShowDatePicker(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Toggle & Committee Branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebarMobile}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-cyan-500 text-white shadow-md shadow-blue-500/20">
            <Droplets className="h-6 w-6" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-extrabold text-slate-900 leading-tight line-clamp-1">
              {settings.name}
            </h1>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
              <span>{settings.address}</span>
              <span>•</span>
              <span className="text-blue-600">दर्ता नं: {toNepaliDigits(settings.regNo)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Current System Date BS Button & Quick Editor Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setTempDate(settings.currentSystemDateBS);
              setShowDatePicker(!showDatePicker);
            }}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition shadow-2xs"
            title="सफ्टवेयरको चलिरहेको मिति हेर्ने / फेर्ने अप्सन"
          >
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="hidden md:inline text-slate-500 font-normal">चलिरहेको मिति:</span>
            <span className="text-blue-700 font-extrabold">{settings.currentSystemDateBS}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showDatePicker && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white p-4 shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-900">
                  सफ्टवेयर प्रणाली मिति परिवर्तन
                </h4>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                यस मितिका आधारमा रिडिङ, जरिवाना तथा ऋणको म्याद हिसाब गरिन्छ।
              </p>
              <form onSubmit={handleSaveDate} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    नयाँ नेपाली मिति (BS - वर्ष/महिना/गते):
                  </label>
                  <input
                    type="text"
                    value={tempDate}
                    onChange={(e) => setTempDate(e.target.value)}
                    placeholder="२०८१/०७/२२"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>अपडेट गर्नुहोस्</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempDate('२०८१/०७/२२');
                    }}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    आज
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Live Online URL Button */}
        <button
          onClick={() => setShowLinkModal(true)}
          className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
          title="सफ्टवेयरको अनलाइन लिङ्क हेर्ने / कपी गर्ने"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="hidden sm:inline">लाइभ अनलाइन लिङ्क</span>
          <span className="sm:hidden">अनलाइन</span>
        </button>

        {/* Real-time Cloud Sync between Mobile & Computer Button */}
        <button
          onClick={() => setShowSyncModal(true)}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-2xs ${
            syncStatus === 'connected'
              ? 'border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100'
              : syncStatus === 'syncing'
              ? 'border-amber-300 bg-amber-50 text-amber-800 animate-pulse'
              : 'border-slate-300 bg-slate-50 text-slate-700'
          }`}
          title="मोबाइल र कम्प्युटर आपसमा रियल-टाइम जोडिएको स्थिति"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              syncStatus === 'connected'
                ? 'bg-blue-600 animate-pulse'
                : syncStatus === 'syncing'
                ? 'bg-amber-500'
                : 'bg-slate-400'
            }`}
          ></span>
          <span className="hidden md:inline">
            {syncStatus === 'syncing' ? 'सिङ्क हुँदै...' : 'मोबाइल ⇄ PC सिङ्क'}
          </span>
          <span className="md:hidden">सिङ्क</span>
        </button>

        {/* Loan Maturity & Overdue Alert Notification Bell */}
        <button
          onClick={onOpenLoanAlerts}
          className={`relative flex items-center gap-1.5 rounded-xl p-2 transition ${
            overdueCount > 0
              ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
              : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
          title="ऋणको म्याद सकिएको नोटिफिकेसन"
        >
          <BellRing className={`h-5 w-5 ${overdueCount > 0 ? 'text-rose-600 animate-pulse' : ''}`} />
          {overdueCount > 0 && (
            <span className="flex h-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[10px] font-black text-white">
              {toNepaliDigits(overdueCount)}
            </span>
          )}
          <span className="hidden xl:inline text-xs font-bold">
            {overdueCount > 0 ? 'ऋण म्याद अलर्ट' : 'सूचना'}
          </span>
        </button>

        {/* User Account / Role profile */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
          <div
            onClick={onOpenLogin}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs hover:bg-slate-50 cursor-pointer transition shadow-2xs"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
              <User className="h-4 w-4" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="font-bold text-slate-900 text-xs leading-none">
                {currentSession.fullName}
              </p>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                {currentSession.role}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenLogin}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
            title="प्रयोगकर्ता परिवर्तन / लगइन"
          >
            <LogIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Online Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl p-6 text-slate-900 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    सफ्टवेयर अनलाइन (Online) चलाउने र सेयर गर्ने तरिका
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    इन्टरनेटमा सित्तैमा आफ्नै लिङ्क बनाउने सजिलो उपाय
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLinkModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Note about 404 on ais-pre */}
            <div className="rounded-xl bg-amber-50 border border-amber-300 p-3 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-950">
                <span>⚠️</span>
                <span>'Page not found' किन देखियो?</span>
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Google AI Studio को सुरक्षा प्रणाली अनुसार तपाईंले माथिल्लो दायाँ छेउको <strong>"Share"</strong> वा <strong>"Publish"</strong> बटन नथिचुन्जेल अर्को ट्याबमा सिधै खोल्दा Cloud Run ले Page Not Found देखाउँछ।
              </p>
            </div>

            {/* Method 1: GitHub Pages Free Hosting */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-blue-700 flex items-center gap-1.5">
                  <span>🚀</span>
                  <span>विकल्प १: GitHub बाट आफ्नो नामको Free लिङ्क बनाउने</span>
                </span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                  १००% आजीवन नि:शुल्क
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                तपाईंको आफ्नै नि:शुल्क ठेगाना <code>https://&lt;Username&gt;.github.io/khanepani/</code> बनाउन:
              </p>
              <ol className="list-decimal list-inside text-xs text-slate-700 space-y-1 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                <li>सफ्टवेयरको <strong>'सपोर्ट तथा ब्याकअप'</strong> मेनुबाट <strong>.ZIP कोड डाउनलोड</strong> गर्नुहोस्।</li>
                <li><a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">github.com/new</a> मा गई नयाँ रिपोजिटोरी (khanepani) बनाउनुहोस्।</li>
                <li>अनजिप गरिएका सबै फाइलहरू त्यहाँ अपलोड गरी Commit गर्नुहोस्।</li>
                <li>Settings ➔ Pages मा गई Source मा <strong>GitHub Actions</strong> छान्नुहोस्। १ मिनेटमै लिङ्क खुल्छ!</li>
              </ol>
            </div>

            {/* Method 2: Share via AI Studio */}
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <span>⚡</span>
                <span>विकल्प २: AI Studio बाटै तुरुन्तै सेयर गर्ने</span>
              </p>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                यदि GitHub चलाउन झन्झट लाग्छ भने Google AI Studio स्क्रिनको माथिल्लो दायाँ भागमा रहेको <strong>"Share" (सेयर)</strong> बटन थिची <strong>"Anyone with link"</strong> छान्नुभयो भने तत्कालै सबैले खोल्न मिल्ने अनलाइन लिङ्क सक्रिय हुन्छ।
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowLinkModal(false)}
                className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-bold text-white hover:bg-slate-900"
              >
                बुझें, बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Sync Status Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-blue-100 p-2.5 text-blue-700">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    मोबाइल ⇄ कम्प्युटर रियल-टाइम सिङ्क (Cloud Sync)
                  </h3>
                  <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>क्लाउड डाटाबेस सक्रिय (Firebase Firestore)</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
              <p className="font-bold text-slate-900 text-sm">
                अब तपाईंले मोबाइलबाट गरेको काम कम्प्युटरमा स्वतः देखिन्छ!
              </p>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside leading-relaxed">
                <li>
                  <strong>मिटर रिडर</strong>ले फिल्डमा गएर मोबाइलबाट युनिट इन्ट्री गर्नासाथ कार्यालयको कम्प्युटरमा तत्कालै अपडेट हुन्छ।
                </li>
                <li>
                  <strong>खजाञ्ची वा व्यवस्थापक</strong>ले कम्प्युटरमा रसिद काट्दा वा खर्च लेख्दा मोबाइलमा तुरुन्तै देखिन्छ।
                </li>
                <li>
                  इन्टरनेट भएको जुनसुकै मोबाइल, ल्यापटप वा ट्याब्लेटमा एउटै संस्थाको डाटा १००% सुरक्षित रूपमा एकैसाथ चल्छ।
                </li>
              </ul>
            </div>

            {lastSyncTime && (
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900 flex justify-between items-center">
                <span className="font-medium text-slate-600">पछिल्लो सिङ्क समय:</span>
                <span className="font-bold text-blue-800">{lastSyncTime}</span>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowSyncModal(false)}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md"
              >
                बुझें, धन्यवाद
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
