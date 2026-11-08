import { toNepaliDigits } from './nepaliDate';

export interface WhatsAppMessagePayload {
  recipientName: string;
  phone: string;
  message: string;
}

/**
 * Normalizes Nepali phone number into 977XXXXXXXXXX
 */
export function formatWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return `977${digits}`;
  }
  if (digits.startsWith('977') && digits.length === 13) {
    return digits;
  }
  return digits;
}

/**
 * Builds standard WhatsApp Web / Mobile direct link
 */
export function buildWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = formatWhatsAppPhone(phone);
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

/**
 * Generate Water Bill Reading Notification Message
 */
export function createWaterBillWhatsAppMessage(
  orgName: string,
  customerName: string,
  meterNo: string,
  monthBS: string,
  previousReading: number,
  currentReading: number,
  consumedUnits: number,
  totalAmount: number,
  dueDateBS: string,
  contactPhone: string
): string {
  return `नमस्ते ${customerName} ज्यू,
${orgName} बाट तपाईंको खानेपानी मिटर रिडिङ विवरण:
- महिना: ${monthBS}
- मिटर नं: ${toNepaliDigits(meterNo)}
- साविक अङ्क: ${toNepaliDigits(previousReading)}
- हालको अङ्क: ${toNepaliDigits(currentReading)}
- खपत युनिट: ${toNepaliDigits(consumedUnits)} युनिट
- जम्मा तिर्नुपर्ने रकम: रू. ${toNepaliDigits(totalAmount)}
- भुक्तानी गर्ने अन्तिम मिति: ${dueDateBS}

(अन्तिम मितिभित्र भुक्तानी गरी जरिवानाबाट बच्नुहोला। सम्पर्क: ${contactPhone})`;
}

/**
 * Generate Loan Overdue / Maturity Alert Message for Borrower & Manager
 */
export function createLoanOverdueWhatsAppMessage(
  orgName: string,
  borrowerName: string,
  loanNo: string,
  principalRemaining: number,
  accruedInterest: number,
  dueDateBS: string,
  contactPhone: string,
  isManagerNotification: boolean = false
): string {
  if (isManagerNotification) {
    return `[ऋण म्याद सूचना - व्यवस्थापक]
${orgName}
ऋणीको नाम: ${borrowerName}
ऋण नं: ${loanNo}
बाँकी सावाँ: रू. ${toNepaliDigits(principalRemaining)}
ब्याज: रू. ${toNepaliDigits(accruedInterest)}
भाखा म्याद: ${dueDateBS}
स्थिति: भाखा म्याद सकिएको छ! तुरुन्त असुली ताकेता गर्नुहोस्।`;
  }

  return `आदरणीय ${borrowerName} ज्यू,
${orgName} बाट तपाईंले लिनुभएको ऋण (${loanNo}) को म्याद ${dueDateBS} मा समाप्त भएको छ।
- बाँकी सावाँ: रू. ${toNepaliDigits(principalRemaining)}
- ब्याज: रू. ${toNepaliDigits(accruedInterest)}
कृपया यथाशीघ्र संस्थाको कार्यालयमा सम्पर्क गरी किस्ता तथा ब्याज भुक्तानी गर्नुहुन अनुरोध गरिन्छ।
सम्पर्क: ${contactPhone}`;
}
