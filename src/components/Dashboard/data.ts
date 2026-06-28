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
} from "react-icons/io5";

export type NavItem = {
  label: string;
  icon: IconType;
  badge?: string;
  /** Resolved at runtime in the sidebar (e.g. pending table orders). */
  dynamicBadge?: "pendingOrders" | "pendingDeliveryOrders";
  badges?: Array<{ label: string; variant: "new" | "beta" | "soon" }>;
  /** Visual cluster within a section (e.g. table ordering). */
  subgroup?: string;
  /** Requires Pro plan — locked for free accounts in sidebar. */
  proFeature?: boolean;
  /** Non-clickable placeholder (e.g. coming soon). */
  comingSoon?: boolean;
  active?: boolean;
  key?: string;
  link?: string;
  parentLink?: string;
  dependentParent?: boolean;
  /** Match route exactly (e.g. settings root vs. settings/design). */
  exactMatch?: boolean;
  navId?: string;
  children?: NavItem[];
};

export type NavSection = {
  /** Internal key for React lists */
  id: string;
  items: NavItem[];
};

/** Cashier staff: operational pages — no profile, subscription, settings, staff, or ads. */
export const cashierNavSections: NavSection[] = [
  {
    id: "overview",
    items: [
      {
        label: "Overview",
        icon: FaChartLine,
        key: "overview",
        link: "",
      },
    ],
  },
  {
    id: "import",
    items: [
      {
        label: "menuImport",
        icon: IoSparklesOutline,
        key: "import",
        link: "import",
        badges: [
          { label: "badgeNew", variant: "new" },
          { label: "badgeBeta", variant: "beta" },
        ],
      },
    ],
  },
  {
    id: "menu",
    items: [
      {
        label: "Categories",
        icon: BiCategory,
        key: "categories",
        link: "categories",
      },
      {
        label: "Items",
        icon: MdOutlineFastfood,
        key: "items",
        link: "items",
      },
      {
        label: "tables",
        icon: MdOutlineTableBar,
        key: "tables",
        link: "table",
        subgroup: "tableOps",
        proFeature: true,
      },
      {
        label: "orders",
        icon: IoReceiptOutline,
        key: "orders",
        link: "orders",
        subgroup: "tableOps",
        proFeature: true,
        dynamicBadge: "pendingOrders",
      },
      {
        label: "deliveryOrders",
        icon: MdOutlineDeliveryDining,
        key: "delivery-orders",
        link: "delivery-orders",
        subgroup: "tableOps",
        dynamicBadge: "pendingDeliveryOrders",
      },
    ],
  },
  {
    id: "activity",
    items: [
      {
        label: "history",
        icon: IoTimeOutline,
        key: "history",
        link: "history",
      },
    ],
  },
];

