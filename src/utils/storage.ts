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
} from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'khanepani_erp_settings_v1',
  CUSTOMERS: 'khanepani_erp_customers_v1',
  READINGS: 'khanepani_erp_readings_v1',
  RECEIPTS: 'khanepani_erp_receipts_v1',
  LOANS: 'khanepani_erp_loans_v1',
  INSTALLMENTS: 'khanepani_erp_installments_v1',
  BANKS: 'khanepani_erp_banks_v1',
  BANK_TXNS: 'khanepani_erp_bank_txns_v1',
  INCOMES: 'khanepani_erp_incomes_v1',
  EXPENSES: 'khanepani_erp_expenses_v1',
  STAFF: 'khanepani_erp_staff_v1',
  PAYROLLS: 'khanepani_erp_payrolls_v1',
  TANKER_SALES: 'khanepani_erp_tanker_sales_v1',
  AUDIT_LOGS: 'khanepani_erp_audit_logs_v1',
};

export const DEFAULT_SETTINGS: OrganizationSettings = {
  name: 'श्री जनचेतना खानेपानी तथा सरसफाइ उपभोक्ता संस्था / सहकारी',
  address: 'मेलम्ची नगरपालिका - ३, सिन्धुपाल्चोक',
  phone: '०११-४१०२३४, ९८५१२३४५६७',
  email: 'janachetanakhanepani@gmail.com',
  regNo: '०२-०७१/७२',
  panNo: '३०२९८४५२१',
  authorizedPerson: 'रामबहादुर श्रेष्ठ',
  designation: 'अध्यक्ष',
  logoPreset: 'droplet',
  customLogoUrl: '',
  currentSystemDateBS: '२०८१/०७/२२',
  managerMobileForAlerts: '९८५१२३४५६७',
  minimumCharge: 110,
  minimumUnitsIncluded: 10,
  unitRateExceeding: 22,
  penaltyGraceDays: 15,
  penaltyPercent: 10,
  tariffRateHistory: [
    {
      id: 'TR-1',
      fromDate: '२०८०/०१/०१',
      toDate: '२०८०/१२/३०',
      minCharge: 100,
      minUnits: 10,
      perUnitRate: 20,
      penaltyGraceDays: 15,
      penaltyPercent: 10,
      decisionNo: 'निर्णय नं. ४/०७९',
      remarks: 'आ.व. २०८०/८१ दर',
    },
    {
      id: 'TR-2',
      fromDate: '२०८१/०१/०१',
      toDate: '२०८१/१२/३०',
      minCharge: 110,
      minUnits: 10,
      perUnitRate: 22,
      penaltyGraceDays: 15,
      penaltyPercent: 10,
      decisionNo: 'निर्णय नं. २/०८०',
      remarks: 'आ.व. २०८१/८२ लागू दर',
    },
  ],
  loanInterestRateHistory: [
    {
      id: 'LR-1',
      fromDate: '२०८०/०१/०१',
      toDate: '२०८०/१२/३०',
      annualInterestRate: 12.0,
      penaltyRate: 2.0,
      decisionNo: 'समिति निर्णय ३/०८०',
      remarks: 'सुरुवाती साधारण ऋण दर',
    },
    {
      id: 'LR-2',
      fromDate: '२०८१/०१/०१',
      toDate: '२०८१/१२/३०',
      annualInterestRate: 13.5,
      penaltyRate: 2.5,
      decisionNo: 'समिति निर्णय ६/०८१',
      remarks: 'साधारण सभाबाट अनुमोदित नयाँ ब्याजदर',
    },
  ],
  tankerWaterRateHistory: [
    {
      id: 'TWR-1',
      personOrCategory: 'सर्वसाधारण उपभोक्ता',
      fromDate: '२०८१/०१/०१',
      toDate: '२०८१/१२/३०',
      ratePerLiter: 0.35,
      driverWagePerLiter: 0.07,
      remarks: 'प्रति १००० लिटर रू ३५० (ज्याला रू ७०)',
    },
    {
      id: 'TWR-2',
      personOrCategory: 'होटल तथा व्यावसायिक फर्म',
      fromDate: '२०८१/०१/०१',
      toDate: '२०८१/१२/३०',
      ratePerLiter: 0.45,
      driverWagePerLiter: 0.09,
      remarks: 'व्यावसायिक ट्याङ्कर दर',
    },
    {
      id: 'TWR-3',
      personOrCategory: 'निर्माण कार्य तथा ठेकेदार',
      fromDate: '२०८१/०१/०१',
      toDate: '२०८१/१२/३०',
      ratePerLiter: 0.5,
      driverWagePerLiter: 0.1,
      remarks: 'कन्सट्रक्सन साइट आपूर्ति',
    },
  ],
};

