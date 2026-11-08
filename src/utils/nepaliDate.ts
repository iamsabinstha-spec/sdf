export const NEPALI_MONTHS = [
  'बैशाख',
  'जेठ',
  'असार',
  'साउन',
  'भदौ',
  'असोज',
  'कार्तिक',
  'मंसिर',
  'पुस',
  'माघ',
  'फागुन',
  'चैत',
];

export const NEPALI_DIGITS: Record<string, string> = {
  '0': '०',
  '1': '१',
  '2': '२',
  '3': '३',
  '4': '४',
  '5': '५',
  '6': '६',
  '7': '७',
  '8': '८',
  '9': '९',
};

export const ENGLISH_DIGITS: Record<string, string> = {
  '०': '0',
  '१': '1',
  '२': '2',
  '३': '3',
  '४': '4',
  '५': '5',
  '६': '6',
  '७': '7',
  '८': '8',
  '९': '9',
};

export function toNepaliDigits(input: string | number): string {
  if (input === null || input === undefined) return '';
  const str = input.toString();
  return str.replace(/[0-9]/g, (match) => NEPALI_DIGITS[match] || match);
}

export function toEnglishDigits(input: string): string {
  if (!input) return '';
  return input.replace(/[०-९]/g, (match) => ENGLISH_DIGITS[match] || match);
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return 'रू ०.००';
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `रू ${toNepaliDigits(formatted)}`;
}

// Number to Nepali Words converter (रकम अक्षरमा)
const ONES = [
  '',
  'एक',
  'दुई',
  'तीन',
  'चार',
  'पाँच',
  'छ',
  'सात',
  'आठ',
  'नौ',
  'दश',
  'एघार',
  'बाह्र',
  'तेह्र',
  'चौध',
  'पन्ध्र',
  'सोह्र',
  'सत्र',
  'अठार',
  'उन्नाइस',
  'बीस',
  'एक्काइस',
  'बाइस',
  'तेइस',
  'चौबीस',
  'पच्चीस',
  'छब्बीस',
  'सत्ताइस',
  'अठ्ठाइस',
  'उनन्तीस',
  'तीस',
  'एकतीस',
  'बत्तीस',
  'तेत्तीस',
  'चौँतीस',
  'पैँतीस',
  'छत्तीस',
  'सैँतीस',
  'अठतीस',
  'उनन्चालीस',
  'चालीस',
  'एकचालीस',
  'बयालीस',
  'त्रिचालीस',
  'चवालीस',
  'पैँतालीस',
  'छयालीस',
  'सतचालीस',
  'अठचालीस',
  'उनन्पचास',
  'पचास',
  'एकाउन्न',
  'बाउन्न',
  'त्रिपन्न',
  'चउन्न',
  'पचपन्न',
  'छपन्न',
  'सन्ताउन्न',
  'अन्ठाउन्न',
  'उनन्साठी',
  'साठी',
  'एकसट्ठी',
  'बासट्ठी',
  'त्रिचसट्ठी',
  'चौंसट्ठी',
  'पैंसट्ठी',
  'छयसट्ठी',
  'सतसट्ठी',
  'अठसट्ठी',
  'उनन्सत्तरी',
  'सत्तरी',
  'एकहत्तर',
  'बहत्तर',
  'त्रिहत्तर',
  'चौहत्तर',
  'पचहत्तर',
  'छयहत्तर',
  'सतहत्तर',
  'अठहत्तर',
  'उनासी',
  'असी',
  'एकासी',
  'बयासी',
  'त्रियासी',
  'चौरासी',
  'पचासी',
  'छयासी',
  'सतासी',
  'अठासी',
  'उनान्नब्बे',
  'नब्बे',
  'एकानब्बे',
  'बयानब्बे',
  'त्रियानब्बे',
  'चौरानब्बे',
  'पन्चानब्बे',
  'छयानब्बे',
  'सन्तानब्बे',
  'अन्ठानब्बे',
  'उनान्सय',
];