export const navSections: NavSection[] = [
  {
    id: "overview",
    items: [
      {
        label: "Overview",
        icon: FaChartLine,
        key: "overview",
        link: "",
      },
      {
        label: "analytics",
        icon: IoStatsChartOutline,
        key: "analytics",
        link: "analytics",
      },
    ],
  },
  {
    id: "account",
    items: [
      {
        label: "Personal",
        icon: FaUserAlt,
        key: "personal",
        link: "personal",
      },
      {
        label: "Subscription",
        icon: FaCreditCard,
        key: "subscription",
        link: "subscription",
      },
      {
        label: "domainTransfer",
        icon: IoGlobeOutline,
        key: "domain-transfer",
        link: "domain-transfer",
      },
    ],
  },
  {
    id: "import",
    items: [
      {
        label: "menuImport",
        icon: IoSparklesOutline,
        key: "import",
        link: "import",
        badges: [
          { label: "badgeNew", variant: "new" },
          { label: "badgeBeta", variant: "beta" },
        ],
      },
    ],
  },
  {
    id: "menu",
    items: [
      {
        label: "Categories",
        icon: BiCategory,
        key: "categories",
        link: "categories",
      },
      {
        label: "Items",
        icon: MdOutlineFastfood,
        key: "items",
        link: "items",
      },
      {
        label: "tables",
        icon: MdOutlineTableBar,
        key: "tables",
        link: "table",
        subgroup: "tableOps",
        proFeature: true,
      },
      {
        label: "orders",
        icon: IoReceiptOutline,
        key: "orders",
        link: "orders",
        subgroup: "tableOps",
        proFeature: true,
        dynamicBadge: "pendingOrders",
      },
      {
        label: "deliveryOrders",
        icon: MdOutlineDeliveryDining,
        key: "delivery-orders",
        link: "delivery-orders",
        subgroup: "tableOps",
        dynamicBadge: "pendingDeliveryOrders",
      },
      {
        label: "staff",
        icon: MdPeopleOutline,
        key: "staff",
        link: "staff",
        proFeature: true,
      },
      {
        label: "Advertisements",
        icon: HiSpeakerphone,
        key: "advertisements",
        link: "advertisements",
      },
    ],
  },
  {
    id: "settings",
    items: [
      {
        label: "settingsGeneral",
        icon: FiSettings,
        key: "settings",
        link: "settings",
        exactMatch: true,
        navId: "onboarding-sidebar-settings-general",
      },
      {
        label: "settingsDesign",
        icon: IoMdColorFill,
        key: "settings-design",
        link: "settings/design",
        navId: "onboarding-sidebar-settings-design",
      },
      {
        label: "settingsMedia",
        icon: RiGlobalFill,
        key: "settings-media",
        link: "settings/media",
        navId: "onboarding-sidebar-settings-media",
      },
      {
        label: "settingsDelivery",
        icon: MdOutlineDeliveryDining,
        key: "settings-delivery",
        link: "settings/delivery",
        navId: "onboarding-sidebar-settings-delivery",
      },
    ],
  },
  {
    id: "activity",
    items: [
      {
        label: "history",
        icon: IoTimeOutline,
        key: "history",
        link: "history",
      },
    ],
  },
];

export const adminNavSections: NavSection[] = [
  {
    id: "overview",
    items: [
      {
        label: "Overview",
        icon: FaChartLine,
        key: "overview",
        link: "",
      },
      {
        label: "analytics",
        icon: IoStatsChartOutline,
        key: "analytics",
        link: "analytics",
      },
    ],
  },
  {
    id: "account",
    items: [
      {
        label: "Personal",
        icon: FaUserAlt,
        key: "personal",
        link: "personal",
      },
    ],
  },
  {
    id: "admin",
    items: [
      { label: "users", icon: FaUserAlt, key: "users", link: "users" },
      {
        label: "customerEmails",
        icon: IoMailOutline,
        key: "broadcast",
        link: "broadcast",
      },
      {
        label: "followUps",
        icon: IoCallOutline,
        key: "follow-ups",
        link: "follow-ups",
      },
      {
        label: "domainTransfers",
        icon: IoGlobeOutline,
        key: "domain-transfers",
        link: "domain-transfers",
      },
      {
        label: "plans",
        icon: IoDocumentTextOutline,
        key: "plans",
        link: "plans",
      },
      {
        label: "payments",
        icon: FaCreditCard,
        key: "payments",
        link: "payments",
      },
      {
        label: "advertisements",
        icon: HiSpeakerphone,
        key: "advertisements",
        link: "advertisements",
      },
      {
        label: "administrators",
        icon: IoSettingsOutline,
        key: "administrators",
        link: "administrators",
      },
      {
        label: "appVersion",
        icon: IoPhonePortraitOutline,
        key: "app-version",
        link: "app-version",
      },
      {
        label: "promo",
        icon: IoPricetagOutline,
        key: "promo",
        link: "promo",
      },
      {
        label: "vouchers",
        icon: IoTicketOutline,
        key: "vouchers",
        link: "vouchers",
      },
      {
        label: "knowledgeManagement",
        icon: IoLibraryOutline,
        key: "knowledge-management",
        link: "knowledge-management",
      },
    ],
  },
];