export const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'KP-001',
    name: 'श्यामप्रसाद अधिकारी',
    fatherName: 'हरिप्रसाद अधिकारी',
    grandfatherName: 'कुलानन्द अधिकारी',
    dobBS: '२०३२/०४/१५',
    phone: '९८४१२३०००१',
    address: 'मेलम्ची-३, गैरीगाउँ',
    citizenshipNo: '२२-०१-७०-०१४२५',
    citizenshipIssueDateBS: '२०५०/०९/१०',
    landKittaNo: '४०५',
    meterNo: 'MTR-101',
    registeredDateBS: '२०७२/०२/०५',
    status: 'सक्रिय',
    previousReading: 142,
  },
  {
    id: 'KP-002',
    name: 'सीता माया तामाङ',
    fatherName: 'दोर्जे तामाङ',
    grandfatherName: 'पासाङ तामाङ',
    dobBS: '२०४०/०८/२०',
    phone: '९८५११२३४५६',
    address: 'मेलम्ची-३, डाँडागाउँ',
    citizenshipNo: '२२-०१-७१-०५४३२',
    citizenshipIssueDateBS: '२०५९/०३/१२',
    landKittaNo: '३१२',
    meterNo: 'MTR-102',
    registeredDateBS: '२०७२/०३/१०',
    status: 'सक्रिय',
    previousReading: 98,
  },
  {
    id: 'KP-003',
    name: 'कृष्णबहादुर थापा',
    fatherName: 'खड्गबहादुर थापा',
    grandfatherName: 'टेकबहादुर थापा',
    dobBS: '२०३६/११/०४',
    phone: '९८६००११२२३',
    address: 'मेलम्ची-३, धाराटोल',
    citizenshipNo: '२२-०१-६८-०९८११',
    citizenshipIssueDateBS: '२०५५/०६/२५',
    landKittaNo: '१२४',
    meterNo: 'MTR-103',
    registeredDateBS: '२०७३/०१/१५',
    status: 'सक्रिय',
    previousReading: 215,
  },
  {
    id: 'KP-004',
    name: 'राधिका श्रेष्ठ',
    fatherName: 'गोविन्द श्रेष्ठ',
    grandfatherName: 'महेन्द्र श्रेष्ठ',
    dobBS: '२०४५/०१/२५',
    phone: '९८४९०८७६५४',
    address: 'मेलम्ची-३, बजारटोल',
    citizenshipNo: '२२-०१-७५-०३२१४',
    citizenshipIssueDateBS: '२०६४/०५/१७',
    landKittaNo: '५८०',
    meterNo: 'MTR-104',
    registeredDateBS: '२०७४/०५/२०',
    status: 'सक्रिय',
    previousReading: 167,
  },
  {
    id: 'KP-005',
    name: 'सूर्यबहादुर दनुवार',
    fatherName: 'कालु दनुवार',
    grandfatherName: 'बले दनुवार',
    dobBS: '२०२८/०६/१०',
    phone: '९८१२३४९८७६',
    address: 'मेलम्ची-३, नदीकिनार',
    citizenshipNo: '२२-०१-६५-००१२३',
    citizenshipIssueDateBS: '२०४६/१०/०५',
    landKittaNo: '२१०',
    meterNo: 'MTR-105',
    registeredDateBS: '२०७५/०९/०१',
    status: 'सक्रिय',
    previousReading: 110,
  },
  {
    id: 'KP-006',
    name: 'कमला न्यौपाने',
    fatherName: 'दामोदर न्यौपाने',
    grandfatherName: 'पुरुषोत्तम न्यौपाने',
    dobBS: '२०४२/०३/१८',
    phone: '९८०८७६५४३२',
    address: 'मेलम्ची-३, पीपलडाँडा',
    citizenshipNo: '२२-०१-७२-०६५४१',
    citizenshipIssueDateBS: '२०६०/०१/२८',
    landKittaNo: '६७०',
    meterNo: 'MTR-106',
    registeredDateBS: '२०७६/११/१२',
    status: 'सक्रिय',
    previousReading: 76,
  },
];

