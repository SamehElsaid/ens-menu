"use client";

import {
  hasContactIntent,
  sanitizeAiMessage,
} from "@/lib/lena/sanitizeAiMessage";
import { LENA_CTA_URLS } from "@/lib/lena/assistantConfig";
import ChatCtaButton from "./ChatCtaButton";

type UrlLabelRule = {
  test: (path: string) => boolean;
  label: string;
  variant?: "primary" | "secondary";
};

type ExtractedCta = {
  href: string;
  label: string;
  variant: "primary" | "secondary";
};

const URL_LABEL_RULES: UrlLabelRule[] = [
  {
    test: (p) => /\/pricing/i.test(p),
    label: "👀 شوف الأسعار",
    variant: "primary",
  },
  {
    test: (p) => /\/auth\/register|\/register/i.test(p),
    label: "🚀 ابدأ مجانًا",
    variant: "primary",
  },
  {
    test: (p) => /\/auth\/login|\/login/i.test(p),
    label: "🔑 تسجيل الدخول",
    variant: "secondary",
  },
  {
    test: (p) => /\/mobile-app/i.test(p),
    label: "📱 التطبيق",
    variant: "primary",
  },
  {
    test: (p) => /\/contact/i.test(p),
    label: "📞 تواصل معنا",
    variant: "secondary",
  },
];

const KEYWORD_CTAS: {
  patterns: RegExp[];
  href: string;
  label: string;
  variant: "primary" | "secondary";
}[] = [
  {
    patterns: [/register|signup|sign-up|sign up|تسجيل|رابط التسجيل|ابدأ مجان/i],
    href: LENA_CTA_URLS.register,
    label: "🚀 ابدأ مجانًا",
    variant: "primary",
  },
  {
    patterns: [/pricing|prices|price|أسعار|باقات|الباقات|plans/i],
    href: LENA_CTA_URLS.pricing,
    label: "👀 شوف الأسعار",
    variant: "primary",
  },
  {
    patterns: [/contact|تواصل|اتصل|support|مساعدة/i],
    href: LENA_CTA_URLS.contact,
    label: "📞 تواصل معنا",
    variant: "secondary",
  },
  {
    patterns: [/mobile-app|android|ios|تطبيق|app store/i],
    href: LENA_CTA_URLS.mobileApp,
    label: "📱 التطبيق",
    variant: "primary",
  },
];

const PHRASE_LINKS = [
  {
    phrases: [
      "اضغط هنا للتسجيل ✨",
      "اضغط هنا للتسجيل",
      "اضغط هنا",
      "رابط التسجيل",
      "رابط التسجيل ✨",
      "الرابط",
      "اللينك",
      "رابط",
      "link",
      "signup",
      "register",
      "سجل الآن",
      "ابدأ التسجيل",
    ],
    href: LENA_CTA_URLS.register,
  },
  {
    phrases: [
      "شوف التفاصيل من هنا 👀",
      "شوف التفاصيل من هنا",
      "شوف من هنا 👀",
      "شوف من هنا",
      "شوف التطبيق",
      "للتفاصيل",
    ],
    href: LENA_CTA_URLS.mobileApp,
  },
  {
    phrases: [
      "شوف الأسعار من هنا 👀",
      "شوف الأسعار من هنا",
      "شوف الأسعار 👀",
      "شوف الأسعار",
      "اعرف الأسعار",
      "الباقات",
    ],
    href: LENA_CTA_URLS.pricing,
  },
  {
    phrases: ["افتح التطبيق 📱", "افتح التطبيق", "حمل التطبيق"],
    href: LENA_CTA_URLS.mobileApp,
  },
  {
    phrases: ["تواصل معنا", "اتصل بنا", "راسلنا"],
    href: LENA_CTA_URLS.contact,
  },
] as const;

