import { ALLOWED_CONTACT } from "./assistantConfig";

const GENDER_NEUTRAL_REPLACEMENTS: [RegExp, string][] = [
  [/تقدري/g, "تقدر"],
  [/تحبي/g, "تحب"],
  [/تحبين/g, "تحب"],
  [/عايزة/g, "عايز"],
  [/ممكن تختاري/g, "ممكن تختار"],
  [/تسجلي/g, "تسجل"],
  [/تبدئي/g, "تبدأ"],
  [/تشوفي/g, "تشوف"],
  [/حابة/g, "حابب"],
  [/تقدرين/g, "تقدر"],
  [/تسألين/g, "تسأل"],
  [/عندكِ/g, "عندك"],
  [/معاكِ/g, "معاك"],
  [/لو حابة/g, "لو حابب"],
];

const PHONE_REGEX =
  /(?:\+?\d{1,4}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}(?:[\s-]?\d+)?/g;

const EMAIL_REGEX = /[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi;

const WHATSAPP_LINE_REGEX = /.*(whatsapp|واتس(?:اب)?|wa\.me).*/gi;

const NUMBERED_LIST_LINE = /^\s*\d+[\.\)\-:]\s*.+/;

const CTA_TEXT_LINE =
  /^(?:.*)(?:اضغط هنا|رابط التسجيل|رابط|اللينك|الرابط|link|signup|register|سجل الآن|من هنا|للتفاصيل)(?:.*)$/i;

function normalizeDigits(value: string): string {
  return value.replace(/[\s\-().]/g, "");
}

function isAllowedPhone(raw: string): boolean {
  const normalized = normalizeDigits(raw);
  return ALLOWED_CONTACT.phones.some(
    (p) => normalized.includes(normalizeDigits(p)) || normalizeDigits(p).includes(normalized),
  );
}

function isAllowedEmail(raw: string): boolean {
  return ALLOWED_CONTACT.emails.some(
    (e) => e.toLowerCase() === raw.toLowerCase().trim(),
  );
}

function toNeutralTone(text: string): string {
  let result = text;
  for (const [pattern, replacement] of GENDER_NEUTRAL_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function stripInventedContact(text: string): string {
  let result = text.replace(WHATSAPP_LINE_REGEX, "");

  result = result.replace(PHONE_REGEX, (match) =>
    isAllowedPhone(match) ? match : "",
  );

  result = result.replace(EMAIL_REGEX, (match) =>
    isAllowedEmail(match) ? match : "",
  );

  return result;
}

function stripTutorials(text: string): string {
  return text
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      if (NUMBERED_LIST_LINE.test(trimmed)) return false;
      if (/^[-•*]\s/.test(trimmed)) return false;
      if (/^الخطوة\s+\d+/i.test(trimmed)) return false;
      return true;
    })
    .join("\n");
}

function stripCtaLines(text: string): string {
  return text
    .split("\n")
    .filter((line) => !CTA_TEXT_LINE.test(line.trim()))
    .join("\n");
}

function limitLines(text: string, max = 3): string {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.slice(0, max).join("\n");
}

function collapseWhitespace(text: string): string {
  return text.replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim();
}

export function sanitizeAiMessage(
  raw: string,
  options?: { fullMessage?: boolean },
): string {
  let text = raw.trim();
  text = toNeutralTone(text);
  text = stripInventedContact(text);

  if (!options?.fullMessage) {
    text = stripTutorials(text);
    text = stripCtaLines(text);
    text = collapseWhitespace(text);
    text = limitLines(text, 3);
  } else {
    text = collapseWhitespace(text);
  }

  return text;
}

export function hasContactIntent(text: string): boolean {
  return /(whatsapp|واتس|واتساب|اتصل|تواصل|إيميل|email|phone|تليفون|رقم|contact)/i.test(
    text,
  );
}
