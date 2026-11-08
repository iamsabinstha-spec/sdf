import React from 'react';
import {
  LayoutDashboard,
  Gauge,
  Receipt,
  Users,
  HandCoins,
  Building2,
  TrendingUp,
  TrendingDown,
  UserCheck2,
  Truck,
  Printer,
  FileSpreadsheet,
  Database,
  Settings,
  LifeBuoy,
  X,
  Droplets,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'unit-entry'
  | 'amount-entry'
  | 'kyc'
  | 'loan'
  | 'bank'
  | 'income'
  | 'expense'
  | 'staff'
  | 'tanker'
  | 'meter-sheet'
  | 'reports'
  | 'database'
  | 'settings'
  | 'support';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  overdueLoansCount: number;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  onCloseMobile,
  overdueLoansCount,
}) => {
  const menuItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'ड्यासबोर्ड', icon: LayoutDashboard },
    { id: 'unit-entry', label: 'युनिट इन्ट्री', icon: Gauge },
    { id: 'amount-entry', label: 'अमाउन्ट इन्ट्री', icon: Receipt },
    { id: 'kyc', label: 'केवाइसी / ग्राहक', icon: Users },
    {
      id: 'loan',
      label: 'ऋण व्यवस्थापन',
      icon: HandCoins,
      badge: overdueLoansCount > 0 ? `${overdueLoansCount}` : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'bank', label: 'बैंक कारोबार', icon: Building2 },
    { id: 'income', label: 'आम्दानी', icon: TrendingUp },
    { id: 'expense', label: 'खर्च', icon: TrendingDown },
    { id: 'staff', label: 'कर्मचारी तथा ज्याला', icon: UserCheck2 },
    { id: 'tanker', label: 'गाडीमा पानी बिक्री', icon: Truck },
    { id: 'meter-sheet', label: 'रिडिङ सिट प्रिन्ट', icon: Printer },
    { id: 'reports', label: 'वित्तीय रिपोर्ट', icon: FileSpreadsheet },
    { id: 'database', label: 'मेन डाटाबेस', icon: Database },
    { id: 'settings', label: 'सेटिङ', icon: Settings },
    { id: 'support', label: 'सपोर्ट तथा ब्याकअप', icon: LifeBuoy },
  ];

  const handleSelect = (id: ActiveTab) => {
    setActiveTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white shadow-lg transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* App Title / Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight block">
                खानेपानी ERP
              </span>
              <span className="text-[10px] text-slate-500 font-semibold block">
                सहकारी तथा उपभोक्ता समिति
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Menu List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            मुख्य मेनु
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                      item.badgeColor || 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom System info */}
        <div className="border-t border-slate-200 p-4 bg-slate-50/70">
          <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>प्रणाली स्थिति:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                सक्रिय (Offline Ready)
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              संस्करण: 1.0.0 (नेपाली बिक्रम संवत्)
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
