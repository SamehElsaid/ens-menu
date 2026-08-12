import type { IconType } from "react-icons";
import { FaChartLine, FaCreditCard, FaUserAlt } from "react-icons/fa";

import { BiCategory } from "react-icons/bi";
import { FiSettings } from "react-icons/fi";
import { IoMdColorFill } from "react-icons/io";
import { RiGlobalFill } from "react-icons/ri";
import { HiSpeakerphone } from "react-icons/hi";
import {
  MdOutlineDeliveryDining,
  MdOutlineFastfood,
  MdOutlineReorder,
  MdOutlineTableBar,
  MdPeopleOutline,
} from "react-icons/md";
import {
  IoDocumentTextOutline,
  IoLibraryOutline,
  IoPhonePortraitOutline,
  IoPricetagOutline,
  IoReceiptOutline,
  IoSettingsOutline,
  IoStatsChartOutline,
  IoTicketOutline,
  IoTimeOutline,
  IoCallOutline,
  IoSparklesOutline,
  IoMailOutline,
  IoGlobeOutline,
  IoSearchOutline,
  IoStarOutline,
  IoColorPaletteOutline,
  IoListOutline,
} from "react-icons/io5";

export type NavItem = {
  label: string;
  icon: IconType;
  badge?: string;
  /** Resolved at runtime in the sidebar (e.g. pending table orders). */
  dynamicBadge?: "pendingOrders" | "pendingDeliveryOrders";
  badges?: Array<{ label: string; variant: "new" | "beta" | "soon" }>;
  /** Requires Pro plan — locked for free accounts in sidebar. */
  proFeature?: boolean;
  /** Non-clickable placeholder (e.g. coming soon). */
  comingSoon?: boolean;
  key?: string;
  link?: string;
  /** Match route exactly (e.g. settings root vs. settings/design). */
  exactMatch?: boolean;
  navId?: string;
  /** Staff RBAC permission required to see this item (owners/admins always pass). */
  permission?: string;
  /** Owner/admin only — never shown to staff regardless of permissions. */
  ownerOnly?: boolean;
  /** Extra terms the command palette should match on beyond the label. */
  keywords?: string[];
};

export type NavSection = {
  /** Internal key for React lists, and the key into `SECTION_LABEL`. */
  id: string;
  items: NavItem[];
};

/**
 * Console navigation — CONSOLE-REDESIGN.md §2.
 *
 * The rail is one stable frame with two zones. `venueNavSections` fills the
 * upper zone when a venue is selected; `accountNavSections` is the lower zone
 * and is present on every page in the merchant console, including inside a
 * venue. That is the whole point: orders, staff and billing span every venue an
 * account owns, so they must not disappear the moment someone opens one.
 *
 * Consequently nothing appears in both lists. Subscription in particular used to
 * exist in both, pointing at two different URLs — one of which was a redirect.
 * It is an account-level fact and now lives only in the account zone.
 */
