/**
 * فحص الرسائل عن محاولات مشاركة وسائل تواصل أو دفع خارج EYAZO (القسم 25).
 * يعمل فقط على السيرفر. الفحص متحفظ لتقليل الإيجابيات الكاذبة قدر الإمكان،
 * لكنه ليس مثاليًا 100% — أي مخالفة تُسجَّل لمراجعة Admin بدل الحجب الصامت فقط.
 */

const PHONE_REGEX = /(\+?\d[\s\-\.]?){8,}/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const URL_REGEX = /(https?:\/\/|www\.)[^\s]+/gi;
const KEYWORD_REGEX = /(whatsapp|واتساب|واتس اب|telegram|تليجرام|تيليجرام|instapay|فودافون كاش|vodafone cash)/gi;

export function detectExternalContactAttempt(content: string): {
  flagged: boolean;
  reason?: string;
} {
  if (PHONE_REGEX.test(content)) return { flagged: true, reason: "PHONE_NUMBER" };
  if (EMAIL_REGEX.test(content)) return { flagged: true, reason: "EMAIL" };
  if (URL_REGEX.test(content)) return { flagged: true, reason: "EXTERNAL_LINK" };
  if (KEYWORD_REGEX.test(content)) return { flagged: true, reason: "EXTERNAL_PLATFORM_KEYWORD" };
  return { flagged: false };
}

export const BLOCKED_MESSAGE_TEXT =
  "لحماية حقوقك، يُمنع مشاركة وسائل التواصل أو الدفع خارج EYAZO.";
