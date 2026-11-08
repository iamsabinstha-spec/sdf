import React, { useState, useEffect } from 'react';
import {
  OrganizationSettings,
  Customer,
  UnitReading,
  PaymentReceipt,
  LoanInvestment,
  LoanInstallment,
  BankAccount,
  BankTransaction,
  IncomeRecord,
  ExpenseRecord,
  StaffRecord,
  StaffPayroll,
  TankerWaterSale,
  MasterAuditLog,
  UserSession,
} from './types';
import {
  loadAllAppData,
  saveAllAppData,
  saveStoredData,
} from './utils/storage';
import { isLoanOverdue } from './utils/nepaliDate';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';
import { LoanAlertModal } from './components/LoanAlertModal';
import { ReceiptPrintModal, ReceiptData } from './components/ReceiptPrintModal';

// Views
import { DashboardView } from './views/DashboardView';
import { SettingsView } from './views/SettingsView';
import { UnitEntryView } from './views/UnitEntryView';
import { AmountEntryView } from './views/AmountEntryView';
import { KycView } from './views/KycView';
import { LoanView } from './views/LoanView';
import { BankView } from './views/BankView';
import { IncomeView } from './views/IncomeView';
import { ExpenseView } from './views/ExpenseView';
import { StaffView } from './views/StaffView';
import { TankerSalesView } from './views/TankerSalesView';
import { MeterSheetView } from './views/MeterSheetView';
import { ReportsView } from './views/ReportsView';
import { MasterDatabaseView } from './views/MasterDatabaseView';
import { SupportView } from './views/SupportView';