export const venueNavSections: NavSection[] = [
  {
    id: "venueOverview",
    items: [
      {
        label: "Overview",
        icon: FaChartLine,
        key: "overview",
        link: "",
        exactMatch: true,
        permission: "dashboard:access",
        keywords: ["home", "summary"],
      },
      {
        label: "analytics",
        icon: IoStatsChartOutline,
        key: "analytics",
        link: "analytics",
        permission: "analytics:view",
        keywords: ["views", "stats", "reports"],
      },
    ],
  },
  {
    id: "venueMenu",
    items: [
      {
        label: "Categories",
        icon: BiCategory,
        key: "categories",
        link: "categories",
        permission: "menu:categories",
      },
      {
        label: "Items",
        icon: MdOutlineFastfood,
        key: "items",
        link: "items",
        permission: "menu:items",
        keywords: ["products", "dishes", "prices"],
      },
      {
        label: "displayOrder",
        icon: MdOutlineReorder,
        key: "display-order",
        link: "display-order",
        permission: "menu:items",
        keywords: ["sort", "arrange", "reorder"],
      },
      {
        label: "tables",
        icon: MdOutlineTableBar,
        key: "tables",
        link: "table",
        proFeature: true,
        permission: "menu:tables",
        keywords: ["qr", "seating"],
      },
      {
        label: "Advertisements",
        icon: HiSpeakerphone,
        key: "advertisements",
        link: "advertisements",
        permission: "ads:manage",
        keywords: ["ads", "promotions", "banners"],
      },
      {
        label: "menuImport",
        icon: IoSparklesOutline,
        key: "import",
        link: "import",
        permission: "menu:import",
        badges: [{ label: "badgeBeta", variant: "beta" }],
        keywords: ["ai", "upload", "scan"],
      },
    ],
  },
  {
    id: "venueSettings",
    items: [
      {
        label: "settingsGeneral",
        icon: FiSettings,
        key: "settings",
        link: "settings",
        exactMatch: true,
        navId: "onboarding-sidebar-settings-general",
        permission: "settings:manage",
      },
      {
        label: "settingsDesign",
        icon: IoMdColorFill,
        key: "settings-design",
        link: "settings/design",
        navId: "onboarding-sidebar-settings-design",
        permission: "settings:manage",
        keywords: ["theme", "template", "colours"],
      },
      {
        label: "settingsMedia",
        icon: RiGlobalFill,
        key: "settings-media",
        link: "settings/media",
        navId: "onboarding-sidebar-settings-media",
        permission: "settings:manage",
        keywords: ["logo", "images", "social"],
      },
      {
        label: "settingsGoogleReviews",
        icon: IoStarOutline,
        key: "settings-google-reviews",
        link: "settings/google-reviews",
        navId: "onboarding-sidebar-settings-google-reviews",
        permission: "settings:manage",
      },
      {
        label: "settingsDelivery",
        icon: MdOutlineDeliveryDining,
        key: "settings-delivery",
        link: "settings/delivery",
        navId: "onboarding-sidebar-settings-delivery",
        permission: "settings:manage",
        keywords: ["zones", "shipping", "branches"],
      },
      {
        label: "domainTransfer",
        icon: IoGlobeOutline,
        key: "domain-transfer",
        link: "domain-transfer",
        ownerOnly: true,
        keywords: ["dns", "custom domain"],
      },
      /* A plan is bought per menu in this product, not per account, so billing
         belongs to the venue zone. The account-level `/dashboard/subscription`
         URL survives for existing deep links but is no longer advertised as a
         destination, because it can only guess which menu you meant. */
      {
        label: "Subscription",
        icon: FaCreditCard,
        key: "subscription",
        link: "subscription",
        ownerOnly: true,
        keywords: ["billing", "plan", "invoice", "upgrade", "pro"],
      },
    ],
  },
  {
    id: "venueActivity",
    items: [
      {
        label: "history",
        icon: IoTimeOutline,
        key: "history",
        link: "history",
        permission: "orders:view",
        keywords: ["audit", "log", "changes"],
      },
      {
        label: "ratings",
        icon: IoStarOutline,
        key: "ratings",
        link: "ratings",
        permission: "analytics:view",
        keywords: ["reviews", "feedback"],
      },
    ],
  },
];

/**
 * The lower zone — one flat group of five. The zone is titled "Account" in the
 * rail, so sub-headings here would label rows that are already labelled.
 *
 * Orders, delivery and staff span every menu the account owns. Personal is the
 * signed-in user's own profile and has nothing to do with any single menu,
 * which is why it moved out of `/dashboard/{menu}/personal`.
 */
export const accountNavSections: NavSection[] = [
  {
    id: "accountMain",
    items: [
      {
        label: "myMenus",
        icon: IoLibraryOutline,
        key: "menus",
        link: "",
        permission: "dashboard:access",
        keywords: ["venues", "all menus", "switch"],
      },
      {
        label: "orders",
        icon: IoReceiptOutline,
        key: "orders",
        link: "orders",
        proFeature: true,
        dynamicBadge: "pendingOrders",
        permission: "orders:view",
        keywords: ["tickets", "kitchen"],
      },
      {
        label: "deliveryOrders",
        icon: MdOutlineDeliveryDining,
        key: "delivery-orders",
        link: "delivery-orders",
        dynamicBadge: "pendingDeliveryOrders",
        permission: "delivery:view",
      },
      {
        label: "staff",
        icon: MdPeopleOutline,
        key: "staff",
        link: "staff",
        proFeature: true,
        permission: "staff:manage",
        keywords: ["team", "roles", "permissions"],
      },
      {
        label: "Personal",
        icon: FaUserAlt,
        key: "personal",
        link: "personal",
        ownerOnly: true,
        keywords: ["profile", "password", "phone", "account"],
      },
    ],
  },
];

