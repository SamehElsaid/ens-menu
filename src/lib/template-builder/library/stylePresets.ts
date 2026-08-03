/** Visual style presets for menu-bound sections */

export type CardStyleId =
  | "split"
  | "list"
  | "compact"
  | "overlay"
  | "cover"
  | "bordered"
  | "glass";

export type CategoryLayoutId =
  | "circles"
  | "pills"
  | "chips"
  | "underline"
  | "rail"
  | "squares"
  | "cards"
  | "soft"
  | "gradient"
  | "stacked"
  | "iconOnly"
  | "numbered"
  | "glass"
  | "imageStrip";

/** Ad layouts = image + text overlay compositions */
export type AdStyleId =
  | "promo"
  | "coverBottom"
  | "coverCenter"
  | "brandLeft"
  | "captionTop"
  | "poster"
  | "splitPanel"
  | "badge"
  | "glassCard"
  | "minimalStrip"
  | "dualLine"
  | "darkWash";

export type NavbarStyleId = "transparent" | "solid" | "blur" | "minimal";

export type HeroStyleId = "centered" | "left" | "banner";

export type FooterStyleId = "simple" | "stacked" | "bar";

/** Complete top-of-menu packs (navbar + logo + hero + optional cats) */
export type HeaderStyleId =
  | "floatingLogo"
  | "coffeeDark"
  | "exploreRail"
  | "brandBar"
  | "centeredClassic"
  | "fullBleed"
  | "asymmetric"
  | "neonGlow"
  | "softSheet"
  | "magazine"
  | "minimalTop"
  | "dualTone"
  | "waveSheet"
  | "stickyCompact"
  | "poster"
  | "elegantLine";

export type StylePreset<T extends string> = {
  id: T;
  label: string;
  labelAr: string;
  hint: string;
};

export const CARD_STYLE_PRESETS: StylePreset<CardStyleId>[] = [
  {
    id: "split",
    label: "Split",
    labelAr: "مقسوم",
    hint: "OneCard default — image + side panel",
  },
  {
    id: "list",
    label: "List",
    labelAr: "قائمة",
    hint: "Thumb left, text + price right",
  },
  {
    id: "compact",
    label: "Compact",
    labelAr: "مضغوط",
    hint: "Small grid, image on top",
  },
  {
    id: "overlay",
    label: "Overlay",
    labelAr: "تراكب",
    hint: "Full image with text over gradient",
  },
  {
    id: "cover",
    label: "Cover",
    labelAr: "غلاف",
    hint: "Tall photo, details below",
  },
  {
    id: "bordered",
    label: "Bordered",
    labelAr: "إطار",
    hint: "Clean border, light fill",
  },
  {
    id: "glass",
    label: "Glass",
    labelAr: "زجاجي",
    hint: "Frosted panel over soft tint",
  },
];

export const CATEGORY_LAYOUT_PRESETS: StylePreset<CategoryLayoutId>[] = [
  { id: "circles", label: "Circles", labelAr: "دوائر", hint: "Round image + label" },
  { id: "pills", label: "Pills", labelAr: "حبوب", hint: "Filled rounded labels" },
  { id: "chips", label: "Chips", labelAr: "رقائق", hint: "Outlined chips" },
  { id: "underline", label: "Tabs", labelAr: "تبويبات", hint: "Text + underline" },
  { id: "rail", label: "Rail", labelAr: "شريط", hint: "Scroll rail in soft bar" },
  { id: "squares", label: "Squares", labelAr: "مربعات", hint: "Rounded square icons" },
  { id: "cards", label: "Mini cards", labelAr: "كروت", hint: "Small image cards" },
  { id: "soft", label: "Soft", labelAr: "ناعم", hint: "Muted fill pills" },
  { id: "gradient", label: "Gradient", labelAr: "تدرج", hint: "Brand gradient pills" },
  { id: "stacked", label: "Stacked", labelAr: "قائمة", hint: "Vertical list rows" },
  { id: "iconOnly", label: "Icons", labelAr: "أيقونات", hint: "Circles only" },
  { id: "numbered", label: "Numbered", labelAr: "مرقّم", hint: "Index + name" },
  { id: "glass", label: "Glass", labelAr: "زجاجي", hint: "Frosted pills" },
  { id: "imageStrip", label: "Image strip", labelAr: "صور", hint: "Wide photo chips" },
];