export const DEFAULT_READINGS: UnitReading[] = [
  {
    id: 'UR-101',
    monthBS: '२०८१-कार्तिक',
    entryDateBS: '२०८१/०७/२२',
    customerId: 'KP-001',
    customerName: 'श्यामप्रसाद अधिकारी',
    phone: '९८४१२३०००१',
    meterNo: 'MTR-101',
    previousReading: 125,
    currentReading: 142,
    consumedUnits: 17,
    baseAmount: 110,
    extraAmount: 154,
    penaltyAmount: 0,
    totalAmount: 264,
    paymentStatus: 'चुक्ता',
    paidReceiptNo: 'REC-2081-0001',
    paidDateBS: '२०८१/०७/२२',
    remarks: 'नियमित खपत',
  },
  {
    id: 'UR-102',
    monthBS: '२०८१-कार्तिक',
    entryDateBS: '२०८१/०७/२२',
    customerId: 'KP-002',
    customerName: 'सीता माया तामाङ',
    phone: '९८५११२३४५६',
    meterNo: 'MTR-102',
    previousReading: 80,
    currentReading: 98,
    consumedUnits: 18,
    baseAmount: 110,
    extraAmount: 176,
    penaltyAmount: 0,
    totalAmount: 286,
    paymentStatus: 'बाँकी',
    remarks: 'रिडिङ सम्पन्न',
  },
  {
    id: 'UR-103',
    monthBS: '२०८१-कार्तिक',
    entryDateBS: '२०८१/०७/२२',
    customerId: 'KP-003',
    customerName: 'कृष्णबहादुर थापा',
    phone: '९८६००११२२३',
    meterNo: 'MTR-103',
    previousReading: 190,
    currentReading: 215,
    consumedUnits: 25,
    baseAmount: 110,
    extraAmount: 330,
    penaltyAmount: 0,
    totalAmount: 440,
    paymentStatus: 'बाँकी',
    remarks: 'रिडिङ सम्पन्न',
  },
];

export const DEFAULT_RECEIPTS: PaymentReceipt[] = [
  {
    id: 'RCP-1',
    receiptNo: 'REC-2081-0001',
    customerId: 'KP-001',
    customerName: 'श्यामप्रसाद अधिकारी',
    readingId: 'UR-101',
    dateBS: '२०८१/०७/२२',
    monthBS: '२०८१-कार्तिक',
    baseUnits: 17,
    amount: 264,
    amountInWords: 'दुई सय चौसट्ठी रुपैयाँ मात्र',
    paymentMethod: 'नगद',
    remarks: 'कार्तिक महिनाको महसुल भुक्तानी',
    collectedBy: 'रामबहादुर श्रेष्ठ',
  },
];

export const DEFAULT_LOANS: LoanInvestment[] = [
  {
    id: 'LOAN-01',
    loanNo: 'LN-2080-001',
    customerId: 'KP-003',
    customerName: 'कृष्णबहादुर थापा',
    phone: '९८६००११२२३',
    principalAmount: 150000,
    interestRate: 13.5,
    startDateBS: '२०८०/०७/०१',
    dueDateBS: '२०८१/०६/३०', // OVERDUE! Expired before current system date 2081/07/22
    durationMonths: 12,
    purpose: 'गाईपालन तथा कृषि व्यवसाय',
    status: 'भाखा नाघेको',
    totalPaidPrincipal: 50000,
    totalPaidInterest: 18000,
    remainingPrincipal: 100000,
    accruedInterest: 6750,
  },
  {
    id: 'LOAN-02',
    loanNo: 'LN-2081-002',
    customerId: 'KP-002',
    customerName: 'सीता माया तामाङ',
    phone: '९८५११२३४५६',
    principalAmount: 80000,
    interestRate: 13.5,
    startDateBS: '२०८१/०३/१५',
    dueDateBS: '२०८१/०९/१५', // Active
    durationMonths: 6,
    purpose: 'घर मर्मत तथा शौचालय निर्माण',
    status: 'सक्रिय',
    totalPaidPrincipal: 20000,
    totalPaidInterest: 4050,
    remainingPrincipal: 60000,
    accruedInterest: 2025,
  },
  {
    id: 'LOAN-03',
    loanNo: 'LN-2080-003',
    customerId: 'KP-005',
    customerName: 'सूर्यबहादुर दनुवार',
    phone: '९८१२३४९८७६',
    principalAmount: 60000,
    interestRate: 12.0,
    startDateBS: '२०८०/०५/१०',
    dueDateBS: '२०८१/०५/१०', // OVERDUE!
    durationMonths: 12,
    purpose: 'तरकारी खेती तथा पाइपलाइन',
    status: 'भाखा नाघेको',
    totalPaidPrincipal: 10000,
    totalPaidInterest: 6000,
    remainingPrincipal: 50000,
    accruedInterest: 4500,
  },
];