export function numberToNepaliWords(num: number): string {
  if (num === 0) return 'शून्य रुपैयाँ मात्र';
  if (isNaN(num)) return '';

  let integerPart = Math.floor(Math.abs(num));
  const decimalPart = Math.round((Math.abs(num) - integerPart) * 100);

  let result = '';

  const crore = Math.floor(integerPart / 10000000);
  integerPart %= 10000000;

  const lakh = Math.floor(integerPart / 100000);
  integerPart %= 100000;

  const thousand = Math.floor(integerPart / 1000);
  integerPart %= 1000;

  const hundred = Math.floor(integerPart / 100);
  const remainder = integerPart % 100;

  if (crore > 0) {
    result += (ONES[crore] || crore.toString()) + ' करोड ';
  }
  if (lakh > 0) {
    result += (ONES[lakh] || lakh.toString()) + ' लाख ';
  }
  if (thousand > 0) {
    result += (ONES[thousand] || thousand.toString()) + ' हजार ';
  }
  if (hundred > 0) {
    result += (ONES[hundred] || hundred.toString()) + ' सय ';
  }
  if (remainder > 0) {
    result += ONES[remainder] + ' ';
  }

  result = result.trim() + ' रुपैयाँ';

  if (decimalPart > 0) {
    result += ' ' + (ONES[decimalPart] || decimalPart.toString()) + ' पैसा';
  }

  return result + ' मात्र';
}

/**
 * Parses BS date in form "2081/07/22" or "२०८१/०७/२२" or "2081-07-22"
 * Returns numeric [year, month, day]
 */
export function parseBSDate(dateStr: string): [number, number, number] {
  if (!dateStr) return [2081, 7, 22];
  const normalized = toEnglishDigits(dateStr).replace(/[-.]/g, '/');
  const parts = normalized.split('/').map((p) => parseInt(p, 10));
  return [parts[0] || 2081, parts[1] || 1, parts[2] || 1];
}

/**
 * Compare two BS dates: returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareBSDates(date1: string, date2: string): number {
  const [y1, m1, d1] = parseBSDate(date1);
  const [y2, m2, d2] = parseBSDate(date2);

  if (y1 !== y2) return y1 < y2 ? -1 : 1;
  if (m1 !== m2) return m1 < m2 ? -1 : 1;
  if (d1 !== d2) return d1 < d2 ? -1 : 1;
  return 0;
}

/**
 * Check if a loan is overdue based on current system date and due date
 */
export function isLoanOverdue(currentSystemDateBS: string, dueDateBS: string): boolean {
  if (!dueDateBS) return false;
  return compareBSDates(currentSystemDateBS, dueDateBS) > 0;
}

/**
 * Calculate approximate days difference between two BS dates
 */
export function getApproxBSDaysDiff(earlierDate: string, laterDate: string): number {
  const [y1, m1, d1] = parseBSDate(earlierDate);
  const [y2, m2, d2] = parseBSDate(laterDate);
  return (y2 - y1) * 365 + (m2 - m1) * 30 + (d2 - d1);
}

/**
 * Calculate Water Bill:
 * Base charge includes minimum units.
 * Units above that are billed at ratePerUnit.
 */
export function calculateWaterBill(
  previousReading: number,
  currentReading: number,
  minCharge: number = 110,
  minUnits: number = 10,
  perUnitRate: number = 22,
  graceDays: number = 15,
  penaltyPercent: number = 10,
  daysElapsed: number = 0
) {
  const consumedUnits = Math.max(0, currentReading - previousReading);
  const baseAmount = minCharge;
  const extraUnits = Math.max(0, consumedUnits - minUnits);
  const extraAmount = extraUnits * perUnitRate;
  const subtotal = baseAmount + extraAmount;

  let penaltyAmount = 0;
  if (daysElapsed > graceDays) {
    penaltyAmount = Math.round((subtotal * penaltyPercent) / 100);
  }

  const totalAmount = subtotal + penaltyAmount;

  return {
    consumedUnits,
    baseAmount,
    extraUnits,
    extraAmount,
    penaltyAmount,
    totalAmount,
  };
}