export default function App() {
  const [data, setData] = useState(loadAllAppData());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoanAlertModalOpen, setIsLoanAlertModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [activeReceiptData, setActiveReceiptData] = useState<ReceiptData | null>(null);

  // User Session
  const [session, setSession] = useState<UserSession>({
    username: 'admin',
    fullName: 'रामबहादुर श्रेष्ठ',
    role: 'व्यवस्थापक / Admin',
    isLoggedIn: true,
  });

  // Re-save to local storage whenever data changes
  useEffect(() => {
    saveAllAppData(data);
  }, [data]);

  const refreshFromStorage = () => {
    setData(loadAllAppData());
  };

  // Helper updates
  const handleUpdateSystemDate = (newDateBS: string) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        currentSystemDateBS: newDateBS,
      },
    }));
  };

  const handleSaveSettings = (newSettings: OrganizationSettings) => {
    setData((prev) => ({
      ...prev,
      settings: newSettings,
    }));
  };

  const handleSaveCustomers = (newCustomers: Customer[]) => {
    setData((prev) => ({
      ...prev,
      customers: newCustomers,
    }));
  };

  const handleSaveReadings = (newReadings: UnitReading[]) => {
    setData((prev) => ({
      ...prev,
      readings: newReadings,
    }));
  };

  const handleSaveReceipts = (newReceipts: PaymentReceipt[]) => {
    setData((prev) => ({
      ...prev,
      receipts: newReceipts,
    }));
  };

  const handleSaveLoans = (newLoans: LoanInvestment[]) => {
    setData((prev) => ({
      ...prev,
      loans: newLoans,
    }));
  };

  const handleSaveInstallments = (newInstallments: LoanInstallment[]) => {
    setData((prev) => ({
      ...prev,
      installments: newInstallments,
    }));
  };

  const handleSaveBanks = (newBanks: BankAccount[]) => {
    setData((prev) => ({
      ...prev,
      banks: newBanks,
    }));
  };

  const handleSaveBankTransactions = (newTxns: BankTransaction[]) => {
    setData((prev) => ({
      ...prev,
      bankTransactions: newTxns,
    }));
  };

  const handleSaveIncomes = (newIncomes: IncomeRecord[]) => {
    setData((prev) => ({
      ...prev,
      incomes: newIncomes,
    }));
  };

  const handleSaveExpenses = (newExpenses: ExpenseRecord[]) => {
    setData((prev) => ({
      ...prev,
      expenses: newExpenses,
    }));
  };

  const handleSaveStaff = (newStaff: StaffRecord[]) => {
    setData((prev) => ({
      ...prev,
      staff: newStaff,
    }));
  };

  const handleSavePayrolls = (newPayrolls: StaffPayroll[]) => {
    setData((prev) => ({
      ...prev,
      payrolls: newPayrolls,
    }));
  };

  const handleSaveTankerSales = (newSales: TankerWaterSale[]) => {
    setData((prev) => ({
      ...prev,
      tankerSales: newSales,
    }));
  };

  const handleAddAuditLog = (log: MasterAuditLog) => {
    setData((prev) => ({
      ...prev,
      auditLogs: [log, ...prev.auditLogs],
    }));
  };

  const handlePrintReceipt = (receipt: ReceiptData) => {
    setActiveReceiptData(receipt);
    setIsReceiptModalOpen(true);
  };

  // Calculate overdue loans count
  const overdueLoansCount = data.loans.filter(
    (l) =>
      l.status === 'भाखा नाघेको' ||
      (l.status === 'सक्रिय' && isLoanOverdue(data.settings.currentSystemDateBS, l.dueDateBS))
  ).length;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isSidebarMobileOpen}
        onCloseMobile={() => setIsSidebarMobileOpen(false)}
        overdueLoansCount={overdueLoansCount}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          settings={data.settings}
          onUpdateSystemDate={handleUpdateSystemDate}
          currentSession={session}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onLogout={() => {
            setSession({
              username: 'guest',
              fullName: 'अतिथि',
              role: 'मिटर रिडर',
              isLoggedIn: false,
            });
            setIsLoginModalOpen(true);
          }}
          loans={data.loans}
          onOpenLoanAlerts={() => setIsLoanAlertModalOpen(true)}
          onToggleSidebarMobile={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
        />

        {/* View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              settings={data.settings}
              customers={data.customers}
              readings={data.readings}
              receipts={data.receipts}
              loans={data.loans}
              banks={data.banks}
              incomes={data.incomes}
              expenses={data.expenses}
              tankerSales={data.tankerSales}
              setActiveTab={setActiveTab}
              onOpenLoanAlerts={() => setIsLoanAlertModalOpen(true)}
            />
          )}

          {activeTab === 'unit-entry' && (
            <UnitEntryView
              settings={data.settings}
              customers={data.customers}
              readings={data.readings}
              onSaveReadings={handleSaveReadings}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {activeTab === 'amount-entry' && (
            <AmountEntryView
              settings={data.settings}
              customers={data.customers}
              readings={data.readings}
              receipts={data.receipts}
              onSaveReceipts={handleSaveReceipts}
              onUpdateReadings={handleSaveReadings}
              onAddAuditLog={handleAddAuditLog}
              onPrintReceipt={handlePrintReceipt}
            />
          )}

          {activeTab === 'kyc' && (
            <KycView
              settings={data.settings}
              customers={data.customers}
              onSaveCustomers={handleSaveCustomers}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {activeTab === 'loan' && (
            <LoanView
              settings={data.settings}
              customers={data.customers}
              loans={data.loans}
              installments={data.installments}
              onSaveLoans={handleSaveLoans}
              onSaveInstallments={handleSaveInstallments}
              onAddAuditLog={handleAddAuditLog}
              onPrintReceipt={handlePrintReceipt}
              onOpenLoanAlerts={() => setIsLoanAlertModalOpen(true)}
            />
          )}

          {activeTab === 'bank' && (
            <BankView
              settings={data.settings}
              banks={data.banks}
              bankTransactions={data.bankTransactions}
              onSaveBanks={handleSaveBanks}
              onSaveTransactions={handleSaveBankTransactions}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {activeTab === 'income' && (
            <IncomeView
              settings={data.settings}
              incomes={data.incomes}
              onSaveIncomes={handleSaveIncomes}
              onAddAuditLog={handleAddAuditLog}
              onPrintReceipt={handlePrintReceipt}
            />
          )}

          {activeTab === 'expense' && (
            <ExpenseView
              settings={data.settings}
              expenses={data.expenses}
              onSaveExpenses={handleSaveExpenses}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {activeTab === 'staff' && (
            <StaffView
              settings={data.settings}
              staff={data.staff}
              payrolls={data.payrolls}
              tankerSales={data.tankerSales}
              onSaveStaff={handleSaveStaff}
              onSavePayrolls={handleSavePayrolls}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {activeTab === 'tanker' && (
            <TankerSalesView
              settings={data.settings}
              staff={data.staff}
              tankerSales={data.tankerSales}
              onSaveTankerSales={handleSaveTankerSales}
              onAddAuditLog={handleAddAuditLog}
              onPrintReceipt={handlePrintReceipt}
            />
          )}

          {activeTab === 'meter-sheet' && (
            <MeterSheetView
              settings={data.settings}
              customers={data.customers}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              settings={data.settings}
              customers={data.customers}
              readings={data.readings}
              receipts={data.receipts}
              loans={data.loans}
              installments={data.installments}
              banks={data.banks}
              incomes={data.incomes}
              expenses={data.expenses}
              tankerSales={data.tankerSales}
            />
          )}

          {activeTab === 'database' && (
            <MasterDatabaseView
              settings={data.settings}
              customers={data.customers}
              auditLogs={data.auditLogs}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={data.settings}
              onSaveSettings={handleSaveSettings}
            />
          )}

          {activeTab === 'support' && (
            <SupportView
              settings={data.settings}
              onRefreshData={refreshFromStorage}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentSession={session}
        onLogin={(s) => setSession(s)}
        settings={data.settings}
      />

      <LoanAlertModal
        isOpen={isLoanAlertModalOpen}
        onClose={() => setIsLoanAlertModalOpen(false)}
        loans={data.loans}
        settings={data.settings}
      />

      <ReceiptPrintModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setActiveReceiptData(null);
        }}
        data={activeReceiptData}
        settings={data.settings}
      />
    </div>
  );
}