export const DEFAULT_INSTALLMENTS: LoanInstallment[] = [
  {
    id: 'INST-01',
    receiptNo: 'LREC-2081-001',
    loanId: 'LOAN-01',
    loanNo: 'LN-2080-001',
    customerId: 'KP-003',
    customerName: 'कृष्णबहादुर थापा',
    dateBS: '२०८१/०५/१५',
    principalPaid: 25000,
    interestPaid: 5000,
    penaltyPaid: 0,
    totalPaid: 30000,
    amountInWords: 'तीस हजार रुपैयाँ मात्र',
    paymentMethod: 'नगद',
    collectedBy: 'रामबहादुर श्रेष्ठ',
    remarks: 'दोस्रो किस्ता दाखिला',
  },
];

export const DEFAULT_BANKS: BankAccount[] = [
  {
    id: 'BNK-1',
    bankName: 'राष्ट्रिय वाणिज्य बैंक लि.',
    accountNo: '१२३००४५६७८९०१',
    branch: 'मेलम्ची शाखा',
    accountType: 'चल्ती',
    balance: 485600,
  },
  {
    id: 'BNK-2',
    bankName: 'कृषि विकास बैंक लि.',
    accountNo: '०२१०५०११२३४५६',
    branch: 'सिन्धुपाल्चोक शाखा',
    accountType: 'बचत',
    balance: 850250,
  },
  {
    id: 'BNK-3',
    bankName: 'प्रभु बैंक लि.',
    accountNo: '०८९०१२३४४५५६',
    branch: 'मेलम्ची बजार शाखा',
    accountType: 'चल्ती',
    balance: 215400,
  },
];

export const DEFAULT_BANK_TXNS: BankTransaction[] = [
  {
    id: 'BTX-01',
    bankId: 'BNK-1',
    bankName: 'राष्ट्रिय वाणिज्य बैंक लि.',
    dateBS: '२०८१/०७/१०',
    type: 'डिपोजिट',
    amount: 150000,
    voucherNo: 'VCH-RBB-9921',
    depositedOrWithdrawnBy: 'रामबहादुर श्रेष्ठ',
    remarks: 'अघिल्लो महिनाको महसुल संकलन रकम दाखिला',
    balanceAfter: 485600,
  },
  {
    id: 'BTX-02',
    bankId: 'BNK-2',
    bankName: 'कृषि विकास बैंक लि.',
    dateBS: '२०८१/०७/०५',
    type: 'विथड्र',
    amount: 50000,
    voucherNo: 'CHQ-ADBL-4412',
    depositedOrWithdrawnBy: 'हरिमाया खनाल (कर्मचारी)',
    remarks: 'पाइप तथा फिटिङ्स खरिद भुक्तानीको लागि चेक',
    balanceAfter: 850250,
  },
];

