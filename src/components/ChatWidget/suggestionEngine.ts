import type { ChatMessage } from "@/services/chatApi";

export type SuggestionContext =
  | "welcome"
  | "general"
  | "pricing"
  | "app"
  | "menu";

const SUGGESTION_SETS: Record<SuggestionContext, string[]> = {
  welcome: ["الأسعار", "QR Menu", "ابدأ بسرعة"],
  general: ["الأسعار", "QR Menu", "ابدأ بسرعة"],
  pricing: ["تجربة مجانية", "ابدأ بسرعة", "QR Menu"],
  app: ["Android", "QR Menu", "الأسعار"],
  menu: ["QR Menu", "التصميم", "الأسعار"],
};

const CONTEXT_KEYWORDS: Record<Exclude<SuggestionContext, "welcome" | "general">, string[]> = {
  pricing: [
    "سعر",
    "أسعار",
    "باق",
    "باقات",
    "pricing",
    "plan",
    "مجان",
    "trial",
    "اشتراك",
    "خطة",
    "تكلف",
  ],
  app: [
    "تطبيق",
    "android",
    "ios",
    "app",
    "منتج",
    "منتجات",
    "موبايل",
    "mobile",
    "هاتف",
    "store",
  ],
  menu: [
    "منيو",
    "قائمة",
    "menu",
    "qr",
    "تصميم",
    "قالب",
    "template",
  ],
};

function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

function detectContext(messages: ChatMessage[]): SuggestionContext {
  if (messages.length <= 1) return "welcome";

  const recentText = normalizeText(
    messages
      .slice(-6)
      .map((m) => m.content)
      .join(" "),
  );

  let bestContext: SuggestionContext = "general";
  let bestScore = 0;

  for (const [context, keywords] of Object.entries(CONTEXT_KEYWORDS) as [
    Exclude<SuggestionContext, "welcome" | "general">,
    string[],
  ][]) {
    const score = keywords.reduce(
      (acc, keyword) => acc + (recentText.includes(keyword) ? 1 : 0),
      0,
    );

    if (score > bestScore) {
      bestScore = score;
      bestContext = context;
    }
  }

  return bestScore > 0 ? bestContext : "general";
}

function filterUsedSuggestions(
  suggestions: string[],
  messages: ChatMessage[],
): string[] {
  const userMessages = new Set(
    messages
      .filter((m) => m.role === "user")
      .map((m) => normalizeText(m.content)),
  );

  return suggestions.filter((s) => !userMessages.has(normalizeText(s)));
}

function uniqueSuggestions(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const key = normalizeText(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

export function getChatSuggestions(messages: ChatMessage[]): string[] {
  const context = detectContext(messages);
  const primary = uniqueSuggestions(
    filterUsedSuggestions(SUGGESTION_SETS[context], messages),
  );

  if (primary.length >= 3) return primary.slice(0, 3);

  const fallback = uniqueSuggestions(
    filterUsedSuggestions(SUGGESTION_SETS.general, messages),
  );

  return uniqueSuggestions([...primary, ...fallback]).slice(0, 3);
}
