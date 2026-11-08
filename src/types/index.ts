export interface OrganizationSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  regNo: string;
  panNo: string;
  authorizedPerson: string;
  designation: string;
  logoPreset: string;
  customLogoUrl?: string;
  currentSystemDateBS: string; // e.g. "२०८१/०७/२२"
  managerMobileForAlerts: string;
  minimumCharge: number; // न्यूनतम रकम
  minimumUnitsIncluded: number; // न्यूनतम युनिट (default 10)
  unitRateExceeding: number; // न्यूनतमभन्दा बढी अतिरिक्त दर प्रति युनिट
  penaltyGraceDays: number; // रिडिङ भएपछि कति दिनमा जरिवाना लाग्ने
  penaltyPercent: number; // कति पर्सेन्ट जरिवाना लाग्ने
  tariffRateHistory: TariffHistoryItem[];
  loanInterestRateHistory: LoanRateHistoryItem[];
  tankerWaterRateHistory: TankerRateHistoryItem[];
}

export interface TariffHistoryItem {
  id: string;
  fromDate: string;
  toDate: string;
  minCharge: number;
  minUnits: number;
  perUnitRate: number;
  penaltyGraceDays: number;
  penaltyPercent: number;
  decisionNo: string;
  remarks: string;
}

export interface LoanRateHistoryItem {
  id: string;
  fromDate: string;
  toDate: string;
  annualInterestRate: number; // e.g. 12%
  penaltyRate: number; // e.g. 2%
  decisionNo: string;
  remarks: string;
}

export interface TankerRateHistoryItem {
  id: string;
  personOrCategory: string; // e.g. 'सर्वसाधारण', 'होटल तथा उद्योग', 'निर्माण कार्य'
  fromDate: string;
  toDate: string;
  ratePerLiter: number; // e.g. 0.40 (Rs 400 per 1000L)
  driverWagePerLiter: number; // e.g. 0.08 (Rs 80 per 1000L)
  remarks: string;
}

export interface Customer {
  id: string; // e.g. KP-001
  name: string;
  fatherName: string;
  grandfatherName: string;
  dobBS: string;
  phone: string;
  address: string;
  citizenshipNo: string;
  citizenshipIssueDateBS: string;
  landKittaNo: string;
  meterNo: string;
  registeredDateBS: string;
  status: 'सक्रिय' | 'निष्क्रिय';
  previousReading: number;
}

export interface UnitReading {
  id: string;
  monthBS: string; // e.g. "२०८१-कार्तिक"
  entryDateBS: string;
  customerId: string;
  customerName: string;
  phone: string;
  meterNo: string;
  previousReading: number;
  currentReading: number;
  consumedUnits: number;
  baseAmount: number;
  extraAmount: number;
  penaltyAmount: number;
  totalAmount: number;
  paymentStatus: 'बाँकी' | 'चुक्ता';
  paidReceiptNo?: string;
  paidDateBS?: string;
  remarks?: string;
}

export interface PaymentReceipt {
  id: string;
  receiptNo: string;
  customerId: string;
  customerName: string;
  readingId?: string;
  dateBS: string;
  monthBS?: string;
  baseUnits?: number;
  amount: number;
  amountInWords: string;
  paymentMethod: 'नगद' | 'बैंक' | 'eSewa/Fonepay' | 'अन्य';
  remarks: string;
  collectedBy: string;
}

export interface LoanInvestment {
  id: string;
  loanNo: string;
  customerId: string;
  customerName: string;
  phone: string;
  principalAmount: number;
  interestRate: number; // Annual %
  startDateBS: string;
  dueDateBS: string; // भाखा म्याद
  durationMonths: number;
  purpose: string;
  status: 'सक्रिय' | 'भाखा नाघेको' | 'चुक्ता';
  totalPaidPrincipal: number;
  totalPaidInterest: number;
  remainingPrincipal: number;
  accruedInterest: number;
}