export const DEFAULT_INCOMES: IncomeRecord[] = [
  {
    id: 'INC-01',
    receiptNo: 'INC-2081-01',
    dateBS: '२०८१/०७/०२',
    category: 'नयाँ धारा सेवा शुल्क',
    payerName: 'दिलीप तामाङ',
    phone: '९८४१००१२३४',
    amount: 8500,
    amountInWords: 'आठ हजार पाँच सय रुपैयाँ मात्र',
    paymentMethod: 'नगद',
    remarks: 'नयाँ व्यक्तिगत धारा जडान शुल्क',
    collectedBy: 'रामबहादुर श्रेष्ठ',
  },
  {
    id: 'INC-02',
    receiptNo: 'INC-2081-02',
    dateBS: '२०८१/०७/०८',
    category: 'मर्मत आम्दानी',
    payerName: 'गैरीगाउँ टोल विकास समिति',
    phone: '९८५१२१२१२१',
    amount: 4500,
    amountInWords: 'चार हजार पाँच सय रुपैयाँ मात्र',
    paymentMethod: 'बैंक ट्रान्सफर',
    remarks: 'शाखा पाइप मर्मत शुल्क भुक्तानी',
    collectedBy: 'रामबहादुर श्रेष्ठ',
  },
  {
    id: 'INC-03',
    receiptNo: 'INC-2081-03',
    dateBS: '२०८१/०६/२५',
    category: 'अनुदान',
    payerName: 'मेलम्ची नगरपालिका वडा कार्यालय',
    amount: 150000,
    amountInWords: 'एक लाख पचास हजार रुपैयाँ मात्र',
    paymentMethod: 'चेक',
    remarks: 'ट्याङ्की सुरक्षा तारबार योजना अनुदान',
    collectedBy: 'रामबहादुर श्रेष्ठ',
  },
  {
    id: 'INC-04',
    receiptNo: 'INC-2081-04',
    dateBS: '२०८१/०७/१५',
    category: 'कसैले दिएको सहयोग',
    payerName: 'डा. सविन श्रेष्ठ (समाजसेवी)',
    amount: 25000,
    amountInWords: 'पच्चीस हजार रुपैयाँ मात्र',
    paymentMethod: 'eSewa/Fonepay',
    remarks: 'मुहान संरक्षण तथा वृक्षारोपण सहयोग',
    collectedBy: 'रामबहादुर श्रेष्ठ',
  },
];

export const DEFAULT_EXPENSES: ExpenseRecord[] = [
  {
    id: 'EXP-01',
    voucherNo: 'EXP-2081-01',
    dateBS: '२०८१/०७/०१',
    category: 'विद्युत महसुल',
    paidTo: 'नेपाल विद्युत प्राधिकरण, मेलम्ची वितरण केन्द्र',
    amount: 14200,
    amountInWords: 'चौध हजार दुई सय रुपैयाँ मात्र',
    paymentMethod: 'eSewa/Fonepay',
    approvedBy: 'रामबहादुर श्रेष्ठ',
    remarks: 'लिफ्टिङ पम्प मोटर विद्युत महसुल',
  },
  {
    id: 'EXP-02',
    voucherNo: 'EXP-2081-02',
    dateBS: '२०८१/०७/०४',
    category: 'सामग्री खरिद',
    paidTo: 'सिन्धु हार्डवेयर एण्ड सेनेटरी स्टोर',
    amount: 32500,
    amountInWords: 'बत्तीस हजार पाँच सय रुपैयाँ मात्र',
    paymentMethod: 'चेक',
    approvedBy: 'रामबहादुर श्रेष्ठ',
    remarks: '६३ मि.मि. एचडीपीई पाइप र गेट भल्भ खरिद',
  },
  {
    id: 'EXP-03',
    voucherNo: 'EXP-2081-03',
    dateBS: '२०८१/०७/१०',
    category: 'मर्मत खर्च',
    paidTo: 'श्याम प्लम्बिङ वर्कसप',
    amount: 5800,
    amountInWords: 'पाँच हजार आठ सय रुपैयाँ मात्र',
    paymentMethod: 'नगद',
    approvedBy: 'रामबहादुर श्रेष्ठ',
    remarks: 'मुख्य लाइन लिकेज मर्मत ज्याला',
  },
  {
    id: 'EXP-04',
    voucherNo: 'EXP-2081-04',
    dateBS: '२०८१/०७/१२',
    category: 'चिया खाना खाजा खर्च',
    paidTo: 'मेलम्ची होटल एण्ड क्याफे',
    amount: 2450,
    amountInWords: 'दुई हजार चार सय पचास रुपैयाँ मात्र',
    paymentMethod: 'नगद',
    approvedBy: 'रामबहादुर श्रेष्ठ',
    remarks: 'मासिक समिति बैठक चिया खाजा',
  },
  {
    id: 'EXP-05',
    voucherNo: 'EXP-2081-05',
    dateBS: '२०८१/०७/१४',
    category: 'मसलन्द तथा stationary खर्च',
    paidTo: 'पशुपति पुस्तक भण्डार',
    amount: 3800,
    amountInWords: 'तीन हजार आठ सय रुपैयाँ मात्र',
    paymentMethod: 'नगद',
    approvedBy: 'रामबहादुर श्रेष्ठ',
    remarks: 'रसिद प्याड, ए४ पेपर र फाइल खरिद',
  },
];

