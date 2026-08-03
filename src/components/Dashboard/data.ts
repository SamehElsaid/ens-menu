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
  /** Staff RBAC permission required to see this item (owners/admins always pass). */
  permission?: string;
  /** Owner/admin only — never shown to staff regardless of permissions. */
  ownerOnly?: boolean;
  children?: NavItem[];
};

export type NavSection = {
  /** Internal key for React lists */
  id: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    id: "overview",
    items: [
      {
        label: "Overview",
        icon: FaChartLine,
        key: "overview",
        link: "",
        permission: "dashboard:access",
      },
      {
        label: "analytics",
        icon: IoStatsChartOutline,
        key: "analytics",
        link: "analytics",
        permission: "analytics:view",
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
        ownerOnly: true,
      },
      {
        label: "Subscription",
        icon: FaCreditCard,
        key: "subscription",
        link: "subscription",
        ownerOnly: true,
      },
      {
        label: "domainTransfer",
        icon: IoGlobeOutline,
        key: "domain-transfer",
        link: "domain-transfer",
        ownerOnly: true,
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
        permission: "menu:import",
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
        permission: "menu:categories",
      },
      {
        label: "Items",
        icon: MdOutlineFastfood,
        key: "items",
        link: "items",
        permission: "menu:items",
      },
      {
        label: "displayOrder",
        icon: MdOutlineReorder,
        key: "display-order",
        link: "display-order",
        permission: "menu:items",
      },
      {
        label: "tables",
        icon: MdOutlineTableBar,
        key: "tables",
        link: "table",
        proFeature: true,
        permission: "menu:tables",
      },
      {
        label: "Advertisements",
        icon: HiSpeakerphone,
        key: "advertisements",
        link: "advertisements",
        permission: "ads:manage",
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
        permission: "settings:manage",
      },
      {
        label: "settingsDesign",
        icon: IoMdColorFill,
        key: "settings-design",
        link: "settings/design",
        navId: "onboarding-sidebar-settings-design",
        permission: "settings:manage",
      },
      {
        label: "settingsMedia",
        icon: RiGlobalFill,
        key: "settings-media",
        link: "settings/media",
        navId: "onboarding-sidebar-settings-media",
        permission: "settings:manage",
      },
      {
        label: "settingsDelivery",
        icon: MdOutlineDeliveryDining,
        key: "settings-delivery",
        link: "settings/delivery",
        navId: "onboarding-sidebar-settings-delivery",
        permission: "settings:manage",
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
        permission: "orders:view",
      },
      {
        label: "ratings",
        icon: IoStarOutline,
        key: "ratings",
        link: "ratings",
        permission: "analytics:view",
      },
    ],
  },
];

/**
 * Sidebar for `/dashboard` itself. Orders and staff are account-level: they
 * span every menu the signed-in account can reach, so they live here rather
 * than inside a single menu's sidebar.
 */
export const accountNavSections: NavSection[] = [
  {
    id: "accountOverview",
    items: [
      {
        label: "myMenus",
        icon: IoLibraryOutline,
        key: "menus",
        link: "",
        permission: "dashboard:access",
      },
    ],
  },
  {
    id: "accountOperations",
    items: [
      {
        label: "orders",
        icon: IoReceiptOutline,
        key: "orders",
        link: "orders",
        proFeature: true,
        dynamicBadge: "pendingOrders",
        permission: "orders:view",
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
      },
    ],
  },
  {
    id: "accountSettings",
    items: [
      {
        label: "Subscription",
        icon: FaCreditCard,
        key: "subscription",
        link: "subscription",
        ownerOnly: true,
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
      {
        label: "metadata",
        icon: IoSearchOutline,
        key: "metadata",
        link: "metadata",
      },
      {
        label: "templateBuilder",
        icon: IoColorPaletteOutline,
        key: "templates",
        link: "template",
      },
    ],
  },
];