export interface LoanInstallment {
  id: string;
  receiptNo: string;
  loanId: string;
  loanNo: string;
  customerId: string;
  customerName: string;
  dateBS: string;
  principalPaid: number;
  interestPaid: number;
  penaltyPaid: number;
  totalPaid: number;
  amountInWords: string;
  paymentMethod: string;
  collectedBy: string;
  remarks?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNo: string;
  branch: string;
  accountType: 'चल्ती' | 'बचत' | 'मुद्दती';
  balance: number;
}

export interface BankTransaction {
  id: string;
  bankId: string;
  bankName: string;
  dateBS: string;
  type: 'डिपोजिट' | 'विथड्र';
  amount: number;
  voucherNo: string;
  depositedOrWithdrawnBy: string;
  remarks: string;
  balanceAfter: number;
}

export interface IncomeRecord {
  id: string;
  receiptNo: string;
  dateBS: string;
  category: 'मर्मत आम्दानी' | 'नयाँ धारा सेवा शुल्क' | 'अनुदान' | 'कसैले दिएको सहयोग' | 'अन्य आम्दानी' | string;
  payerName: string;
  phone?: string;
  amount: number;
  amountInWords: string;
  paymentMethod: string;
  remarks: string;
  collectedBy: string;
}

export interface ExpenseRecord {
  id: string;
  voucherNo: string;
  dateBS: string;
  category:
    | 'विद्युत महसुल'
    | 'मर्मत खर्च'
    | 'सामग्री खरिद'
    | 'लेखा परीक्षण शुल्क'
    | 'गाडीभाडा खर्च'
    | 'चिया खाना खाजा खर्च'
    | 'साधारण सभा खर्च'
    | 'प्रिन्ट खर्च'
    | 'रिचार्ज खर्च'
    | 'पेट्रोल खर्च'
    | 'मसलन्द तथा stationary खर्च'
    | 'अन्य खर्चहरू'
    | string;
  paidTo: string;
  amount: number;
  amountInWords: string;
  paymentMethod: string;
  approvedBy: string;
  remarks: string;
}

export interface StaffRecord {
  id: string;
  name: string;
  designation: string;
  phone: string;
  monthlySalary: number;
  joinDateBS: string;
  status: 'सक्रिय' | 'बिदा';
}

export interface StaffPayroll {
  id: string;
  staffId: string;
  staffName: string;
  monthBS: string;
  dateBS: string;
  salaryAmount: number;
  allowance: number; // सेवा सुविधा / भत्ता
  uniformAllowance: number; // पोशाक खर्च
  festivalAllowance: number; // चाडपर्व खर्च
  tankerWageEarned: number; // गाडीमा पानी बिक्री गरेको ज्याला
  totalPaid: number;
  amountInWords: string;
  remarks: string;
}

export interface TankerWaterSale {
  id: string;
  billNo: string;
  dateBS: string;
  monthBS: string;
  buyerName: string;
  phone: string;
  destination: string;
  litersSold: number;
  ratePerLiter: number;
  totalAmount: number;
  driverStaffId?: string;
  driverStaffName?: string;
  wagePerLiter: number;
  driverWageAmount: number;
  paymentStatus: 'चुक्ता' | 'बाँकी';
  paymentMethod: string;
  remarks: string;
}

export interface MasterAuditLog {
  id: string;
  dateBS: string;
  module: string;
  referenceNo: string;
  memberId?: string;
  memberName?: string;
  type: 'आम्दानी' | 'खर्च' | 'महसुल' | 'ऋण लगानी' | 'किस्ता असुली' | 'बैंक डिपोजिट' | 'बैंक विथड्र' | 'पानी बिक्री' | 'कर्मचारी भुक्तानी';
  debit: number; // खर्च / विथड्र / लगानी
  credit: number; // आम्दानी / महसुल / असुली / डिपोजिट
  description: string;
}

export interface UserSession {
  username: string;
  fullName: string;
  role: 'व्यवस्थापक / Admin' | 'खजाञ्ची / Cashier' | 'मिटर रिडर';
  isLoggedIn: boolean;
}