export const DEFAULT_STAFF: StaffRecord[] = [
  {
    id: 'STF-01',
    name: 'हरिप्रसाद दाहाल',
    designation: 'व्यवस्थापक / कार्यालय सचिव',
    phone: '९८४१५५६६७७',
    monthlySalary: 28000,
    joinDateBS: '२०७४/०१/०१',
    status: 'सक्रिय',
  },
  {
    id: 'STF-02',
    name: 'बिक्रम लामा',
    designation: 'ट्याङ्कर चालक / प्राविधिक',
    phone: '९८१२९९८८७७',
    monthlySalary: 22000,
    joinDateBS: '२०७६/०३/१५',
    status: 'सक्रिय',
  },
  {
    id: 'STF-03',
    name: 'दिलमाया श्रेष्ठ',
    designation: 'मिटर रिडर / सहायक',
    phone: '९८०३३४४५५६',
    monthlySalary: 16000,
    joinDateBS: '२०७८/०४/०१',
    status: 'सक्रिय',
  },
];

export const DEFAULT_PAYROLLS: StaffPayroll[] = [
  {
    id: 'PR-2081-01',
    staffId: 'STF-02',
    staffName: 'बिक्रम लामा',
    monthBS: '२०८१-असोज',
    dateBS: '२०८१/०६/३०',
    salaryAmount: 22000,
    allowance: 2500,
    uniformAllowance: 3000,
    festivalAllowance: 15000, // दशैं पेश्की/चाडपर्व खर्च
    tankerWageEarned: 4200, // गाडीमा पानी बिक्री गरे बापत पाएको ज्याला
    totalPaid: 46700,
    amountInWords: 'छयालीस हजार सात सय रुपैयाँ मात्र',
    remarks: 'असोज महिनाको तलब, दशैं भत्ता तथा पानी ढुवानी ज्याला',
  },
];

export const DEFAULT_TANKER_SALES: TankerWaterSale[] = [
  {
    id: 'TNK-01',
    billNo: 'TNK-2081-001',
    dateBS: '२०८१/०७/०५',
    monthBS: '२०८१-कार्तिक',
    buyerName: 'होटल हिमालयन भ्यू, मेलम्ची',
    phone: '९८५१००९९८८',
    destination: 'मेलम्ची बजार',
    litersSold: 10000,
    ratePerLiter: 0.45,
    totalAmount: 4500,
    driverStaffId: 'STF-02',
    driverStaffName: 'बिक्रम लामा',
    wagePerLiter: 0.09,
    driverWageAmount: 900,
    paymentStatus: 'चुक्ता',
    paymentMethod: 'नगद',
    remarks: '२ टिप पानी आपूर्ति',
  },
  {
    id: 'TNK-02',
    billNo: 'TNK-2081-002',
    dateBS: '२०८१/०७/१२',
    monthBS: '२०८१-कार्तिक',
    buyerName: 'राजेश श्रेष्ठ (घर निर्माण)',
    phone: '९८४९११२२३३',
    destination: 'गैरीगाउँ',
    litersSold: 5000,
    ratePerLiter: 0.35,
    totalAmount: 1750,
    driverStaffId: 'STF-02',
    driverStaffName: 'बिक्रम लामा',
    wagePerLiter: 0.07,
    driverWageAmount: 350,
    paymentStatus: 'चुक्ता',
    paymentMethod: 'eSewa/Fonepay',
    remarks: '१ टिप पानी आपूर्ति',
  },
];