const CTA_LINE_PATTERNS = [
  /اضغط هنا/i,
  /رابط\s*(?:التسجيل|ال)?/i,
  /(?:ال)?(?:لينك|رابط|link)/i,
  /signup|register/i,
  /شوف\s+(?:الأسعار|التفاصيل|من هنا)/i,
  /شوف\s+من\s+هنا/i,
  /من\s+هنا/i,
  /للتفاصيل/i,
  /سجل\s+الآن/i,
  /ابدأ\s+(?:التسجيل|مجان)/i,
  /حمّ?\s*ل\s+التطبيق/i,
  /افتح\s+التطبيق/i,
  /تواصل\s+معنا/i,
  /اتصل\s+بنا/i,
  /whatsapp|واتس/i,
  /^[\s👀🚀📱✨🔑📞📩🔗\-–—]+$/,
];

const URL_REGEX = /https?:\/\/[^\s]+|www\.[^\s]+/gi;

const ALL_PHRASES = PHRASE_LINKS.flatMap(({ phrases, href }) =>
  phrases.map((phrase) => ({ phrase, href })),
).sort((a, b) => b.phrase.length - a.phrase.length);

function normalizeHref(raw: string): string {
  const cleaned = raw.replace(/[.,;:!?)]+$/g, "");
  return cleaned.startsWith("www.") ? `https://${cleaned}` : cleaned;
}

function getPathname(href: string): string {
  try {
    return new URL(href).pathname;
  } catch {
    return href;
  }
}

function getMetaForUrl(href: string): Omit<ExtractedCta, "href"> {
  const path = getPathname(normalizeHref(href));
  const rule = URL_LABEL_RULES.find((r) => r.test(path));
  return {
    label: rule?.label ?? "🔗 اضغط هنا",
    variant: rule?.variant ?? "primary",
  };
}

function extractCtas(content: string): ExtractedCta[] {
  const map = new Map<string, ExtractedCta>();

  for (const match of content.matchAll(URL_REGEX)) {
    const href = normalizeHref(match[0]);
    map.set(href, { href, ...getMetaForUrl(href) });
  }

  for (const { phrase, href } of ALL_PHRASES) {
    if (content.toLowerCase().includes(phrase.toLowerCase())) {
      const normalized = normalizeHref(href);
      map.set(normalized, { href: normalized, ...getMetaForUrl(href) });
    }
  }

  for (const { patterns, href, label, variant } of KEYWORD_CTAS) {
    if (patterns.some((p) => p.test(content))) {
      const normalized = normalizeHref(href);
      map.set(normalized, { href: normalized, label, variant });
    }
  }

  if (hasContactIntent(content) && map.size === 0) {
    map.set(LENA_CTA_URLS.contact, {
      href: LENA_CTA_URLS.contact,
      label: "📞 تواصل معنا",
      variant: "secondary",
    });
  }

  return Array.from(map.values()).slice(0, 4);
}

function isCtaOnlyLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;
  return CTA_LINE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function stripPhrases(text: string): string {
  let result = text;
  for (const { phrase } of ALL_PHRASES) {
    const regex = new RegExp(
      phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi",
    );
    result = result.replace(regex, "");
  }
  return result;
}

function cleanMessageText(content: string, hasCtas: boolean): string {
  let text = content.replace(URL_REGEX, "");

  if (hasCtas) {
    text = stripPhrases(text);

    text = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !isCtaOnlyLine(line))
      .join("\n");
  }

  return text.replace(/\n{3,}/g, "\n\n").trim();
}

export function renderAiMessageContent(rawContent: string): React.ReactNode {
  const trimmed = rawContent?.trim();
  if (!trimmed) return null;

  const ctas = extractCtas(rawContent);
  const sanitized = sanitizeAiMessage(rawContent, { fullMessage: true });
  let text = cleanMessageText(sanitized, ctas.length > 0);

  if (!text) {
    text = sanitized.trim() || trimmed;
  }

  return (
    <div dir="auto" className="flex flex-col items-stretch gap-2.5">
      {text && (
        <p className="m-0 whitespace-pre-wrap break-words leading-[1.7] tracking-normal">
          {text}
        </p>
      )}

      {ctas.length > 0 && (
        <div
          className={`flex w-full flex-col items-center gap-2.5 ${text ? "mt-2" : ""}`}
        >
          {ctas.map((cta) => (
            <ChatCtaButton
              key={cta.href}
              href={cta.href}
              label={cta.label}
              variant={cta.variant}
            />
          ))}
        </div>
      )}
    </div>
  );
}