/**
 * Back office — CONSOLE-REDESIGN.md §2.
 *
 * Grouped by the job being done rather than left as one list of fourteen. The
 * groups are what make a rail of this length scannable: nobody reads past about
 * seven undifferentiated rows.
 *
 * `administrators/log` is included deliberately — the page existed but appeared
 * in no rail, so the only route to it was a link on the administrators page.
 */
export const adminNavSections: NavSection[] = [
  {
    id: "adminOverview",
    items: [
      {
        label: "Overview",
        icon: FaChartLine,
        key: "overview",
        link: "",
        exactMatch: true,
        keywords: ["home", "dashboard"],
      },
      {
        label: "analytics",
        icon: IoStatsChartOutline,
        key: "analytics",
        link: "analytics",
        keywords: ["growth", "reports", "platform"],
      },
    ],
  },
  {
    id: "adminCustomers",
    items: [
      {
        label: "users",
        icon: FaUserAlt,
        key: "users",
        link: "users",
        keywords: ["accounts", "merchants", "customers"],
      },
      {
        label: "followUps",
        icon: IoCallOutline,
        key: "follow-ups",
        link: "follow-ups",
        keywords: ["sales", "calls", "queue"],
      },
      {
        label: "customerEmails",
        icon: IoMailOutline,
        key: "broadcast",
        link: "broadcast",
        keywords: ["email", "campaign", "announce"],
      },
      {
        label: "domainTransfers",
        icon: IoGlobeOutline,
        key: "domain-transfers",
        link: "domain-transfers",
        keywords: ["dns", "requests"],
      },
    ],
  },
  {
    id: "adminRevenue",
    items: [
      {
        label: "plans",
        icon: IoDocumentTextOutline,
        key: "plans",
        link: "plans",
        keywords: ["pricing", "tiers", "limits"],
      },
      {
        label: "payments",
        icon: FaCreditCard,
        key: "payments",
        link: "payments",
        keywords: ["transactions", "revenue", "ledger"],
      },
      {
        label: "vouchers",
        icon: IoTicketOutline,
        key: "vouchers",
        link: "vouchers",
        keywords: ["coupons", "discount", "codes"],
      },
      {
        label: "promo",
        icon: IoPricetagOutline,
        key: "promo",
        link: "promo",
        keywords: ["banner", "offer"],
      },
    ],
  },
  {
    id: "adminContent",
    items: [
      {
        label: "knowledgeManagement",
        icon: IoLibraryOutline,
        key: "knowledge-management",
        link: "knowledge-management",
        keywords: ["help", "articles", "docs"],
      },
      {
        label: "metadata",
        icon: IoSearchOutline,
        key: "metadata",
        link: "metadata",
        keywords: ["seo", "title", "description"],
      },
      {
        label: "templateBuilder",
        icon: IoColorPaletteOutline,
        key: "templates",
        link: "template",
        keywords: ["design", "builder", "themes"],
      },
      {
        label: "advertisements",
        icon: HiSpeakerphone,
        key: "advertisements",
        link: "advertisements",
        keywords: ["ads", "banners"],
      },
    ],
  },
  {
    id: "adminPlatform",
    items: [
      {
        label: "administrators",
        icon: IoSettingsOutline,
        key: "administrators",
        link: "administrators",
        keywords: ["admins", "access", "permissions"],
      },
      {
        label: "adminActivityLog",
        icon: IoListOutline,
        key: "administrators-log",
        link: "administrators/log",
        keywords: ["audit", "history", "who did"],
      },
      {
        label: "appVersion",
        icon: IoPhonePortraitOutline,
        key: "app-version",
        link: "app-version",
        keywords: ["mobile", "release", "build"],
      },
      {
        label: "Personal",
        icon: FaUserAlt,
        key: "personal",
        link: "personal",
        keywords: ["profile", "password"],
      },
    ],
  },
];
