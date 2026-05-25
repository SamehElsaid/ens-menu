export const LENA_CTA_URLS = {
  register: "https://www.ensmenu.com/auth/register",
  pricing: "https://www.ensmenu.com/pricing",
  login: "https://www.ensmenu.com/auth/login",
  mobileApp: "https://www.ensmenu.com/mobile-app",
  contact: "https://www.ensmenu.com/contact",
} as const;

/** Official contact data — only these may appear in AI messages */
export const ALLOWED_CONTACT = {
  phones: ["+971586551491", "01500800050", "+201500800050", "971586551491"],
  emails: ["info@ensmenu.com"],
  whatsappUrl: "https://wa.me/201500800050",
} as const;

export const LENA_SYSTEM_HINTS = {
  tone: "neutral_arabic",
  maxLines: 3,
  noInventedData: true,
  noTutorials: true,
  ctaAsButtonsOnly: true,
  persona: "لينا — مساعدة Ensmenu الذكية، SaaS sales assistant",
} as const;