export const CATEGORY_LAYOUT_DEFAULTS: Record<
  CategoryLayoutId,
  Partial<{ showAll: boolean; scroll: boolean }>
> = {
  circles: { showAll: true, scroll: false },
  pills: { showAll: true, scroll: true },
  chips: { showAll: true, scroll: true },
  underline: { showAll: true, scroll: true },
  rail: { showAll: true, scroll: true },
  squares: { showAll: true, scroll: true },
  cards: { showAll: false, scroll: true },
  soft: { showAll: true, scroll: true },
  gradient: { showAll: true, scroll: true },
  stacked: { showAll: true, scroll: false },
  iconOnly: { showAll: true, scroll: true },
  numbered: { showAll: true, scroll: false },
  glass: { showAll: true, scroll: true },
  imageStrip: { showAll: false, scroll: true },
};

export const AD_STYLE_PRESETS: StylePreset<AdStyleId>[] = [
  { id: "promo", label: "Full image", labelAr: "صورة كاملة", hint: "Photo fills the banner" },
  { id: "coverBottom", label: "Bottom text", labelAr: "كلام من تحت", hint: "Text bar over image bottom" },
  { id: "coverCenter", label: "Center text", labelAr: "كلام في الوسط", hint: "Title centered on image" },
  { id: "brandLeft", label: "Brand left", labelAr: "براند يسار", hint: "Logo + text on the left" },
  { id: "captionTop", label: "Top caption", labelAr: "تعليق علوي", hint: "Small caption top corner" },
  { id: "poster", label: "Poster", labelAr: "بوستر", hint: "Big stacked title on photo" },
  { id: "splitPanel", label: "Split panel", labelAr: "لوحة مقسومة", hint: "Image + solid text panel" },
  { id: "badge", label: "Badge", labelAr: "شارة", hint: "Pill badge on the photo" },
  { id: "glassCard", label: "Glass on photo", labelAr: "زجاج على الصورة", hint: "Frosted card over image" },
  { id: "minimalStrip", label: "Thin strip", labelAr: "شريط رفيع", hint: "Thin caption strip" },
  { id: "dualLine", label: "Dual line", labelAr: "سطرين", hint: "White + accent subtitle" },
  { id: "darkWash", label: "Dark wash", labelAr: "تظليل غامق", hint: "Dark gradient + text" },
];

const DEFAULT_AD_IMAGE = "/images/ads/ens-promo-banner.png";

export const AD_STYLE_DEFAULTS: Record<
  AdStyleId,
  Partial<{
    borderRadius: number;
    paddingY: number;
    image: string;
    label: string;
    title: string;
    subtitle: string;
  }>
> = {
  promo: {
    borderRadius: 18,
    image: DEFAULT_AD_IMAGE,
    title: "ENS",
    label: "ENS — Enterprise Network Solutions",
  },
  coverBottom: {
    borderRadius: 16,
    image: DEFAULT_AD_IMAGE,
    title: "ENS",
    subtitle: "Enterprise Network Solutions",
  },
  coverCenter: {
    borderRadius: 16,
    image: DEFAULT_AD_IMAGE,
    title: "ENS",
    subtitle: "Enterprise Network Solutions",
  },
  brandLeft: {
    borderRadius: 18,
    image: DEFAULT_AD_IMAGE,
    title: "ENS",
    subtitle: "ENTERPRISE NETWORK SOLUTIONS",
  },
  captionTop: {
    borderRadius: 14,
    image: DEFAULT_AD_IMAGE,
    title: "ENS Promo",
  },
  poster: {
    borderRadius: 16,
    image: DEFAULT_AD_IMAGE,
    title: "ENS",
    subtitle: "Network Solutions",
  },
  splitPanel: {
    borderRadius: 16,
    image: DEFAULT_AD_IMAGE,
    title: "ENS",
    subtitle: "Enterprise Network Solutions",
  },
  badge: {
    borderRadius: 16,
    image: DEFAULT_AD_IMAGE,
    title: "New offer",
  },
  glassCard: {
    borderRadius: 18,
    image: DEFAULT_AD_IMAGE,
    title: "ENS",
    subtitle: "Enterprise Network Solutions",
  },
  minimalStrip: {
    borderRadius: 12,
    image: DEFAULT_AD_IMAGE,
    title: "Sponsored · ENS",
  },
  dualLine: {
    borderRadius: 16,
    image: DEFAULT_AD_IMAGE,
    title: "ENS",
    subtitle: "ENS - Enterprise Network Solutions",
  },
  darkWash: {
    borderRadius: 16,
    image: DEFAULT_AD_IMAGE,
    title: "ENS",
    subtitle: "Enterprise Network Solutions",
  },
};