export const DEFAULT_AUDIT_LOGS: MasterAuditLog[] = [
  {
    id: 'LOG-01',
    dateBS: '२०८१/०७/०१',
    module: 'खर्च',
    referenceNo: 'EXP-2081-01',
    type: 'खर्च',
    debit: 14200,
    credit: 0,
    description: 'नेपाल विद्युत प्राधिकरण - लिफ्टिङ पम्प विद्युत महसुल भुक्तानी',
  },
  {
    id: 'LOG-02',
    dateBS: '२०८१/०७/०२',
    module: 'आम्दानी',
    referenceNo: 'INC-2081-01',
    memberName: 'दिलीप तामाङ',
    type: 'आम्दानी',
    debit: 0,
    credit: 8500,
    description: 'नयाँ धारा सेवा शुल्क संकलन',
  },
  {
    id: 'LOG-03',
    dateBS: '२०८१/०७/०५',
    module: 'गाडी पानी बिक्री',
    referenceNo: 'TNK-2081-001',
    memberName: 'होटल हिमालयन भ्यू',
    type: 'पानी बिक्री',
    debit: 0,
    credit: 4500,
    description: '१०,००० लिटर ट्याङ्कर पानी बिक्री',
  },
  {
    id: 'LOG-04',
    dateBS: '२०८१/०७/२२',
    module: 'महसुल संकलन',
    referenceNo: 'REC-2081-0001',
    memberId: 'KP-001',
    memberName: 'श्यामप्रसाद अधिकारी',
    type: 'महसुल',
    debit: 0,
    credit: 264,
    description: 'कार्तिक महिनाको १७ युनिट खानेपानी महसुल चुक्ता',
  },
];

// Helper methods for LocalStorage persistence
export function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return defaultValue;
  }
}

export function saveStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

export function loadAllAppData() {
  return {
    settings: getStoredData<OrganizationSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
    customers: getStoredData<Customer[]>(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS),
    readings: getStoredData<UnitReading[]>(STORAGE_KEYS.READINGS, DEFAULT_READINGS),
    receipts: getStoredData<PaymentReceipt[]>(STORAGE_KEYS.RECEIPTS, DEFAULT_RECEIPTS),
    loans: getStoredData<LoanInvestment[]>(STORAGE_KEYS.LOANS, DEFAULT_LOANS),
    installments: getStoredData<LoanInstallment[]>(STORAGE_KEYS.INSTALLMENTS, DEFAULT_INSTALLMENTS),
    banks: getStoredData<BankAccount[]>(STORAGE_KEYS.BANKS, DEFAULT_BANKS),
    bankTransactions: getStoredData<BankTransaction[]>(STORAGE_KEYS.BANK_TXNS, DEFAULT_BANK_TXNS),
    incomes: getStoredData<IncomeRecord[]>(STORAGE_KEYS.INCOMES, DEFAULT_INCOMES),
    expenses: getStoredData<ExpenseRecord[]>(STORAGE_KEYS.EXPENSES, DEFAULT_EXPENSES),
    staff: getStoredData<StaffRecord[]>(STORAGE_KEYS.STAFF, DEFAULT_STAFF),
    payrolls: getStoredData<StaffPayroll[]>(STORAGE_KEYS.PAYROLLS, DEFAULT_PAYROLLS),
    tankerSales: getStoredData<TankerWaterSale[]>(STORAGE_KEYS.TANKER_SALES, DEFAULT_TANKER_SALES),
    auditLogs: getStoredData<MasterAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS),
  };
}

export function saveAllAppData(data: ReturnType<typeof loadAllAppData>) {
  saveStoredData(STORAGE_KEYS.SETTINGS, data.settings);
  saveStoredData(STORAGE_KEYS.CUSTOMERS, data.customers);
  saveStoredData(STORAGE_KEYS.READINGS, data.readings);
  saveStoredData(STORAGE_KEYS.RECEIPTS, data.receipts);
  saveStoredData(STORAGE_KEYS.LOANS, data.loans);
  saveStoredData(STORAGE_KEYS.INSTALLMENTS, data.installments);
  saveStoredData(STORAGE_KEYS.BANKS, data.banks);
  saveStoredData(STORAGE_KEYS.BANK_TXNS, data.bankTransactions);
  saveStoredData(STORAGE_KEYS.INCOMES, data.incomes);
  saveStoredData(STORAGE_KEYS.EXPENSES, data.expenses);
  saveStoredData(STORAGE_KEYS.STAFF, data.staff);
  saveStoredData(STORAGE_KEYS.PAYROLLS, data.payrolls);
  saveStoredData(STORAGE_KEYS.TANKER_SALES, data.tankerSales);
  saveStoredData(STORAGE_KEYS.AUDIT_LOGS, data.auditLogs);
}