export const NAVBAR_STYLE_PRESETS: StylePreset<NavbarStyleId>[] = [
  { id: "transparent", label: "Transparent", labelAr: "شفاف", hint: "On gradient" },
  { id: "solid", label: "Solid", labelAr: "صلب", hint: "Filled bar" },
  { id: "blur", label: "Blur", labelAr: "ضبابي", hint: "Glass bar" },
  { id: "minimal", label: "Minimal", labelAr: "بسيط", hint: "Icons only feel" },
];

export const HERO_STYLE_PRESETS: StylePreset<HeroStyleId>[] = [
  { id: "centered", label: "Centered", labelAr: "وسط", hint: "Title center" },
  { id: "left", label: "Left", labelAr: "يسار", hint: "Start-aligned" },
  { id: "banner", label: "Banner", labelAr: "بانر", hint: "Filled block" },
];

export const FOOTER_STYLE_PRESETS: StylePreset<FooterStyleId>[] = [
  { id: "simple", label: "Simple", labelAr: "بسيط", hint: "Centered text" },
  { id: "stacked", label: "Stacked", labelAr: "متراص", hint: "More spacing" },
  { id: "bar", label: "Bar", labelAr: "شريط", hint: "Dark strip look" },
];

export const HEADER_STYLE_PRESETS: StylePreset<HeaderStyleId>[] = [
  {
    id: "floatingLogo",
    label: "Floating Logo",
    labelAr: "شعار عائم",
    hint: "OneCard — logo over rounded sheet",
  },
  {
    id: "coffeeDark",
    label: "Coffee Dark",
    labelAr: "قهوة داكن",
    hint: "Dark hero, brand in nav, star divider",
  },
  {
    id: "exploreRail",
    label: "Explore + Rail",
    labelAr: "استكشف + شريط",
    hint: "Top bar, CTA, horizontal categories",
  },
  {
    id: "brandBar",
    label: "Brand Bar",
    labelAr: "شريط العلامة",
    hint: "Logo + name in top bar",
  },
  {
    id: "centeredClassic",
    label: "Classic Center",
    labelAr: "كلاسيك وسط",
    hint: "Big centered title on soft wash",
  },
  {
    id: "fullBleed",
    label: "Full Bleed",
    labelAr: "ملء الشاشة",
    hint: "Tall gradient banner + title",
  },
  {
    id: "asymmetric",
    label: "Asymmetric",
    labelAr: "غير متماثل",
    hint: "Logo left, title right",
  },
  {
    id: "neonGlow",
    label: "Neon Glow",
    labelAr: "نيون",
    hint: "Dark with glowing accents",
  },
  {
    id: "softSheet",
    label: "Soft Sheet",
    labelAr: "ورقة ناعمة",
    hint: "Gentle radius, quiet header",
  },
  {
    id: "magazine",
    label: "Magazine",
    labelAr: "مجلة",
    hint: "Editorial title + thin rules",
  },
  {
    id: "minimalTop",
    label: "Minimal Top",
    labelAr: "بسيط علوي",
    hint: "Thin bar only, title in sheet",
  },
  {
    id: "dualTone",
    label: "Dual Tone",
    labelAr: "لونين",
    hint: "Split color diagonal feel",
  },
  {
    id: "waveSheet",
    label: "Wave Sheet",
    labelAr: "موجة",
    hint: "Deep curve into content",
  },
  {
    id: "stickyCompact",
    label: "Compact Bar",
    labelAr: "شريط مضغوط",
    hint: "Dense top with logo circle",
  },
  {
    id: "poster",
    label: "Poster",
    labelAr: "بوستر",
    hint: "Bold stacked typography",
  },
  {
    id: "elegantLine",
    label: "Elegant Line",
    labelAr: "خط أنيق",
    hint: "Serif-like spacing + gold line",
  },
];

export const HEADER_STYLE_DEFAULTS: Record<
  HeaderStyleId,
  Partial<{
    showLang: boolean;
    showSocial: boolean;
    showDescription: boolean;
    showCategories: boolean;
    logoSize: number;
    sheetRadius: number;
  }>
> = {
  floatingLogo: {
    showLang: true,
    showSocial: true,
    showDescription: true,
    showCategories: false,
    logoSize: 110,
    sheetRadius: 80,
  },
  coffeeDark: {
    showLang: true,
    showSocial: false,
    showDescription: true,
    showCategories: false,
    logoSize: 36,
    sheetRadius: 0,
  },
  exploreRail: {
    showLang: true,
    showSocial: false,
    showDescription: true,
    showCategories: true,
    logoSize: 40,
    sheetRadius: 24,
  },
  brandBar: {
    showLang: true,
    showSocial: true,
    showDescription: true,
    showCategories: false,
    logoSize: 40,
    sheetRadius: 24,
  },
  centeredClassic: {
    showLang: true,
    showSocial: true,
    showDescription: true,
    showCategories: false,
    logoSize: 72,
    sheetRadius: 32,
  },
  fullBleed: {
    showLang: true,
    showSocial: true,
    showDescription: true,
    showCategories: false,
    logoSize: 64,
    sheetRadius: 0,
  },
  asymmetric: {
    showLang: true,
    showSocial: false,
    showDescription: true,
    showCategories: false,
    logoSize: 88,
    sheetRadius: 28,
  },
  neonGlow: {
    showLang: true,
    showSocial: true,
    showDescription: true,
    showCategories: false,
    logoSize: 56,
    sheetRadius: 16,
  },
  softSheet: {
    showLang: true,
    showSocial: true,
    showDescription: true,
    showCategories: false,
    logoSize: 96,
    sheetRadius: 40,
  },
  magazine: {
    showLang: true,
    showSocial: false,
    showDescription: true,
    showCategories: false,
    logoSize: 48,
    sheetRadius: 0,
  },
  minimalTop: {
    showLang: true,
    showSocial: false,
    showDescription: true,
    showCategories: false,
    logoSize: 32,
    sheetRadius: 24,
  },
  dualTone: {
    showLang: true,
    showSocial: true,
    showDescription: true,
    showCategories: false,
    logoSize: 80,
    sheetRadius: 32,
  },
  waveSheet: {
    showLang: true,
    showSocial: true,
    showDescription: true,
    showCategories: false,
    logoSize: 100,
    sheetRadius: 100,
  },
  stickyCompact: {
    showLang: true,
    showSocial: false,
    showDescription: false,
    showCategories: false,
    logoSize: 44,
    sheetRadius: 16,
  },
  poster: {
    showLang: true,
    showSocial: true,
    showDescription: true,
    showCategories: false,
    logoSize: 56,
    sheetRadius: 0,
  },
  elegantLine: {
    showLang: true,
    showSocial: false,
    showDescription: true,
    showCategories: false,
    logoSize: 64,
    sheetRadius: 0,
  },
};

/** Defaults applied when picking a card preset (can still edit freely after) */
export const CARD_STYLE_DEFAULTS: Record<
  CardStyleId,
  Partial<{
    borderRadius: number;
    imageRatio: number;
    columns: number;
    showBadge: boolean;
    showDescription: boolean;
  }>
> = {
  split: { borderRadius: 28, imageRatio: 0.85, columns: 2, showBadge: true, showDescription: true },
  list: { borderRadius: 16, columns: 1, showBadge: false, showDescription: true },
  compact: { borderRadius: 16, columns: 3, showBadge: false, showDescription: false },
  overlay: { borderRadius: 20, columns: 2, showBadge: true, showDescription: false },
  cover: { borderRadius: 18, columns: 2, showBadge: false, showDescription: true },
  bordered: { borderRadius: 14, columns: 2, showBadge: false, showDescription: true },
  glass: { borderRadius: 22, imageRatio: 0.7, columns: 2, showBadge: true, showDescription: true },
};