export function exportFullBackup(): string {
  const allData = loadAllAppData();
  const exportPayload = {
    appName: 'Khanepani ERP (खानेपानी तथा सरसफाइ उपभोक्ता संस्था)',
    version: '1.0.0',
    exportedAtBS: allData.settings.currentSystemDateBS,
    exportedTimestamp: new Date().toISOString(),
    data: allData,
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function importFullBackup(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !parsed.data) return false;
    const { data } = parsed;
    if (data.settings) saveStoredData(STORAGE_KEYS.SETTINGS, data.settings);
    if (data.customers) saveStoredData(STORAGE_KEYS.CUSTOMERS, data.customers);
    if (data.readings) saveStoredData(STORAGE_KEYS.READINGS, data.readings);
    if (data.receipts) saveStoredData(STORAGE_KEYS.RECEIPTS, data.receipts);
    if (data.loans) saveStoredData(STORAGE_KEYS.LOANS, data.loans);
    if (data.installments) saveStoredData(STORAGE_KEYS.INSTALLMENTS, data.installments);
    if (data.banks) saveStoredData(STORAGE_KEYS.BANKS, data.banks);
    if (data.bankTransactions) saveStoredData(STORAGE_KEYS.BANK_TXNS, data.bankTransactions);
    if (data.incomes) saveStoredData(STORAGE_KEYS.INCOMES, data.incomes);
    if (data.expenses) saveStoredData(STORAGE_KEYS.EXPENSES, data.expenses);
    if (data.staff) saveStoredData(STORAGE_KEYS.STAFF, data.staff);
    if (data.payrolls) saveStoredData(STORAGE_KEYS.PAYROLLS, data.payrolls);
    if (data.tankerSales) saveStoredData(STORAGE_KEYS.TANKER_SALES, data.tankerSales);
    if (data.auditLogs) saveStoredData(STORAGE_KEYS.AUDIT_LOGS, data.auditLogs);
    return true;
  } catch (err) {
    console.error('Backup import error:', err);
    return false;
  }
}

export function resetToSampleData(): void {
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
  localStorage.removeItem(STORAGE_KEYS.READINGS);
  localStorage.removeItem(STORAGE_KEYS.RECEIPTS);
  localStorage.removeItem(STORAGE_KEYS.LOANS);
  localStorage.removeItem(STORAGE_KEYS.INSTALLMENTS);
  localStorage.removeItem(STORAGE_KEYS.BANKS);
  localStorage.removeItem(STORAGE_KEYS.BANK_TXNS);
  localStorage.removeItem(STORAGE_KEYS.INCOMES);
  localStorage.removeItem(STORAGE_KEYS.EXPENSES);
  localStorage.removeItem(STORAGE_KEYS.STAFF);
  localStorage.removeItem(STORAGE_KEYS.PAYROLLS);
  localStorage.removeItem(STORAGE_KEYS.TANKER_SALES);
  localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);

  // Initialize with defaults
  saveStoredData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  saveStoredData(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
  saveStoredData(STORAGE_KEYS.READINGS, DEFAULT_READINGS);
  saveStoredData(STORAGE_KEYS.RECEIPTS, DEFAULT_RECEIPTS);
  saveStoredData(STORAGE_KEYS.LOANS, DEFAULT_LOANS);
  saveStoredData(STORAGE_KEYS.INSTALLMENTS, DEFAULT_INSTALLMENTS);
  saveStoredData(STORAGE_KEYS.BANKS, DEFAULT_BANKS);
  saveStoredData(STORAGE_KEYS.BANK_TXNS, DEFAULT_BANK_TXNS);
  saveStoredData(STORAGE_KEYS.INCOMES, DEFAULT_INCOMES);
  saveStoredData(STORAGE_KEYS.EXPENSES, DEFAULT_EXPENSES);
  saveStoredData(STORAGE_KEYS.STAFF, DEFAULT_STAFF);
  saveStoredData(STORAGE_KEYS.PAYROLLS, DEFAULT_PAYROLLS);
  saveStoredData(STORAGE_KEYS.TANKER_SALES, DEFAULT_TANKER_SALES);
  saveStoredData(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);
}
